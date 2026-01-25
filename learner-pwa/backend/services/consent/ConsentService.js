/**
 * Consent Service
 * Manages informed consent workflows for research participation
 * Compliant with Kenya Data Protection Act 2019
 */

const Consent = require('../../models/Consent');
const User = require('../../models/User');
const crypto = require('crypto');
const logger = require('../../utils/logger');

// Current consent version
const CURRENT_CONSENT_VERSION = 'v1.0';

class ConsentService {
    /**
     * Create new consent record
     * @param {Object} consentData - Consent submission data
     */
    async createConsent(consentData) {
        const { userId, permissions, language, method, ipAddress } = consentData;

        // Check for existing active consent
        const existingConsent = await Consent.getActiveConsent(userId);
        if (existingConsent && !existingConsent.reconsentRequired) {
            return {
                success: false,
                error: 'Active consent already exists',
                consent: existingConsent
            };
        }

        // Deactivate previous consent if reconsenting
        if (existingConsent) {
            existingConsent.isActive = false;
            await existingConsent.save();
        }

        // Hash IP address for privacy
        const ipAddressHash = ipAddress
            ? crypto.createHash('sha256').update(ipAddress).digest('hex').substring(0, 16)
            : null;

        const consent = new Consent({
            userId,
            consentVersion: CURRENT_CONSENT_VERSION,
            permissions: {
                researchDataCollection: permissions.researchDataCollection || false,
                anonymizedDataSharing: permissions.anonymizedDataSharing || false,
                economicSurveys: permissions.economicSurveys || false,
                followUpContact: permissions.followUpContact || false,
                smsNotifications: permissions.smsNotifications || false
            },
            consentGiven: {
                timestamp: new Date(),
                ipAddressHash,
                language: language || 'en',
                method: method || 'click'
            }
        });

        await consent.save();

        // Update user's research participant status
        await User.findByIdAndUpdate(userId, {
            'researchParticipant.consentId': consent._id,
            'researchParticipant.enrolledAt': new Date()
        });

        logger.info('Consent created', { userId, consentId: consent._id });

        return { success: true, consent };
    }

    /**
     * Get consent status for user
     * @param {string} userId - User ID
     */
    async getConsentStatus(userId) {
        const consent = await Consent.getActiveConsent(userId);

        if (!consent) {
            return {
                hasConsent: false,
                requiresConsent: true,
                currentVersion: CURRENT_CONSENT_VERSION
            };
        }

        return {
            hasConsent: true,
            isValid: consent.isValid,
            requiresReconsent: consent.reconsentRequired,
            reconsentReason: consent.reconsentReason,
            permissions: consent.permissions,
            consentVersion: consent.consentVersion,
            currentVersion: CURRENT_CONSENT_VERSION,
            consentDate: consent.consentGiven.timestamp
        };
    }

    /**
     * Verify consent for specific permission
     * @param {string} userId - User ID
     * @param {string} permission - Permission to check
     */
    async verifyPermission(userId, permission) {
        const consent = await Consent.getActiveConsent(userId);

        if (!consent) {
            return { allowed: false, reason: 'no_consent' };
        }

        if (consent.reconsentRequired) {
            return { allowed: false, reason: 'reconsent_required' };
        }

        if (!consent.hasPermission(permission)) {
            return { allowed: false, reason: 'permission_denied' };
        }

        return { allowed: true };
    }

    /**
     * Update consent permissions
     * @param {string} userId - User ID
     * @param {Object} permissions - Updated permissions
     */
    async updatePermissions(userId, permissions) {
        const consent = await Consent.getActiveConsent(userId);

        if (!consent) {
            return { success: false, error: 'No active consent found' };
        }

        // Update only provided permissions
        Object.keys(permissions).forEach(key => {
            if (consent.permissions[key] !== undefined) {
                consent.permissions[key] = permissions[key];
            }
        });

        await consent.save();

        logger.info('Consent permissions updated', { userId, permissions });

        return { success: true, consent };
    }

    /**
     * Withdraw consent
     * @param {string} userId - User ID
     * @param {string} reason - Withdrawal reason
     * @param {boolean} deleteData - Whether to delete user's research data
     */
    async withdrawConsent(userId, reason, deleteData = false) {
        const consent = await Consent.getActiveConsent(userId);

        if (!consent) {
            return { success: false, error: 'No active consent found' };
        }

        await consent.withdraw(reason, deleteData);

        // Update user's research participant status
        await User.findByIdAndUpdate(userId, {
            'researchParticipant.consentId': null
        });

        logger.info('Consent withdrawn', { userId, reason, deleteData });

        // If data deletion requested, trigger data deletion process
        if (deleteData) {
            await this.scheduleDataDeletion(userId);
        }

        return { success: true, message: 'Consent withdrawn successfully' };
    }

    /**
     * Request data export
     * @param {string} userId - User ID
     * @param {string} format - Export format (json/csv)
     */
    async requestDataExport(userId, format = 'json') {
        const consent = await Consent.getActiveConsent(userId);

        if (!consent) {
            return { success: false, error: 'No consent record found' };
        }

        await consent.requestDataExport(format);

        logger.info('Data export requested', { userId, format });

        return {
            success: true,
            message: 'Data export request submitted. You will be notified when ready.',
            exportId: consent.dataExports[consent.dataExports.length - 1]._id
        };
    }

    /**
     * Get user's data for export
     * @param {string} userId - User ID
     */
    async getUserDataForExport(userId) {
        const User = require('../../models/User');
        const ResearchEvent = require('../../models/ResearchEvent');
        const Progress = require('../../models/Progress');
        const Assessment = require('../../models/Assessment');

        const user = await User.findById(userId).select('-password');
        const events = await ResearchEvent.find({ userId }).lean();
        const progress = await Progress.find({ userId }).lean();
        const assessments = await Assessment.find({ userId }).lean();
        const consent = await Consent.findOne({ userId }).lean();

        return {
            exportDate: new Date().toISOString(),
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                createdAt: user.createdAt
            },
            consent,
            researchEvents: events,
            learningProgress: progress,
            assessments
        };
    }

    /**
     * Schedule data deletion for withdrawn consent
     * @param {string} userId - User ID
     */
    async scheduleDataDeletion(userId) {
        // In production, this would queue a job for data deletion
        // For now, we'll mark the deletion as scheduled
        logger.info('Data deletion scheduled', { userId });

        // The actual deletion would be handled by a background job
        // that removes research events and anonymizes user data
        return { scheduled: true, userId };
    }

    /**
     * Trigger reconsent for all users on version update
     * @param {string} newVersion - New consent version
     * @param {string} reason - Reason for reconsent
     */
    async triggerVersionReconsent(newVersion, reason) {
        const result = await Consent.triggerReconsent(
            CURRENT_CONSENT_VERSION,
            newVersion,
            reason
        );

        logger.info('Reconsent triggered', {
            oldVersion: CURRENT_CONSENT_VERSION,
            newVersion,
            affectedUsers: result.modifiedCount
        });

        return {
            success: true,
            affectedUsers: result.modifiedCount
        };
    }

    /**
     * Get consent audit trail for user
     * @param {string} userId - User ID
     */
    async getConsentAuditTrail(userId) {
        const consents = await Consent.find({ userId })
            .sort({ createdAt: -1 })
            .lean();

        return consents.map(consent => ({
            consentId: consent._id,
            version: consent.consentVersion,
            createdAt: consent.createdAt,
            isActive: consent.isActive,
            permissions: consent.permissions,
            withdrawals: consent.withdrawals,
            dataExports: consent.dataExports
        }));
    }

    /**
     * Get current consent version
     */
    getCurrentVersion() {
        return CURRENT_CONSENT_VERSION;
    }
}

module.exports = new ConsentService();
