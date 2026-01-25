const ContentValidationService = require('../services/contentValidationService');

/**
 * Content Validation Middleware
 * Validates enhanced content before processing
 */

// Validate enhanced content structure
const validateEnhancedContent = (req, res, next) => {
    try {
        const { enhancedContent } = req.body;

        if (!enhancedContent) {
            return res.status(400).json({
                success: false,
                message: 'Enhanced content is required'
            });
        }

        // Perform validation
        const validation = ContentValidationService.validateEnhancedContent(enhancedContent);

        // Attach validation results to request
        req.contentValidation = validation;

        // Continue if valid, or if only warnings (not errors)
        if (validation.isValid || validation.errors.length === 0) {
            return next();
        }

        // Return validation errors
        return res.status(400).json({
            success: false,
            message: 'Content validation failed',
            errors: validation.errors,
            warnings: validation.warnings,
            score: validation.score
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Content validation error: ' + error.message
        });
    }
};

// Validate content accessibility
const validateAccessibility = (req, res, next) => {
    try {
        const { enhancedContent } = req.body;

        if (!enhancedContent) {
            return next();
        }

        const accessibilityValidation = ContentValidationService.validateAccessibility(enhancedContent);

        // Attach to request
        req.accessibilityValidation = accessibilityValidation;

        // Log accessibility issues but don't block
        if (!accessibilityValidation.isAccessible) {
            console.warn('Accessibility issues found:', accessibilityValidation.issues);
        }

        next();
    } catch (error) {
        console.error('Accessibility validation error:', error);
        next(); // Don't block on accessibility validation errors
    }
};

// Validate mobile compatibility
const validateMobileCompatibility = (req, res, next) => {
    try {
        const { enhancedContent } = req.body;

        if (!enhancedContent) {
            return next();
        }

        const mobileValidation = ContentValidationService.validateMobileCompatibility(enhancedContent);

        // Attach to request
        req.mobileValidation = mobileValidation;

        // Log mobile compatibility issues but don't block
        if (!mobileValidation.isMobileFriendly) {
            console.warn('Mobile compatibility issues found:', mobileValidation.issues);
        }

        next();
    } catch (error) {
        console.error('Mobile compatibility validation error:', error);
        next(); // Don't block on mobile validation errors
    }
};

// Validate Kenyan relevance
const validateKenyanRelevance = (req, res, next) => {
    try {
        const { enhancedContent } = req.body;

        if (!enhancedContent) {
            return next();
        }

        const kenyanValidation = ContentValidationService.validateKenyanRelevance(enhancedContent);

        // Attach to request
        req.kenyanValidation = kenyanValidation;

        // Warn if relevance score is low
        if (kenyanValidation.score < 50) {
            console.warn('Low Kenyan relevance score:', kenyanValidation.score);
        }

        next();
    } catch (error) {
        console.error('Kenyan relevance validation error:', error);
        next(); // Don't block on relevance validation errors
    }
};

// Comprehensive validation middleware (combines all validations)
const validateContentComprehensive = [
    validateEnhancedContent,
    validateAccessibility,
    validateMobileCompatibility,
    validateKenyanRelevance,
    (req, res, next) => {
        // Compile comprehensive validation report
        const report = {
            content: req.contentValidation,
            accessibility: req.accessibilityValidation,
            mobile: req.mobileValidation,
            kenyan: req.kenyanValidation
        };

        req.validationReport = report;
        next();
    }
];

// Rate limiting for content operations
const contentRateLimit = (req, res, next) => {
    // Simple rate limiting - in production, use Redis or similar
    const userId = req.user.id;
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute
    const maxRequests = 10;

    if (!req.app.locals.contentRateLimit) {
        req.app.locals.contentRateLimit = {};
    }

    const userRequests = req.app.locals.contentRateLimit[userId] || [];
    const recentRequests = userRequests.filter(time => now - time < windowMs);

    if (recentRequests.length >= maxRequests) {
        return res.status(429).json({
            success: false,
            message: 'Too many content requests. Please try again later.',
            retryAfter: Math.ceil(windowMs / 1000)
        });
    }

    // Add current request
    recentRequests.push(now);
    req.app.locals.contentRateLimit[userId] = recentRequests;

    next();
};

// Content size validation
const validateContentSize = (req, res, next) => {
    try {
        const contentSize = JSON.stringify(req.body).length;
        const maxSize = 5 * 1024 * 1024; // 5MB

        if (contentSize > maxSize) {
            return res.status(413).json({
                success: false,
                message: 'Content size too large. Maximum size is 5MB.',
                currentSize: Math.round(contentSize / 1024) + 'KB',
                maxSize: Math.round(maxSize / 1024 / 1024) + 'MB'
            });
        }

        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error validating content size: ' + error.message
        });
    }
};

// Sanitize content (basic XSS protection)
const sanitizeContent = (req, res, next) => {
    try {
        if (req.body.enhancedContent) {
            // Basic sanitization - in production, use a proper sanitization library
            const sanitizeString = (str) => {
                if (typeof str !== 'string') return str;
                return str
                    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                    .replace(/javascript:/gi, '')
                    .replace(/on\w+\s*=/gi, '');
            };

            const sanitizeObject = (obj) => {
                if (typeof obj === 'string') {
                    return sanitizeString(obj);
                } else if (Array.isArray(obj)) {
                    return obj.map(sanitizeObject);
                } else if (obj && typeof obj === 'object') {
                    const sanitized = {};
                    for (const key in obj) {
                        sanitized[key] = sanitizeObject(obj[key]);
                    }
                    return sanitized;
                }
                return obj;
            };

            req.body.enhancedContent = sanitizeObject(req.body.enhancedContent);
        }

        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error sanitizing content: ' + error.message
        });
    }
};

module.exports = {
    validateEnhancedContent,
    validateAccessibility,
    validateMobileCompatibility,
    validateKenyanRelevance,
    validateContentComprehensive,
    contentRateLimit,
    validateContentSize,
    sanitizeContent
};