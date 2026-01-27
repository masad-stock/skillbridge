/**
 * Economic Survey Routes
 * API endpoints for economic impact tracking
 */

const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const economicSurveyService = require('../services/economicSurveyService');
const logger = require('../utils/logger');

/**
 * @route   POST /api/economic-survey
 * @desc    Submit or update economic survey
 * @access  Private
 */
router.post('/', protect, async (req, res) => {
    try {
        const userId = req.user._id;
        const surveyData = req.body;

        const survey = await economicSurveyService.submitSurvey(userId, surveyData);

        res.status(201).json({
            success: true,
            data: survey
        });
    } catch (error) {
        logger.error('Error submitting economic survey:', error);
        res.status(500).json({
            success: false,
            message: 'Error submitting survey',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/economic-survey/my-surveys
 * @desc    Get all surveys for current user with comparison
 * @access  Private
 */
router.get('/my-surveys', protect, async (req, res) => {
    try {
        const userId = req.user._id;
        const result = await economicSurveyService.getUserSurveys(userId);

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        logger.error('Error getting user surveys:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving surveys',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/economic-survey/pending
 * @desc    Get pending surveys for current user
 * @access  Private
 */
router.get('/pending', protect, async (req, res) => {
    try {
        const userId = req.user._id;
        const pending = await economicSurveyService.getPendingSurveys(userId);

        res.json({
            success: true,
            data: pending
        });
    } catch (error) {
        logger.error('Error getting pending surveys:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving pending surveys',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/economic-survey/:surveyType
 * @desc    Get specific survey type for current user
 * @access  Private
 */
router.get('/:surveyType', protect, async (req, res) => {
    try {
        const userId = req.user._id;
        const { surveyType } = req.params;

        const survey = await economicSurveyService.getSurveyByType(userId, surveyType);

        if (!survey) {
            return res.status(404).json({
                success: false,
                message: 'Survey not found'
            });
        }

        res.json({
            success: true,
            data: survey
        });
    } catch (error) {
        logger.error('Error getting survey by type:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving survey',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/economic-survey/admin/aggregate-impact
 * @desc    Get aggregate economic impact statistics
 * @access  Private (Admin only)
 */
router.get('/admin/aggregate-impact', protect, authorize('admin', 'researcher'), async (req, res) => {
    try {
        const filters = {
            surveyType: req.query.surveyType,
            startDate: req.query.startDate,
            endDate: req.query.endDate
        };

        const impact = await economicSurveyService.getAggregateImpact(filters);

        res.json({
            success: true,
            data: impact
        });
    } catch (error) {
        logger.error('Error getting aggregate impact:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving aggregate impact',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/economic-survey/admin/income-distribution
 * @desc    Get income distribution analysis
 * @access  Private (Admin only)
 */
router.get('/admin/income-distribution', protect, authorize('admin', 'researcher'), async (req, res) => {
    try {
        const { surveyType } = req.query;
        const distribution = await economicSurveyService.getIncomeDistribution(surveyType);

        res.json({
            success: true,
            data: distribution
        });
    } catch (error) {
        logger.error('Error getting income distribution:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving income distribution',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/economic-survey/admin/cohort-comparison
 * @desc    Get cohort comparison (baseline vs follow-up)
 * @access  Private (Admin only)
 */
router.get('/admin/cohort-comparison', protect, authorize('admin', 'researcher'), async (req, res) => {
    try {
        const comparison = await economicSurveyService.getCohortComparison();

        res.json({
            success: true,
            data: comparison
        });
    } catch (error) {
        logger.error('Error getting cohort comparison:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving cohort comparison',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/economic-survey/admin/completion-rates
 * @desc    Get survey completion rates
 * @access  Private (Admin only)
 */
router.get('/admin/completion-rates', protect, authorize('admin', 'researcher'), async (req, res) => {
    try {
        const rates = await economicSurveyService.getCompletionRates();

        res.json({
            success: true,
            data: rates
        });
    } catch (error) {
        logger.error('Error getting completion rates:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving completion rates',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/economic-survey/admin/user/:userId
 * @desc    Get surveys for specific user (admin)
 * @access  Private (Admin only)
 */
router.get('/admin/user/:userId', protect, authorize('admin', 'researcher'), async (req, res) => {
    try {
        const { userId } = req.params;
        const result = await economicSurveyService.getUserSurveys(userId);

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        logger.error('Error getting user surveys (admin):', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving user surveys',
            error: error.message
        });
    }
});

module.exports = router;
