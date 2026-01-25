/**
 * Experiment Routes
 * API endpoints for A/B testing and experiment management
 */

const express = require('express');
const router = express.Router();
const { auth, adminAuth } = require('../middleware/auth');
const experimentService = require('../services/experiment/ExperimentService');
const groupAssignmentService = require('../services/experiment/GroupAssignmentService');
const statisticalAnalysis = require('../services/experiment/StatisticalAnalysis');
const ResearchEvent = require('../models/ResearchEvent');
const logger = require('../utils/logger');

/**
 * @route   POST /api/v1/experiments
 * @desc    Create new experiment
 * @access  Admin
 */
router.post('/', adminAuth, async (req, res) => {
    try {
        const experiment = await experimentService.createExperiment({
            ...req.body,
            createdBy: req.user.id
        });

        res.status(201).json({
            success: true,
            experiment
        });
    } catch (error) {
        logger.error('Error creating experiment:', error);
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * @route   GET /api/v1/experiments
 * @desc    Get all experiments
 * @access  Admin
 */
router.get('/', adminAuth, async (req, res) => {
    try {
        const { status } = req.query;
        const experiments = await experimentService.getExperiments({ status });

        res.json({
            success: true,
            count: experiments.length,
            experiments
        });
    } catch (error) {
        logger.error('Error getting experiments:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get experiments'
        });
    }
});

/**
 * @route   GET /api/v1/experiments/active
 * @desc    Get active experiments
 * @access  Admin
 */
router.get('/active', adminAuth, async (req, res) => {
    try {
        const experiments = await experimentService.getActiveExperiments();

        res.json({
            success: true,
            count: experiments.length,
            experiments
        });
    } catch (error) {
        logger.error('Error getting active experiments:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get active experiments'
        });
    }
});

/**
 * @route   GET /api/v1/experiments/my-assignments
 * @desc    Get current user's experiment assignments
 * @access  Private
 */
router.get('/my-assignments', auth, async (req, res) => {
    try {
        const assignments = await experimentService.getUserExperiments(req.user.id);

        res.json({
            success: true,
            assignments
        });
    } catch (error) {
        logger.error('Error getting user experiments:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get experiment assignments'
        });
    }
});

/**
 * @route   GET /api/v1/experiments/my-features
 * @desc    Get current user's feature flags based on experiments
 * @access  Private
 */
router.get('/my-features', auth, async (req, res) => {
    try {
        const features = await experimentService.getUserFeatures(req.user.id);

        res.json({
            success: true,
            features
        });
    } catch (error) {
        logger.error('Error getting user features:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get feature flags'
        });
    }
});

/**
 * @route   GET /api/v1/experiments/:id
 * @desc    Get experiment by ID
 * @access  Admin
 */
router.get('/:id', adminAuth, async (req, res) => {
    try {
        const experiment = await experimentService.getExperiment(req.params.id);

        if (!experiment) {
            return res.status(404).json({
                success: false,
                error: 'Experiment not found'
            });
        }

        res.json({
            success: true,
            experiment
        });
    } catch (error) {
        logger.error('Error getting experiment:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get experiment'
        });
    }
});

/**
 * @route   POST /api/v1/experiments/:id/start
 * @desc    Start an experiment
 * @access  Admin
 */
router.post('/:id/start', adminAuth, async (req, res) => {
    try {
        const experiment = await experimentService.startExperiment(req.params.id);

        res.json({
            success: true,
            message: 'Experiment started',
            experiment
        });
    } catch (error) {
        logger.error('Error starting experiment:', error);
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * @route   POST /api/v1/experiments/:id/pause
 * @desc    Pause an experiment
 * @access  Admin
 */
router.post('/:id/pause', adminAuth, async (req, res) => {
    try {
        const experiment = await experimentService.pauseExperiment(req.params.id);

        res.json({
            success: true,
            message: 'Experiment paused',
            experiment
        });
    } catch (error) {
        logger.error('Error pausing experiment:', error);
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * @route   POST /api/v1/experiments/:id/complete
 * @desc    Complete an experiment
 * @access  Admin
 */
router.post('/:id/complete', adminAuth, async (req, res) => {
    try {
        const experiment = await experimentService.completeExperiment(req.params.id);

        res.json({
            success: true,
            message: 'Experiment completed',
            experiment
        });
    } catch (error) {
        logger.error('Error completing experiment:', error);
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * @route   POST /api/v1/experiments/:id/assign
 * @desc    Assign current user to experiment
 * @access  Private
 */
router.post('/:id/assign', auth, async (req, res) => {
    try {
        const result = await groupAssignmentService.assignUserToExperiment(
            req.user.id,
            req.params.id
        );

        res.json({
            success: true,
            ...result
        });
    } catch (error) {
        logger.error('Error assigning user:', error);
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * @route   POST /api/v1/experiments/auto-assign
 * @desc    Auto-assign current user to all active experiments
 * @access  Private
 */
router.post('/auto-assign', auth, async (req, res) => {
    try {
        const assignments = await groupAssignmentService.autoAssignUser(req.user.id);

        res.json({
            success: true,
            assignments
        });
    } catch (error) {
        logger.error('Error auto-assigning user:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to auto-assign to experiments'
        });
    }
});

/**
 * @route   GET /api/v1/experiments/:id/stats
 * @desc    Get experiment statistics
 * @access  Admin
 */
router.get('/:id/stats', adminAuth, async (req, res) => {
    try {
        const stats = await experimentService.getExperimentStats(req.params.id);

        res.json({
            success: true,
            stats
        });
    } catch (error) {
        logger.error('Error getting experiment stats:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get experiment statistics'
        });
    }
});

/**
 * @route   GET /api/v1/experiments/:id/distribution
 * @desc    Get assignment distribution
 * @access  Admin
 */
router.get('/:id/distribution', adminAuth, async (req, res) => {
    try {
        const distribution = await groupAssignmentService.getAssignmentDistribution(req.params.id);

        res.json({
            success: true,
            ...distribution
        });
    } catch (error) {
        logger.error('Error getting distribution:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get assignment distribution'
        });
    }
});

/**
 * @route   GET /api/v1/experiments/:id/validate-balance
 * @desc    Validate assignment balance using chi-square test
 * @access  Admin
 */
router.get('/:id/validate-balance', adminAuth, async (req, res) => {
    try {
        const validation = await groupAssignmentService.validateAssignmentBalance(req.params.id);

        res.json({
            success: true,
            ...validation
        });
    } catch (error) {
        logger.error('Error validating balance:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to validate assignment balance'
        });
    }
});

/**
 * @route   POST /api/v1/experiments/:id/analyze
 * @desc    Run statistical analysis on experiment data
 * @access  Admin
 */
router.post('/:id/analyze', adminAuth, async (req, res) => {
    try {
        const { metric } = req.body;
        const experiment = await experimentService.getExperiment(req.params.id);

        if (!experiment) {
            return res.status(404).json({
                success: false,
                error: 'Experiment not found'
            });
        }

        // Get data for each group
        const controlUsers = experiment.assignments
            .filter(a => a.group === 'control')
            .map(a => a.userId);

        const treatmentUsers = experiment.assignments
            .filter(a => a.group !== 'control')
            .map(a => a.userId);

        // Fetch metric data (e.g., completion rates, scores)
        const metricField = metric || experiment.metrics.primaryMetric;

        // Get aggregated scores from research events
        const controlData = await getGroupMetricData(controlUsers, metricField);
        const treatmentData = await getGroupMetricData(treatmentUsers, metricField);

        if (controlData.length < 2 || treatmentData.length < 2) {
            return res.json({
                success: true,
                message: 'Insufficient data for analysis',
                controlSize: controlData.length,
                treatmentSize: treatmentData.length
            });
        }

        const analysis = statisticalAnalysis.analyzeExperiment(controlData, treatmentData);

        // Update experiment results
        await experimentService.updateResults(req.params.id, {
            sampleSize: analysis.sampleSize.total,
            controlMean: analysis.descriptive.controlMean,
            treatmentMean: analysis.descriptive.treatmentMean,
            effectSize: analysis.effectSize.cohensD,
            pValue: analysis.tTest.pValue,
            confidenceInterval: {
                lower: analysis.confidenceInterval.lower,
                upper: analysis.confidenceInterval.upper
            }
        });

        res.json({
            success: true,
            metric: metricField,
            analysis
        });
    } catch (error) {
        logger.error('Error analyzing experiment:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to analyze experiment'
        });
    }
});

/**
 * @route   DELETE /api/v1/experiments/:id
 * @desc    Delete experiment (draft only)
 * @access  Admin
 */
router.delete('/:id', adminAuth, async (req, res) => {
    try {
        await experimentService.deleteExperiment(req.params.id);

        res.json({
            success: true,
            message: 'Experiment deleted'
        });
    } catch (error) {
        logger.error('Error deleting experiment:', error);
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * Helper function to get metric data for a group of users
 */
async function getGroupMetricData(userIds, metric) {
    if (userIds.length === 0) return [];

    // Map metric names to event types and aggregation
    const metricConfig = {
        'completion_rate': {
            eventType: 'module_complete',
            aggregate: 'count'
        },
        'assessment_score': {
            eventType: 'assessment_complete',
            field: 'eventData.score',
            aggregate: 'avg'
        },
        'time_spent': {
            eventType: 'module_complete',
            field: 'eventData.responseTime',
            aggregate: 'sum'
        }
    };

    const config = metricConfig[metric] || metricConfig['completion_rate'];

    const pipeline = [
        { $match: { userId: { $in: userIds }, eventType: config.eventType } },
        {
            $group: {
                _id: '$userId',
                value: config.aggregate === 'count'
                    ? { $sum: 1 }
                    : config.aggregate === 'avg'
                        ? { $avg: `$${config.field}` }
                        : { $sum: `$${config.field}` }
            }
        }
    ];

    const results = await ResearchEvent.aggregate(pipeline);
    return results.map(r => r.value || 0);
}

module.exports = router;
