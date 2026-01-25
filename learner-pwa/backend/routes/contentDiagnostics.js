/**
 * Content Diagnostics Routes
 * 
 * API endpoints for content delivery error logging, monitoring, and diagnostics
 */

const express = require('express');
const router = express.Router();
const contentDiagnosticService = require('../services/contentDeliveryDiagnosticService');
const {
    logContentError,
    logContentMetrics,
    trackContentSession,
    updateContentAccess,
    handleContentErrorResponse,
    handleMetricsResponse,
    validateContentErrorReport,
    validateContentMetrics
} = require('../middleware/contentErrorLogging');
const auth = require('../middleware/auth');
const logger = require('../utils/logger');

/**
 * @route POST /api/content-diagnostics/error
 * @desc Log content delivery error
 * @access Public (for error reporting)
 */
router.post('/error',
    validateContentErrorReport,
    trackContentSession,
    logContentError,
    handleContentErrorResponse
);

/**
 * @route POST /api/content-diagnostics/metrics
 * @desc Log content delivery performance metrics
 * @access Public (for metrics collection)
 */
router.post('/metrics',
    validateContentMetrics,
    trackContentSession,
    logContentMetrics,
    updateContentAccess,
    handleMetricsResponse
);

/**
 * @route POST /api/content-diagnostics/session
 * @desc Initialize content delivery session tracking
 * @access Public
 */
router.post('/session', (req, res) => {
    try {
        const sessionData = {
            sessionId: req.sessionID || req.body.sessionId,
            userId: req.user?.id || req.body.userId,
            userAgent: req.get('User-Agent'),
            networkInfo: {
                ip: req.ip,
                forwardedFor: req.get('X-Forwarded-For'),
                connectionType: req.body.connectionType,
                effectiveType: req.body.effectiveType
            }
        };

        const session = contentDiagnosticService.trackUserSession(sessionData);

        res.json({
            success: true,
            sessionId: session.sessionId,
            message: 'Content session tracking initialized',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        logger.error('Error initializing content session', error);
        res.status(500).json({
            success: false,
            message: 'Error initializing content session tracking',
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * @route GET /api/content-diagnostics/report
 * @desc Generate comprehensive diagnostic report
 * @access Private (Admin only)
 */
router.get('/report', auth, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }

        const filters = {
            timeRange: req.query.timeRange || '24h',
            userId: req.query.userId,
            moduleId: req.query.moduleId,
            severity: req.query.severity,
            type: req.query.type
        };

        const report = contentDiagnosticService.generateDiagnosticReport(filters);

        res.json({
            success: true,
            report: report,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        logger.error('Error generating diagnostic report', error);
        res.status(500).json({
            success: false,
            message: 'Error generating diagnostic report',
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * @route GET /api/content-diagnostics/health/:moduleId
 * @desc Get content health status for specific module
 * @access Private (Admin only)
 */
router.get('/health/:moduleId', auth, (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }

        const { moduleId } = req.params;
        const { lessonId } = req.query;

        const healthStatus = contentDiagnosticService.getContentHealthStatus(moduleId, lessonId);

        res.json({
            success: true,
            moduleId: moduleId,
            lessonId: lessonId,
            healthStatus: healthStatus,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        logger.error('Error getting content health status', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving content health status',
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * @route POST /api/content-diagnostics/validate/:moduleId
 * @desc Validate content URLs and accessibility for module
 * @access Private (Admin only)
 */
router.post('/validate/:moduleId', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }

        const { moduleId } = req.params;
        const { lessonId } = req.body;

        const validationResults = await contentDiagnosticService.validateContentUrls(moduleId, lessonId);

        res.json({
            success: true,
            validationResults: validationResults,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        logger.error('Error validating content URLs', error);
        res.status(500).json({
            success: false,
            message: 'Error validating content URLs',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * @route GET /api/content-diagnostics/errors
 * @desc Get recent content errors with filtering
 * @access Private (Admin only)
 */
router.get('/errors', auth, (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }

        const filters = {
            timeRange: req.query.timeRange || '24h',
            severity: req.query.severity,
            type: req.query.type,
            moduleId: req.query.moduleId,
            userId: req.query.userId,
            limit: parseInt(req.query.limit) || 50
        };

        // Get filtered errors from diagnostic service
        const report = contentDiagnosticService.generateDiagnosticReport(filters);
        const errors = report.errorAnalysis.byType;

        res.json({
            success: true,
            filters: filters,
            errors: errors,
            summary: report.summary,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        logger.error('Error retrieving content errors', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving content errors',
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * @route GET /api/content-diagnostics/performance
 * @desc Get content delivery performance metrics
 * @access Private (Admin only)
 */
router.get('/performance', auth, (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }

        const filters = {
            timeRange: req.query.timeRange || '24h',
            moduleId: req.query.moduleId
        };

        const report = contentDiagnosticService.generateDiagnosticReport(filters);

        res.json({
            success: true,
            performanceMetrics: report.performanceMetrics,
            systemHealth: report.systemHealth,
            trends: report.trends,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        logger.error('Error retrieving performance metrics', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving performance metrics',
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * @route GET /api/content-diagnostics/dashboard
 * @desc Get dashboard data for content delivery monitoring
 * @access Private (Admin only)
 */
router.get('/dashboard', auth, (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }

        const timeRange = req.query.timeRange || '24h';
        const report = contentDiagnosticService.generateDiagnosticReport({ timeRange });

        const dashboardData = {
            overview: {
                totalErrors: report.summary.totalErrors,
                criticalErrors: report.summary.criticalErrors,
                affectedUsers: report.summary.affectedUsers,
                affectedModules: report.summary.affectedModules,
                systemHealth: report.systemHealth
            },
            performance: {
                avgLoadTime: report.performanceMetrics.avgLoadTime,
                successRate: report.performanceMetrics.successRate,
                totalRequests: report.performanceMetrics.totalRequests
            },
            errorBreakdown: {
                byType: report.errorAnalysis.byType,
                bySeverity: report.errorAnalysis.bySeverity,
                commonPatterns: report.errorAnalysis.commonPatterns.slice(0, 5)
            },
            contentHealth: report.contentHealthStatus,
            trends: report.trends,
            recommendations: report.recommendations.slice(0, 3)
        };

        res.json({
            success: true,
            dashboard: dashboardData,
            timeRange: timeRange,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        logger.error('Error generating dashboard data', error);
        res.status(500).json({
            success: false,
            message: 'Error generating dashboard data',
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * @route POST /api/content-diagnostics/test-video
 * @desc Test video URL accessibility
 * @access Private (Admin only)
 */
router.post('/test-video', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }

        const { videoUrl } = req.body;

        if (!videoUrl) {
            return res.status(400).json({
                success: false,
                message: 'Video URL is required'
            });
        }

        const validationResult = await contentDiagnosticService.validateVideoUrl(videoUrl);

        res.json({
            success: true,
            videoUrl: videoUrl,
            validation: validationResult,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        logger.error('Error testing video URL', error);
        res.status(500).json({
            success: false,
            message: 'Error testing video URL',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * @route GET /api/content-diagnostics/user-errors/:userId
 * @desc Get content errors for specific user
 * @access Private (Admin or own user)
 */
router.get('/user-errors/:userId', auth, (req, res) => {
    try {
        const { userId } = req.params;

        // Check if user is admin or requesting their own errors
        if (req.user.role !== 'admin' && req.user.id !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Can only view your own errors.'
            });
        }

        const timeRange = req.query.timeRange || '7d';
        const report = contentDiagnosticService.generateDiagnosticReport({
            userId: userId,
            timeRange: timeRange
        });

        const userErrors = {
            userId: userId,
            timeRange: timeRange,
            summary: report.summary,
            errors: report.errorAnalysis.byType,
            recommendations: report.recommendations.filter(r => r.type === 'user-specific')
        };

        res.json({
            success: true,
            userErrors: userErrors,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        logger.error('Error retrieving user errors', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving user errors',
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * @route POST /api/content-diagnostics/bulk-validate
 * @desc Validate multiple content items in bulk
 * @access Private (Admin only)
 */
router.post('/bulk-validate', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.'
            });
        }

        const { moduleIds } = req.body;

        if (!Array.isArray(moduleIds) || moduleIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Array of module IDs is required'
            });
        }

        const validationPromises = moduleIds.map(moduleId =>
            contentDiagnosticService.validateContentUrls(moduleId)
        );

        const validationResults = await Promise.all(validationPromises);

        const summary = {
            totalModules: moduleIds.length,
            healthyModules: validationResults.filter(r => !r.error &&
                r.results.every(lesson => lesson.overallStatus === 'healthy')).length,
            modulesWithWarnings: validationResults.filter(r => !r.error &&
                r.results.some(lesson => lesson.overallStatus === 'warning')).length,
            modulesWithErrors: validationResults.filter(r => r.error ||
                r.results.some(lesson => lesson.overallStatus === 'error')).length
        };

        res.json({
            success: true,
            summary: summary,
            validationResults: validationResults,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        logger.error('Error in bulk content validation', error);
        res.status(500).json({
            success: false,
            message: 'Error in bulk content validation',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

module.exports = router;