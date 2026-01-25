/**
 * Consent Routes
 * API endpoints for consent management
 */

const express = require('express');
const router = express.Router();
const { auth, optionalAuth } = require('../middleware/auth');
const consentService = require('../services/consent/ConsentService');
const logger = require('../utils/logger');

/**
 * @route   POST /api/v1/consent
 * @desc    Submit consent
 * @access  Private
 */
router.post('/', auth, async (req, res) => {
    try {
        const { permissions, language, method } = req.body;

        if (!permissions || typeof permissions !== 'object') {
            return res.status(400).json({
                success: false,
                error: 'Permissions object is required'
            });
        }

        const result = await consentService.createConsent({
            userId: req.user.id,
            permissions,
            language: language || 'en',
            method: method || 'click',
            ipAddress: req.ip
        });

        if (!result.success) {
            return res.status(400).json(result);
        }

        res.status(201).json({
            success: true,
            message: 'Consent recorded successfully',
            consent: {
                id: result.consent._id,
                version: result.consent.consentVersion,
                permissions: result.consent.permissions,
                timestamp: result.consent.consentGiven.timestamp
            }
        });
    } catch (error) {
        logger.error('Error creating consent:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to record consent'
        });
    }
});

/**
 * @route   GET /api/v1/consent/status
 * @desc    Get consent status for current user
 * @access  Private
 */
router.get('/status', auth, async (req, res) => {
    try {
        const status = await consentService.getConsentStatus(req.user.id);
        res.json({ success: true, ...status });
    } catch (error) {
        logger.error('Error getting consent status:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get consent status'
        });
    }
});

/**
 * @route   GET /api/v1/consent/version
 * @desc    Get current consent version
 * @access  Public
 */
router.get('/version', (req, res) => {
    res.json({
        success: true,
        version: consentService.getCurrentVersion()
    });
});

/**
 * @route   PUT /api/v1/consent/permissions
 * @desc    Update consent permissions
 * @access  Private
 */
router.put('/permissions', auth, async (req, res) => {
    try {
        const { permissions } = req.body;

        if (!permissions || typeof permissions !== 'object') {
            return res.status(400).json({
                success: false,
                error: 'Permissions object is required'
            });
        }

        const result = await consentService.updatePermissions(req.user.id, permissions);

        if (!result.success) {
            return res.status(400).json(result);
        }

        res.json({
            success: true,
            message: 'Permissions updated successfully',
            permissions: result.consent.permissions
        });
    } catch (error) {
        logger.error('Error updating permissions:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update permissions'
        });
    }
});

/**
 * @route   POST /api/v1/consent/withdraw
 * @desc    Withdraw consent
 * @access  Private
 */
router.post('/withdraw', auth, async (req, res) => {
    try {
        const { reason, deleteData } = req.body;

        const result = await consentService.withdrawConsent(
            req.user.id,
            reason,
            deleteData === true
        );

        if (!result.success) {
            return res.status(400).json(result);
        }

        res.json({
            success: true,
            message: result.message
        });
    } catch (error) {
        logger.error('Error withdrawing consent:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to withdraw consent'
        });
    }
});

/**
 * @route   POST /api/v1/consent/export
 * @desc    Request data export
 * @access  Private
 */
router.post('/export', auth, async (req, res) => {
    try {
        const { format } = req.body;

        const result = await consentService.requestDataExport(
            req.user.id,
            format || 'json'
        );

        if (!result.success) {
            return res.status(400).json(result);
        }

        res.json(result);
    } catch (error) {
        logger.error('Error requesting data export:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to request data export'
        });
    }
});

/**
 * @route   GET /api/v1/consent/export/download
 * @desc    Download user's data
 * @access  Private
 */
router.get('/export/download', auth, async (req, res) => {
    try {
        const data = await consentService.getUserDataForExport(req.user.id);

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="my-data-${Date.now()}.json"`);
        res.json(data);
    } catch (error) {
        logger.error('Error downloading data:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to download data'
        });
    }
});

/**
 * @route   GET /api/v1/consent/audit
 * @desc    Get consent audit trail
 * @access  Private
 */
router.get('/audit', auth, async (req, res) => {
    try {
        const auditTrail = await consentService.getConsentAuditTrail(req.user.id);
        res.json({
            success: true,
            auditTrail
        });
    } catch (error) {
        logger.error('Error getting audit trail:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get audit trail'
        });
    }
});

/**
 * @route   GET /api/v1/consent/verify/:permission
 * @desc    Verify specific permission
 * @access  Private
 */
router.get('/verify/:permission', auth, async (req, res) => {
    try {
        const result = await consentService.verifyPermission(
            req.user.id,
            req.params.permission
        );
        res.json({ success: true, ...result });
    } catch (error) {
        logger.error('Error verifying permission:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to verify permission'
        });
    }
});

module.exports = router;
