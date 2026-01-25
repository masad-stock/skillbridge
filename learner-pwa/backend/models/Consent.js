/**
 * Consent Model
 * Handles informed consent for research participation
 * Compliant with Kenya Data Protection Act 2019
 */

const mongoose = require('mongoose');

const consentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },

    consentVersion: {
        type: String,
        required: true,
        default: 'v1.0'
    },

    permissions: {
        researchDataCollection: {
            type: Boolean,
            required: true,
            default: false
        },
        anonymizedDataSharing: {
            type: Boolean,
            required: true,
            default: false
        },
        economicSurveys: {
            type: Boolean,
            required: true,
            default: false
        },
        followUpContact: {
            type: Boolean,
            required: true,
            default: false
        },
        smsNotifications: {
            type: Boolean,
            required: true,
            default: false
        }
    },

    consentGiven: {
        timestamp: {
            type: Date,
            required: true,
            default: Date.now
        },
        ipAddressHash: {
            type: String,
            required: false
        },
        language: {
            type: String,
            enum: ['en', 'sw'],
            required: true,
            default: 'en'
        },
        method: {
            type: String,
            enum: ['click', 'voice', 'written'],
            required: true,
            default: 'click'
        }
    },

    withdrawals: [{
        timestamp: {
            type: Date,
            required: true
        },
        reason: {
            type: String,
            required: false
        },
        dataDeleted: {
            type: Boolean,
            default: false
        },
        deletedAt: {
            type: Date
        }
    }],

    dataExports: [{
        requestedAt: {
            type: Date,
            required: true
        },
        completedAt: {
            type: Date
        },
        format: {
            type: String,
            enum: ['json', 'csv'],
            default: 'json'
        },
        status: {
            type: String,
            enum: ['pending', 'completed', 'failed'],
            default: 'pending'
        }
    }],

    isActive: {
        type: Boolean,
        default: true,
        index: true
    },

    reconsentRequired: {
        type: Boolean,
        default: false
    },

    reconsentReason: {
        type: String
    }
}, {
    timestamps: true
});

// Compound index for efficient queries
consentSchema.index({ userId: 1, isActive: 1 });
consentSchema.index({ consentVersion: 1, isActive: 1 });

// Virtual for checking if consent is valid
consentSchema.virtual('isValid').get(function () {
    return this.isActive &&
        this.permissions.researchDataCollection &&
        !this.reconsentRequired;
});

// Method to check specific permission
consentSchema.methods.hasPermission = function (permission) {
    return this.isActive && this.permissions[permission] === true;
};

// Method to withdraw consent
consentSchema.methods.withdraw = async function (reason, deleteData = false) {
    this.withdrawals.push({
        timestamp: new Date(),
        reason,
        dataDeleted: deleteData
    });
    this.isActive = false;

    if (deleteData) {
        this.withdrawals[this.withdrawals.length - 1].deletedAt = new Date();
    }

    return this.save();
};

// Method to request data export
consentSchema.methods.requestDataExport = async function (format = 'json') {
    this.dataExports.push({
        requestedAt: new Date(),
        format,
        status: 'pending'
    });
    return this.save();
};

// Static method to get active consent for user
consentSchema.statics.getActiveConsent = async function (userId) {
    return this.findOne({ userId, isActive: true }).sort({ createdAt: -1 });
};

// Static method to check if user has valid consent
consentSchema.statics.hasValidConsent = async function (userId) {
    const consent = await this.getActiveConsent(userId);
    return consent ? consent.isValid : false;
};

// Static method to trigger reconsent for version update
consentSchema.statics.triggerReconsent = async function (oldVersion, newVersion, reason) {
    return this.updateMany(
        { consentVersion: oldVersion, isActive: true },
        {
            reconsentRequired: true,
            reconsentReason: reason || `Consent version updated from ${oldVersion} to ${newVersion}`
        }
    );
};

module.exports = mongoose.model('Consent', consentSchema);
