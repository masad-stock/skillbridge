/**
 * Content Error Logging Middleware
 * 
 * Middleware to capture and log content delivery errors from client-side
 * Integrates with ContentDeliveryDiagnosticService for comprehensive monitoring
 */

const contentDiagnosticService = require('../services/contentDeliveryDiagnosticService');
const logger = require('../utils/logger');

/**
 * Middleware to log content delivery errors
 */
const logContentError = (req, res, next) => {
    try {
        const errorData = {
            type: req.body.type || 'unknown',
            severity: req.body.severity || 'medium',
            message: req.body.message || 'Unknown content error',
            moduleId: req.body.moduleId,
            lessonId: req.body.lessonId,
            userId: req.user?.id || req.body.userId,
            sessionId: req.sessionID || req.body.sessionId,
            errorCode: req.body.errorCode,
            stackTrace: req.body.stackTrace,
            contentUrl: req.body.contentUrl,
            loadTime: req.body.loadTime,
            retryAttempts: req.body.retryAttempts || 0,
            userAgent: req.get('User-Agent'),
            networkConditions: req.body.networkConditions,
            deviceInfo: req.body.deviceInfo,
            moduleProgress: req.body.moduleProgress,
            timeSpentOnContent: req.body.timeSpentOnContent,
            timestamp: new Date().toISOString()
        };

        // Log the error using diagnostic service
        const loggedError = contentDiagnosticService.logContentError(errorData);

        // Add error ID to response
        req.contentErrorId = loggedError.errorId;

        next();
    } catch (error) {
        logger.error('Error in content error logging middleware', error);
        next();
    }
};

/**
 * Middleware to log content delivery performance metrics
 */
const logContentMetrics = (req, res, next) => {
    try {
        const metricsData = {
            moduleId: req.body.moduleId,
            lessonId: req.body.lessonId,
            userId: req.user?.id || req.body.userId,
            sessionId: req.sessionID || req.body.sessionId,
            videoLoadTime: req.body.videoLoadTime,
            textLoadTime: req.body.textLoadTime,
            imageLoadTime: req.body.imageLoadTime,
            totalLoadTime: req.body.totalLoadTime,
            firstContentfulPaint: req.body.firstContentfulPaint,
            hasVideo: req.body.hasVideo,
            hasText: req.body.hasText,
            hasImages: req.body.hasImages,
            hasInteractive: req.body.hasInteractive,
            connectionType: req.body.connectionType,
            effectiveType: req.body.effectiveType,
            downlink: req.body.downlink,
            rtt: req.body.rtt,
            userAgent: req.get('User-Agent'),
            success: req.body.success,
            errorCount: req.body.errorCount || 0,
            timestamp: new Date().toISOString()
        };

        // Record metrics using diagnostic service
        const recordedMetrics = contentDiagnosticService.recordContentDeliveryMetrics(metricsData);

        // Add metrics ID to response
        req.contentMetricsId = recordedMetrics.timestamp;

        next();
    } catch (error) {
        logger.error('Error in content metrics logging middleware', error);
        next();
    }
};

/**
 * Middleware to track user session for content delivery
 */
const trackContentSession = (req, res, next) => {
    try {
        if (!req.session.contentSessionTracked) {
            const sessionData = {
                sessionId: req.sessionID,
                userId: req.user?.id,
                userAgent: req.get('User-Agent'),
                networkInfo: {
                    ip: req.ip,
                    forwardedFor: req.get('X-Forwarded-For'),
                    userAgent: req.get('User-Agent')
                }
            };

            contentDiagnosticService.trackUserSession(sessionData);
            req.session.contentSessionTracked = true;
        }

        next();
    } catch (error) {
        logger.error('Error in content session tracking middleware', error);
        next();
    }
};

/**
 * Middleware to update session with content access
 */
const updateContentAccess = (req, res, next) => {
    try {
        if (req.sessionID && req.body.moduleId) {
            const contentData = {
                moduleId: req.body.moduleId,
                lessonId: req.body.lessonId,
                contentType: req.body.contentType,
                loadTime: req.body.loadTime,
                success: req.body.success !== false, // default to true unless explicitly false
                timeSpent: req.body.timeSpent
            };

            contentDiagnosticService.updateSessionContentAccess(req.sessionID, contentData);
        }

        next();
    } catch (error) {
        logger.error('Error in content access tracking middleware', error);
        next();
    }
};

/**
 * Enhanced error response middleware for content errors
 */
const handleContentErrorResponse = (req, res, next) => {
    try {
        const errorId = req.contentErrorId;
        const severity = req.body.severity || 'medium';

        // Provide appropriate response based on error severity
        let response = {
            success: false,
            errorId: errorId,
            message: 'Content delivery error logged',
            severity: severity,
            timestamp: new Date().toISOString()
        };

        // Add troubleshooting suggestions for user-facing errors
        if (req.body.includeUserGuidance) {
            response.troubleshooting = generateTroubleshootingGuidance(req.body);
        }

        // Add retry information for recoverable errors
        if (severity !== 'critical' && req.body.type !== 'content') {
            response.retryRecommended = true;
            response.retryDelay = calculateRetryDelay(req.body.retryAttempts || 0);
        }

        res.status(200).json(response);
    } catch (error) {
        logger.error('Error in content error response middleware', error);
        res.status(500).json({
            success: false,
            message: 'Error processing content error report',
            timestamp: new Date().toISOString()
        });
    }
};

/**
 * Enhanced metrics response middleware
 */
const handleMetricsResponse = (req, res, next) => {
    try {
        const metricsId = req.contentMetricsId;

        res.status(200).json({
            success: true,
            metricsId: metricsId,
            message: 'Content metrics recorded',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        logger.error('Error in metrics response middleware', error);
        res.status(500).json({
            success: false,
            message: 'Error processing content metrics',
            timestamp: new Date().toISOString()
        });
    }
};

/**
 * Generate troubleshooting guidance based on error type
 */
function generateTroubleshootingGuidance(errorData) {
    const guidance = {
        steps: [],
        alternativeActions: [],
        contactSupport: false
    };

    switch (errorData.type) {
        case 'video':
            guidance.steps = [
                'Check your internet connection',
                'Try refreshing the page',
                'Clear your browser cache',
                'Disable ad blockers for this site'
            ];
            guidance.alternativeActions = [
                'Try watching the video directly on YouTube',
                'Use the text content below as an alternative',
                'Switch to a different browser'
            ];
            break;

        case 'text':
            guidance.steps = [
                'Refresh the page',
                'Clear your browser cache',
                'Check if JavaScript is enabled'
            ];
            guidance.alternativeActions = [
                'Try accessing the content on a different device',
                'Use a different browser',
                'Contact your instructor for alternative materials'
            ];
            break;

        case 'interactive':
            guidance.steps = [
                'Ensure JavaScript is enabled in your browser',
                'Clear browser cache and cookies',
                'Try refreshing the page'
            ];
            guidance.alternativeActions = [
                'Skip the interactive element for now',
                'Try on a different device',
                'Use a modern browser (Chrome, Firefox, Safari, Edge)'
            ];
            break;

        default:
            guidance.steps = [
                'Refresh the page',
                'Check your internet connection',
                'Try a different browser'
            ];
            guidance.alternativeActions = [
                'Try accessing the content later',
                'Contact technical support'
            ];
    }

    // Add contact support for critical errors
    if (errorData.severity === 'critical') {
        guidance.contactSupport = true;
        guidance.supportMessage = 'This appears to be a critical issue. Please contact technical support for immediate assistance.';
    }

    return guidance;
}

/**
 * Calculate retry delay based on attempt count
 */
function calculateRetryDelay(retryAttempts) {
    const baseDelay = 2000; // 2 seconds
    const maxDelay = 30000; // 30 seconds
    const delay = Math.min(baseDelay * Math.pow(2, retryAttempts), maxDelay);
    return delay;
}

/**
 * Validation middleware for content error reports
 */
const validateContentErrorReport = (req, res, next) => {
    const errors = [];

    // Validate required fields
    if (!req.body.type) {
        errors.push('Error type is required');
    }

    if (!req.body.message) {
        errors.push('Error message is required');
    }

    // Validate error type
    const validTypes = ['video', 'text', 'image', 'interactive', 'sync', 'network', 'unknown'];
    if (req.body.type && !validTypes.includes(req.body.type)) {
        errors.push('Invalid error type');
    }

    // Validate severity
    const validSeverities = ['low', 'medium', 'high', 'critical'];
    if (req.body.severity && !validSeverities.includes(req.body.severity)) {
        errors.push('Invalid error severity');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Invalid content error report',
            errors: errors,
            timestamp: new Date().toISOString()
        });
    }

    next();
};

/**
 * Validation middleware for content metrics
 */
const validateContentMetrics = (req, res, next) => {
    const errors = [];

    // Validate numeric fields
    const numericFields = ['videoLoadTime', 'textLoadTime', 'imageLoadTime', 'totalLoadTime', 'firstContentfulPaint'];
    numericFields.forEach(field => {
        if (req.body[field] !== undefined && (isNaN(req.body[field]) || req.body[field] < 0)) {
            errors.push(`${field} must be a non-negative number`);
        }
    });

    // Validate boolean fields
    const booleanFields = ['hasVideo', 'hasText', 'hasImages', 'hasInteractive', 'success'];
    booleanFields.forEach(field => {
        if (req.body[field] !== undefined && typeof req.body[field] !== 'boolean') {
            errors.push(`${field} must be a boolean value`);
        }
    });

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Invalid content metrics data',
            errors: errors,
            timestamp: new Date().toISOString()
        });
    }

    next();
};

module.exports = {
    logContentError,
    logContentMetrics,
    trackContentSession,
    updateContentAccess,
    handleContentErrorResponse,
    handleMetricsResponse,
    validateContentErrorReport,
    validateContentMetrics
};