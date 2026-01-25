const express = require('express');
const router = express.Router();
const Assessment = require('../models/Assessment');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const aiService = require('../services/aiService');

// @route   POST /api/v1/assessments/start
// @desc    Start new assessment
// @access  Private
router.post('/start', protect, async (req, res) => {
    try {
        const { type, category } = req.body;

        // Generate adaptive questions based on user profile
        const questions = await aiService.generateAssessmentQuestions(req.user, category);

        const assessment = await Assessment.create({
            user: req.user.id,
            type,
            category,
            questions,
            status: 'in_progress'
        });

        res.json({ success: true, data: assessment });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   POST /api/v1/assessments/:id/submit
// @desc    Submit assessment response
// @access  Private
router.post('/:id/submit', protect, async (req, res) => {
    try {
        const { responses } = req.body;
        const assessment = await Assessment.findById(req.params.id);

        if (!assessment) {
            return res.status(404).json({ success: false, message: 'Assessment not found' });
        }

        if (assessment.user.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        // Process responses and calculate results
        assessment.responses = responses;
        assessment.status = 'completed';
        assessment.completedAt = Date.now();
        assessment.duration = Math.round((Date.now() - assessment.startedAt) / 60000);

        // AI-powered analysis
        const aiAnalysis = await aiService.analyzeAssessment(assessment);
        assessment.aiAnalysis = aiAnalysis;

        // Update user skills profile
        const user = await User.findById(req.user.id);
        user.skillsProfile.assessmentCompleted = true;
        user.skillsProfile.lastAssessmentDate = Date.now();
        user.skillsProfile.competencyLevels = aiAnalysis.competencyLevels;
        user.skillsProfile.overallScore = aiAnalysis.overallScore;

        await assessment.save();
        await user.save();

        res.json({ success: true, data: { assessment, aiAnalysis } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   GET /api/v1/assessments/history
// @desc    Get user assessment history
// @access  Private
router.get('/history', protect, async (req, res) => {
    try {
        const assessments = await Assessment.find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .select('-questions.correctAnswer');

        res.json({ success: true, count: assessments.length, data: assessments });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
