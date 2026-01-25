/**
 * Intervention Routes
 * API endpoints for dropout prevention interventions
 */

const express = require('express');
const router = express.Router();
const { auth, adminAuth } = require('../middleware/auth');
const interventionService = require('../services/intervention/InterventionService');
const riskCalculator = require('../services/intervention/RiskCalculator');
const logger = require('../utils/logger');

/**
 * @route   GET /api/v1/interventions/my-risk
 * @desc    Get current user's dropout risk score
 * @access  Private
 */
router.get('/my-risk', auth, async (req, res) => {
    try {
        const risk = await riskCalculator.calculateRiskScore(req.user.id);
        res.json({ success: true, risk });
    } catch (error) {
        logger.error('Error calculating risk:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to calculate risk score'
        });
    }
});

/**
 * @route   GET /api/v1/interventions/my-notifications
 * @desc    Get current user's intervention notifications
 * @access  Private
 */
router.get('/my-notifications', auth, async (req, res) => {
    try {
        const interventions = await interventionService.getUserInterventions(req.user.id);
        res.json({
            success: true,
            count: interventions.length,
            interventions
        });
    } catch (error) {
        logger.error('Error getting interventions:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get notifications'
        });
    }
});

/**
 * @route   POST /api/v1/interventions/:id/acknowledge
 * @desc    Acknowledge an intervention notification
 * @access  Private
 */
router.post('/:id/acknowledge', auth, async (req, res) => {
    try {
        const intervention = await interventionService.acknowledgeIntervention(req.params.id);
        res.json({
            success: true,
            message: 'Intervention acknowledged',
            intervention
        });
    } catch (error) {
        logger.error('Error acknowledging intervention:', error);
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * @route   GET /api/v1/interventions/users-at-risk
 * @desc    Get all users at risk (admin)
 * @access  Admin
 */
router.get('/users-at-risk', adminAuth, async (req, res) => {
    try {
        const threshold = parseInt(req.query.threshold) || 60;
        const usersAtRisk = await riskCalculator.getUsersAtRisk(threshold);

        res.json({
            success: true,
            threshold,
            count: usersAtRisk.length,
            users: usersAtRisk
        });
    } catch (error) {
        logger.error('Error getting users at risk:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get users at risk'
        });
    }
});

/**
 * @route   GET /api/v1/interventions/user/:userId/risk
 * @desc    Get specific user's risk score (admin)
 * @access  Admin
 */
router.get('/user/:userId/risk', adminAuth, async (req, res) => {
    try {
        const risk = await riskCalculator.calculateRiskScore(req.params.userId);
        res.json({ success: true, risk });
    } catch (error) {
        logger.error('Error calculating user risk:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to calculate risk score'
        });
    }
});

/**
 * @route   POST /api/v1/interventions/check/:userId
 * @desc    Check and trigger intervention for user (admin)
 * @access  Admin
 */
router.post('/check/:userId', adminAuth, async (req, res) => {
    try {
        const result = await interventionService.checkAndIntervene(req.params.userId);
        res.json({ success: true, ...result });
    } catch (error) {
        logger.error('Error checking intervention:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to check intervention'
        });
    }
});

/**
 * @route   POST /api/v1/interventions/run-daily-check
 * @desc    Run daily risk check for all users (admin/cron)
 * @access  Admin
 */
router.post('/run-daily-check', adminAuth, async (req, res) => {
    try {
        const result = await interventionService.runDailyRiskCheck();
        res.json({ success: true, ...result });
    } catch (error) {
        logger.error('Error running daily check:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to run daily check'
        });
    }
});

/**
 * @route   POST /api/v1/interventions/deliver-pending
 * @desc    Deliver pending interventions (admin/cron)
 * @access  Admin
 */
router.post('/deliver-pending', adminAuth, async (req, res) => {
    try {
        const results = await interventionService.deliverPendingInterventions();
        res.json({
            success: true,
            delivered: results.filter(r => r.status === 'delivered').length,
            failed: results.filter(r => r.status === 'failed').length,
            results
        });
    } catch (error) {
        logger.error('Error delivering interventions:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to deliver interventions'
        });
    }
});

/**
 * @route   GET /api/v1/interventions/stats
 * @desc    Get intervention statistics (admin)
 * @access  Admin
 */
router.get('/stats', adminAuth, async (req, res) => {
    try {
        const stats = await interventionService.getInterventionStats();
        res.json({ success: true, stats });
    } catch (error) {
        logger.error('Error getting intervention stats:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get statistics'
        });
    }
});

module.exports = router;
