/**
 * Learning Pathway Routes
 * API endpoints for personalized learning path management
 */

const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const pathwayGeneratorService = require('../services/pathwayGeneratorService');
const LearningPathway = require('../models/LearningPathway');
const logger = require('../utils/logger');

/**
 * @route   POST /api/learning-pathway/generate
 * @desc    Generate personalized learning pathway
 * @access  Private
 */
router.post('/generate', protect, async (req, res) => {
    try {
        const userId = req.user._id;
        const options = req.body;

        const pathway = await pathwayGeneratorService.generatePathway(userId, options);

        res.status(201).json({
            success: true,
            data: pathway
        });
    } catch (error) {
        logger.error('Error generating pathway:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error generating learning pathway'
        });
    }
});

/**
 * @route   GET /api/learning-pathway/active
 * @desc    Get active learning pathway for current user
 * @access  Private
 */
router.get('/active', protect, async (req, res) => {
    try {
        const userId = req.user._id;
        const pathway = await LearningPathway.getActivePathway(userId);

        if (!pathway) {
            return res.status(404).json({
                success: false,
                message: 'No active learning pathway found. Generate one to get started!'
            });
        }

        res.json({
            success: true,
            data: pathway
        });
    } catch (error) {
        logger.error('Error getting active pathway:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving learning pathway',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/learning-pathway/recommendations
 * @desc    Get personalized module recommendations
 * @access  Private
 */
router.get('/recommendations', protect, async (req, res) => {
    try {
        const userId = req.user._id;
        const recommendations = await pathwayGeneratorService.getRecommendations(userId);

        res.json({
            success: true,
            data: recommendations
        });
    } catch (error) {
        logger.error('Error getting recommendations:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving recommendations',
            error: error.message
        });
    }
});

/**
 * @route   POST /api/learning-pathway/complete-module
 * @desc    Mark module as completed in pathway
 * @access  Private
 */
router.post('/complete-module', protect, async (req, res) => {
    try {
        const userId = req.user._id;
        const { moduleId, hoursSpent } = req.body;

        const pathway = await LearningPathway.getActivePathway(userId);

        if (!pathway) {
            return res.status(404).json({
                success: false,
                message: 'No active pathway found'
            });
        }

        await pathway.completeModule(moduleId, hoursSpent);

        // Check if adaptation is needed
        const adaptationCheck = await pathwayGeneratorService.checkForAdaptation(userId);

        let adaptationMessage = null;
        if (adaptationCheck?.shouldAdapt) {
            adaptationMessage = adaptationCheck.reason;
        }

        res.json({
            success: true,
            data: pathway,
            adaptationSuggested: adaptationCheck?.shouldAdapt || false,
            adaptationMessage
        });
    } catch (error) {
        logger.error('Error completing module:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating pathway',
            error: error.message
        });
    }
});

/**
 * @route   POST /api/learning-pathway/adapt
 * @desc    Adapt learning pathway based on performance
 * @access  Private
 */
router.post('/adapt', protect, async (req, res) => {
    try {
        const userId = req.user._id;
        const { reason, changes } = req.body;

        const pathway = await pathwayGeneratorService.adaptPathway(userId, reason, changes);

        res.json({
            success: true,
            data: pathway,
            message: 'Learning pathway adapted successfully'
        });
    } catch (error) {
        logger.error('Error adapting pathway:', error);
        res.status(500).json({
            success: false,
            message: 'Error adapting pathway',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/learning-pathway/check-adaptation
 * @desc    Check if pathway needs adaptation
 * @access  Private
 */
router.get('/check-adaptation', protect, async (req, res) => {
    try {
        const userId = req.user._id;
        const check = await pathwayGeneratorService.checkForAdaptation(userId);

        res.json({
            success: true,
            data: check
        });
    } catch (error) {
        logger.error('Error checking adaptation:', error);
        res.status(500).json({
            success: false,
            message: 'Error checking adaptation needs',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/learning-pathway/history
 * @desc    Get pathway history for current user
 * @access  Private
 */
router.get('/history', protect, async (req, res) => {
    try {
        const userId = req.user._id;
        const pathways = await LearningPathway.find({ userId })
            .sort({ createdDate: -1 })
            .limit(10)
            .select('-modules.moduleId'); // Exclude full module details for performance

        res.json({
            success: true,
            data: pathways
        });
    } catch (error) {
        logger.error('Error getting pathway history:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving pathway history',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/learning-pathway/admin/statistics
 * @desc    Get pathway statistics
 * @access  Private (Admin only)
 */
router.get('/admin/statistics', protect, authorize('admin', 'researcher'), async (req, res) => {
    try {
        const filters = {
            targetLevel: req.query.targetLevel
        };

        const statistics = await LearningPathway.getPathwayStatistics(filters);

        res.json({
            success: true,
            data: statistics
        });
    } catch (error) {
        logger.error('Error getting pathway statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving statistics',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/learning-pathway/admin/user/:userId
 * @desc    Get pathway for specific user (admin)
 * @access  Private (Admin only)
 */
router.get('/admin/user/:userId', protect, authorize('admin', 'researcher'), async (req, res) => {
    try {
        const { userId } = req.params;
        const pathway = await LearningPathway.getActivePathway(userId);

        if (!pathway) {
            return res.status(404).json({
                success: false,
                message: 'No active pathway found for user'
            });
        }

        res.json({
            success: true,
            data: pathway
        });
    } catch (error) {
        logger.error('Error getting user pathway (admin):', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving user pathway',
            error: error.message
        });
    }
});

/**
 * @route   POST /api/learning-pathway/admin/generate/:userId
 * @desc    Generate pathway for specific user (admin)
 * @access  Private (Admin only)
 */
router.post('/admin/generate/:userId', protect, authorize('admin'), async (req, res) => {
    try {
        const { userId } = req.params;
        const options = req.body;

        const pathway = await pathwayGeneratorService.generatePathway(userId, options);

        res.status(201).json({
            success: true,
            data: pathway
        });
    } catch (error) {
        logger.error('Error generating pathway (admin):', error);
        res.status(500).json({
            success: false,
            message: 'Error generating pathway',
            error: error.message
        });
    }
});

module.exports = router;
