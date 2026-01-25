/**
 * Economic Survey Routes
 * API endpoints for economic impact tracking
 */

const express = require('express');
const router = express.Router();
const { auth, adminAuth } = require('../middleware/auth');
const { requirePermission } = require('../middleware/consentVerification');
const EconomicSurvey = require('../models/EconomicSurvey');
const logger = require('../utils/logger');

/**
 * @route   POST /api/v1/economic-surveys
 * @desc    Submit economic survey
 * @access  Private (requires economicSurveys consent)
 */
router.post('/', auth, requirePermission('economicSurveys'), async (req, res) => {
    try {
        const { surveyType, employment, income, business, digitalSkillsApplication, skillsGained, platformImpact, challenges } = req.body;

        // Check if survey already exists for this type
        const existing = await EconomicSurvey.findOne({
            userId: req.user.id,
            surveyType
        });

        if (existing) {
            return res.status(400).json({
                success: false,
                error: 'Survey already submitted for this period'
            });
        }

        const survey = new EconomicSurvey({
            userId: req.user.id,
            surveyType,
            employment,
            income,
            business,
            digitalSkillsApplication,
            skillsGained,
            platformImpact,
            challenges
        });

        await survey.save();

        logger.info('Economic survey submitted', {
            userId: req.user.id,
            surveyType
        });

        res.status(201).json({
            success: true,
            message: 'Survey submitted successfully',
            surveyId: survey._id
        });
    } catch (error) {
        logger.error('Error submitting survey:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to submit survey'
        });
    }
});

/**
 * @route   GET /api/v1/economic-surveys/my-surveys
 * @desc    Get current user's surveys
 * @access  Private
 */
router.get('/my-surveys', auth, async (req, res) => {
    try {
        const surveys = await EconomicSurvey.find({ userId: req.user.id })
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: surveys.length,
            surveys
        });
    } catch (error) {
        logger.error('Error getting surveys:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get surveys'
        });
    }
});

/**
 * @route   GET /api/v1/economic-surveys/pending
 * @desc    Check if user has pending surveys
 * @access  Private
 */
router.get('/pending', auth, async (req, res) => {
    try {
        const completedTypes = await EconomicSurvey.find({ userId: req.user.id })
            .distinct('surveyType');

        const allTypes = ['baseline', 'followup_3m', 'followup_6m', 'followup_12m'];
        const pendingTypes = allTypes.filter(t => !completedTypes.includes(t));

        // Check if baseline is pending
        const needsBaseline = !completedTypes.includes('baseline');

        // Check follow-up eligibility based on account age
        const User = require('../models/User');
        const user = await User.findById(req.user.id);
        const accountAgeMonths = Math.floor(
            (Date.now() - new Date(user.createdAt)) / (30 * 24 * 60 * 60 * 1000)
        );

        const eligibleFollowups = [];
        if (accountAgeMonths >= 3 && !completedTypes.includes('followup_3m')) {
            eligibleFollowups.push('followup_3m');
        }
        if (accountAgeMonths >= 6 && !completedTypes.includes('followup_6m')) {
            eligibleFollowups.push('followup_6m');
        }
        if (accountAgeMonths >= 12 && !completedTypes.includes('followup_12m')) {
            eligibleFollowups.push('followup_12m');
        }

        res.json({
            success: true,
            needsBaseline,
            eligibleFollowups,
            completedTypes,
            accountAgeMonths
        });
    } catch (error) {
        logger.error('Error checking pending surveys:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to check pending surveys'
        });
    }
});

/**
 * @route   GET /api/v1/economic-surveys/my-improvement
 * @desc    Get user's economic improvement from baseline
 * @access  Private
 */
router.get('/my-improvement', auth, async (req, res) => {
    try {
        const latestSurvey = await EconomicSurvey.findOne({
            userId: req.user.id,
            surveyType: { $ne: 'baseline' }
        }).sort({ createdAt: -1 });

        if (!latestSurvey) {
            return res.json({
                success: true,
                hasImprovement: false,
                message: 'No follow-up survey completed yet'
            });
        }

        const improvement = await latestSurvey.calculateImprovement();

        res.json({
            success: true,
            hasImprovement: !!improvement,
            improvement,
            surveyType: latestSurvey.surveyType,
            completedAt: latestSurvey.completedAt
        });
    } catch (error) {
        logger.error('Error calculating improvement:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to calculate improvement'
        });
    }
});

/**
 * @route   GET /api/v1/economic-surveys/aggregate-impact
 * @desc    Get aggregate economic impact (admin)
 * @access  Admin
 */
router.get('/aggregate-impact', adminAuth, async (req, res) => {
    try {
        const impact = await EconomicSurvey.getAggregateImpact();
        const completionRates = {};

        for (const type of ['baseline', 'followup_3m', 'followup_6m']) {
            completionRates[type] = await EconomicSurvey.getCompletionRate(type);
        }

        res.json({
            success: true,
            impact,
            completionRates
        });
    } catch (error) {
        logger.error('Error getting aggregate impact:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get aggregate impact'
        });
    }
});

/**
 * @route   GET /api/v1/economic-surveys/all
 * @desc    Get all surveys (admin)
 * @access  Admin
 */
router.get('/all', adminAuth, async (req, res) => {
    try {
        const { surveyType, page = 1, limit = 50 } = req.query;

        const query = surveyType ? { surveyType } : {};

        const surveys = await EconomicSurvey.find(query)
            .populate('userId', 'name email')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await EconomicSurvey.countDocuments(query);

        res.json({
            success: true,
            count: surveys.length,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / limit),
            surveys
        });
    } catch (error) {
        logger.error('Error getting all surveys:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get surveys'
        });
    }
});

/**
 * @route   GET /api/v1/economic-surveys/export
 * @desc    Export survey data (admin)
 * @access  Admin
 */
router.get('/export', adminAuth, async (req, res) => {
    try {
        const { format = 'json', anonymize = 'true' } = req.query;
        const dataExportService = require('../services/research/DataExportService');

        const data = await dataExportService.exportEconomicSurveys({
            anonymize: anonymize === 'true'
        });

        if (format === 'csv') {
            const csv = dataExportService.toCSV(data);
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename="economic-surveys.csv"');
            return res.send(csv);
        }

        res.json({
            success: true,
            count: data.length,
            data
        });
    } catch (error) {
        logger.error('Error exporting surveys:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to export surveys'
        });
    }
});

module.exports = router;
