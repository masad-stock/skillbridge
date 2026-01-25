const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const BaselineAssessmentService = require('../services/research/BaselineAssessmentService');
const logger = require('../utils/logger');

/**
 * @route   GET /api/v1/research-assessments/generate/:skillCategory
 * @desc    Generate a standardized assessment for a skill category
 * @access  Private
 */
router.get('/generate/:skillCategory', auth, async (req, res) => {
    try {
        const { skillCategory } = req.params;
        const { assessmentType = 'baseline' } = req.query;

        const assessment = await BaselineAssessmentService.generateAssessment(
            req.user.id,
            skillCategory,
            assessmentType
        );

        res.json({
            success: true,
            data: assessment
        });
    } catch (error) {
        logger.error('Error generating assessment:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate assessment',
            error: error.message
        });
    }
});

/**
 * @route   POST /api/v1/research-assessments/submit
 * @desc    Submit and score an assessment
 * @access  Private
 */
router.post('/submit', auth, async (req, res) => {
    try {
        const assessmentData = {
            ...req.body,
            userId: req.user.id
        };

        const result = await BaselineAssessmentService.submitAssessment(
            req.user.id,
            assessmentData
        );

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        logger.error('Error submitting assessment:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit assessment',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/v1/research-assessments/history
 * @desc    Get assessment history for current user
 * @access  Private
 */
router.get('/history', auth, async (req, res) => {
    try {
        const { skillCategory } = req.query;

        const history = await BaselineAssessmentService.getAssessmentHistory(
            req.user.id,
            skillCategory
        );

        res.json({
            success: true,
            data: history
        });
    } catch (error) {
        logger.error('Error getting assessment history:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get assessment history',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/v1/research-assessments/needs-baseline
 * @desc    Check if user needs to complete baseline assessment
 * @access  Private
 */
router.get('/needs-baseline', auth, async (req, res) => {
    try {
        const needsBaseline = await BaselineAssessmentService.needsBaselineAssessment(
            req.user.id
        );

        res.json({
            success: true,
            data: { needsBaseline }
        });
    } catch (error) {
        logger.error('Error checking baseline assessment:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to check baseline assessment',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/v1/research-assessments/due-followups
 * @desc    Get due follow-up assessments for current user
 * @access  Private
 */
router.get('/due-followups', auth, async (req, res) => {
    try {
        const dueFollowUps = await BaselineAssessmentService.getDueFollowUps(
            req.user.id
        );

        res.json({
            success: true,
            data: dueFollowUps
        });
    } catch (error) {
        logger.error('Error getting due follow-ups:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get due follow-ups',
            error: error.message
        });
    }
});

module.exports = router;
