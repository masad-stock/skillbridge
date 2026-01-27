const express = require('express');
const router = express.Router();
const Module = require('../models/Module');
const Progress = require('../models/Progress');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const aiService = require('../services/aiService');

// @route   GET /api/v1/learning/modules
// @desc    Get all learning modules
// @access  Private
router.get('/modules', protect, async (req, res) => {
    try {
        const { category, difficulty } = req.query;
        const query = { isActive: true };

        if (category) query.category = category;
        if (difficulty) query.difficulty = parseInt(difficulty);

        const modules = await Module.find(query).sort({ priority: -1, difficulty: 1 });

        res.json({ success: true, count: modules.length, data: modules });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   GET /api/v1/learning/personalized-path
// @desc    Get AI-generated personalized learning path
// @access  Private
router.get('/personalized-path', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const modules = await Module.find({ isActive: true });

        const learningPath = await aiService.generateLearningPath(user, modules);

        res.json({ success: true, data: learningPath });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   POST /api/v1/learning/enroll/:moduleId
// @desc    Enroll in a module
// @access  Private
router.post('/enroll/:moduleId', protect, async (req, res) => {
    try {
        const module = await Module.findById(req.params.moduleId);
        if (!module) {
            return res.status(404).json({ success: false, message: 'Module not found' });
        }

        // Create or update progress
        let progress = await Progress.findOne({ user: req.user.id, module: module._id });

        if (!progress) {
            progress = await Progress.create({
                user: req.user.id,
                module: module._id,
                status: 'in_progress',
                startedAt: Date.now()
            });

            // Update user's enrolled modules
            await User.findByIdAndUpdate(req.user.id, {
                $addToSet: { 'learningProgress.enrolledModules': module._id },
                $set: { 'learningProgress.currentModule': module._id }
            });
        }

        res.json({ success: true, data: progress });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   PUT /api/v1/learning/progress/:moduleId
// @desc    Update learning progress
// @access  Private
router.put('/progress/:moduleId', protect, async (req, res) => {
    try {
        const { progress: progressValue, timeSpent, activity, status, completedAt, score } = req.body;

        console.log('[Learning] Progress update request:', {
            moduleId: req.params.moduleId,
            userId: req.user.id,
            status,
            score,
            progressValue
        });

        let progress = await Progress.findOne({
            user: req.user.id,
            module: req.params.moduleId
        });

        // Create progress record if it doesn't exist
        if (!progress) {
            progress = await Progress.create({
                user: req.user.id,
                module: req.params.moduleId,
                status: 'in_progress',
                startedAt: Date.now()
            });
            console.log('[Learning] Created new progress record');
        }

        // Update progress percentage
        if (progressValue !== undefined) progress.progress = progressValue;
        if (timeSpent) progress.timeSpent += timeSpent;
        progress.lastAccessedAt = Date.now();

        // Add activity (skip if type validation fails)
        if (activity) {
            try {
                progress.activities.push(activity);
            } catch (activityError) {
                console.log('[Learning] Skipping activity due to validation:', activityError.message);
            }
        }

        // Handle explicit status update from frontend (critical for certificate generation)
        if (status === 'completed') {
            progress.status = 'completed';
            progress.completedAt = completedAt ? new Date(completedAt) : Date.now();
            progress.score = score || activity?.score || progressValue || 100;

            console.log('[Learning] Marking module as completed with score:', progress.score);

            // Update user's completed modules
            await User.findByIdAndUpdate(req.user.id, {
                $addToSet: { 'learningProgress.completedModules': req.params.moduleId }
            });
        }
        // Also mark as completed if progress is 100% (backward compatibility)
        else if (progressValue >= 100 && progress.status !== 'completed') {
            progress.status = 'completed';
            progress.completedAt = Date.now();
            progress.score = score || activity?.score || progressValue;

            // Update user's completed modules
            await User.findByIdAndUpdate(req.user.id, {
                $addToSet: { 'learningProgress.completedModules': req.params.moduleId }
            });
        }

        await progress.save();
        console.log('[Learning] Progress saved successfully');

        res.json({ success: true, data: progress });
    } catch (error) {
        console.error('[Learning] Progress update error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   GET /api/v1/learning/my-progress
// @desc    Get user's learning progress
// @access  Private
router.get('/my-progress', protect, async (req, res) => {
    try {
        const progress = await Progress.find({ user: req.user.id })
            .populate('module')
            .sort({ lastAccessedAt: -1 });

        res.json({ success: true, count: progress.length, data: progress });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
