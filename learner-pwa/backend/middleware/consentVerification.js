/**
 * Consent Verification Middleware
 * Ensures users have valid consent before accessing research endpoints
 */

const consentService = require('../services/consent/ConsentService');
const logger = require('../utils/logger');

/**
 * Middleware to verify research data collection consent
 */
const requireResearchConsent = async (req, res, next) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        const result = await consentService.verifyPermission(
            req.user.id,
            'researchDataCollection'
        );

        if (!result.allowed) {
            return res.status(403).json({
                success: false,
                error: 'Research consent required',
                reason: result.reason,
                requiresConsent: true
            });
        }

        next();
    } catch (error) {
        logger.error('Consent verification error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to verify consent'
        });
    }
};

/**
 * Middleware to verify specific permission
 * @param {string} permission - Permission to verify
 */
const requirePermission = (permission) => {
    return async (req, res, next) => {
        try {
            if (!req.user || !req.user.id) {
                return res.status(401).json({
                    success: false,
                    error: 'Authentication required'
                });
            }

            const result = await consentService.verifyPermission(
                req.user.id,
                permission
            );

            if (!result.allowed) {
                return res.status(403).json({
                    success: false,
                    error: `Permission '${permission}' required`,
                    reason: result.reason
                });
            }

            next();
        } catch (error) {
            logger.error('Permission verification error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to verify permission'
            });
        }
    };
};

/**
 * Middleware to check consent status (non-blocking)
 * Attaches consent info to request for optional use
 */
const checkConsentStatus = async (req, res, next) => {
    try {
        if (req.user && req.user.id) {
            const status = await consentService.getConsentStatus(req.user.id);
            req.consentStatus = status;
        } else {
            req.consentStatus = { hasConsent: false };
        }
        next();
    } catch (error) {
        logger.error('Consent status check error:', error);
        req.consentStatus = { hasConsent: false, error: true };
        next();
    }
};

module.exports = {
    requireResearchConsent,
    requirePermission,
    checkConsentStatus
};
