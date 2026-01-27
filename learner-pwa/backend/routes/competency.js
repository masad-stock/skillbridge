/**
 * Competency Evaluation Routes
 * API endpoints for competency assessment and tracking
 */

const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const competencyEvaluationService = require('../services/competencyEvaluationService');
const CompetencyScore = require('../models/CompetencyScore');
const logger = require('../utils/logger');

/**
 * @route   POST /api/competency/evaluate
 * @desc    Trigger competency evaluation for current user
 * @access  Private
 */
router.post('/evaluate', protect, async (req, res) => {
    try {
        const userId = req.user._id;
        const options = req.body;

        const evaluation = await competencyEvaluationService.evaluateUserCompetency(userId, options);

        res.status(201).json({
            success: true,
            data: evaluation
        });
    } catch (error) {
        logger.error('Error evaluating competency:', error);
        res.status(500).json({
            success: false,
            message: 'Error evaluating competency',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/competency/latest
 * @desc    Get latest competency evaluation for current user
 * @access  Private
 */
router.get('/latest', protect, async (req, res) => {
    try {
        const userId = req.user._id;
        const evaluation = await CompetencyScore.getLatestForUser(userId);

        if (!evaluation) {
            return res.status(404).json({
                success: false,
                message: 'No competency evaluation found. Please complete an assessment first.'
            });
        }

        res.json({
            success: true,
            data: evaluation
        });
    } catch (error) {
        logger.error('Error getting latest competency:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving competency data',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/competency/history
 * @desc    Get competency progression history for current user
 * @access  Private
 */
router.get('/history', protect, async (req, res) => {
    try {
        const userId = req.user._id;
        const limit = parseInt(req.query.limit) || 10;

        const history = await CompetencyScore.getProgressionHistory(userId, limit);

        res.json({
            success: true,
            data: history
        });
    } catch (error) {
        logger.error('Error getting competency history:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving competency history',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/competency/:id
 * @desc    Get specific competency evaluation by ID
 * @access  Private
 */
router.get('/:id', protect, async (req, res) => {
    try {
        const evaluation = await CompetencyScore.findById(req.params.id)
            .populate('suggestedModules.moduleId');

        if (!evaluation) {
            return res.status(404).json({
                success: false,
                message: 'Competency evaluation not found'
            });
        }

        // Ensure user can only access their own evaluations (unless admin)
        if (evaluation.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        res.json({
            success: true,
            data: evaluation
        });
    } catch (error) {
        logger.error('Error getting competency evaluation:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving competency evaluation',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/competency/compare/:id1/:id2
 * @desc    Compare two competency evaluations
 * @access  Private
 */
router.get('/compare/:id1/:id2', protect, async (req, res) => {
    try {
        const userId = req.user._id;
        const { id1, id2 } = req.params;

        const comparison = await competencyEvaluationService.compareEvaluations(userId, id1, id2);

        res.json({
            success: true,
            data: comparison
        });
    } catch (error) {
        logger.error('Error comparing evaluations:', error);
        res.status(500).json({
            success: false,
            message: 'Error comparing evaluations',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/competency/admin/statistics
 * @desc    Get cohort competency statistics
 * @access  Private (Admin only)
 */
router.get('/admin/statistics', protect, authorize('admin', 'researcher'), async (req, res) => {
    try {
        const filters = {
            level: req.query.level,
            minScore: req.query.minScore ? parseInt(req.query.minScore) : undefined
        };

        const statistics = await CompetencyScore.getCohortStatistics(filters);

        res.json({
            success: true,
            data: statistics
        });
    } catch (error) {
        logger.error('Error getting cohort statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving statistics',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/competency/admin/user/:userId
 * @desc    Get competency data for specific user (admin)
 * @access  Private (Admin only)
 */
router.get('/admin/user/:userId', protect, authorize('admin', 'researcher'), async (req, res) => {
    try {
        const { userId } = req.params;
        const limit = parseInt(req.query.limit) || 10;

        const [latest, history] = await Promise.all([
            CompetencyScore.getLatestForUser(userId),
            CompetencyScore.getProgressionHistory(userId, limit)
        ]);

        res.json({
            success: true,
            data: {
                latest,
                history
            }
        });
    } catch (error) {
        logger.error('Error getting user competency (admin):', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving user competency',
            error: error.message
        });
    }
});

/**
 * @route   POST /api/competency/admin/evaluate/:userId
 * @desc    Trigger competency evaluation for specific user (admin)
 * @access  Private (Admin only)
 */
router.post('/admin/evaluate/:userId', protect, authorize('admin'), async (req, res) => {
    try {
        const { userId } = req.params;
        const options = req.body;

        const evaluation = await competencyEvaluationService.evaluateUserCompetency(userId, options);

        res.status(201).json({
            success: true,
            data: evaluation
        });
    } catch (error) {
        logger.error('Error evaluating user competency (admin):', error);
        res.status(500).json({
            success: false,
            message: 'Error evaluating competency',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/competency/admin/domain-distribution
 * @desc    Get distribution of competency levels across domains
 * @access  Private (Admin only)
 */
router.get('/admin/domain-distribution', protect, authorize('admin', 'researcher'), async (req, res) => {
    try {
        const distribution = await CompetencyScore.aggregate([
            {
                $project: {
                    domains: { $objectToArray: '$competencies' }
                }
            },
            { $unwind: '$domains' },
            {
                $group: {
                    _id: {
                        domain: '$domains.k',
                        level: '$domains.v.level'
                    },
                    count: { $sum: 1 },
                    avgScore: { $avg: '$domains.v.score' }
                }
            },
            {
                $group: {
                    _id: '$_id.domain',
                    levels: {
                        $push: {
                            level: '$_id.level',
                            count: '$count',
                            avgScore: '$avgScore'
                        }
                    }
                }
            }
        ]);

        res.json({
            success: true,
            data: distribution
        });
    } catch (error) {
        logger.error('Error getting domain distribution:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving domain distribution',
            error: error.message
        });
    }
});

module.exports = router;
