const mongoose = require('mongoose');

/**
 * Research Event Schema
 * Captures all user interactions for research analysis and thesis validation
 * Optimized for time-series queries with appropriate indexes
 */
const researchEventSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    sessionId: {
        type: String,
        required: true,
        index: true
    },
    timestamp: {
        type: Date,
        required: true,
        default: Date.now,
        index: true
    },
    eventType: {
        type: String,
        required: true,
        enum: [
            'page_view',
            'module_start',
            'module_progress',
            'module_complete',
            'assessment_start',
            'assessment_answer',
            'assessment_complete',
            'business_tool_use',
            'navigation',
            'search',
            'login',
            'logout',
            'error',
            'intervention_received',
            'consent_action',
            'economic_survey',
            'voice_command',
            'accessibility_toggle'
        ],
        index: true
    },
    eventCategory: {
        type: String,
        required: true,
        enum: ['learning', 'assessment', 'business_tool', 'navigation', 'system', 'research', 'accessibility'],
        index: true
    },
    eventData: {
        moduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Module' },
        assessmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assessment' },
        questionId: String,
        responseTime: Number, // milliseconds
        score: Number,
        interactions: Number,
        previousAnswer: String,
        currentAnswer: String,
        confidence: Number, // 1-5 self-reported
        pageUrl: String,
        searchQuery: String,
        toolName: String,
        actionType: String,
        metadata: mongoose.Schema.Types.Mixed
    },
    context: {
        deviceType: {
            type: String,
            enum: ['mobile', 'tablet', 'desktop', 'unknown'],
            default: 'unknown'
        },
        networkType: {
            type: String,
            enum: ['wifi', '4g', '3g', '2g', 'offline', 'unknown'],
            default: 'unknown'
        },
        offlineMode: {
            type: Boolean,
            default: false
        },
        language: {
            type: String,
            enum: ['en', 'sw'],
            default: 'en'
        },
        accessibilityMode: {
            type: String,
            enum: ['standard', 'simplified', 'voice'],
            default: 'standard'
        },
        userAgent: String,
        screenWidth: Number,
        screenHeight: Number
    },
    experimentData: {
        experimentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Experiment' },
        group: {
            type: String,
            enum: ['control', 'treatment_a', 'treatment_b', 'treatment_c', null]
        },
        variant: String,
        treatmentApplied: Boolean
    },
    syncStatus: {
        queuedAt: Date,
        syncedAt: Date,
        retryCount: {
            type: Number,
            default: 0
        },
        source: {
            type: String,
            enum: ['online', 'offline_sync'],
            default: 'online'
        }
    }
}, {
    timestamps: true,
    collection: 'research_events'
});

// Compound indexes for common query patterns
researchEventSchema.index({ userId: 1, timestamp: -1 });
researchEventSchema.index({ eventType: 1, timestamp: -1 });
researchEventSchema.index({ 'experimentData.group': 1, eventType: 1, timestamp: -1 });
researchEventSchema.index({ eventCategory: 1, timestamp: -1 });
researchEventSchema.index({ sessionId: 1, timestamp: 1 });

// Time-series index for efficient date range queries
researchEventSchema.index({ timestamp: 1 }, { expireAfterSeconds: 365 * 24 * 60 * 60 }); // 1 year TTL

// Static methods for common queries
researchEventSchema.statics.findByUser = function (userId, options = {}) {
    const query = this.find({ userId });
    if (options.startDate) query.where('timestamp').gte(options.startDate);
    if (options.endDate) query.where('timestamp').lte(options.endDate);
    if (options.eventType) query.where('eventType').equals(options.eventType);
    if (options.limit) query.limit(options.limit);
    return query.sort({ timestamp: -1 });
};

researchEventSchema.statics.findBySession = function (sessionId) {
    return this.find({ sessionId }).sort({ timestamp: 1 });
};

researchEventSchema.statics.getEventCounts = async function (startDate, endDate, groupBy = 'eventType') {
    const match = {};
    if (startDate || endDate) {
        match.timestamp = {};
        if (startDate) match.timestamp.$gte = new Date(startDate);
        if (endDate) match.timestamp.$lte = new Date(endDate);
    }

    return this.aggregate([
        { $match: match },
        { $group: { _id: `$${groupBy}`, count: { $sum: 1 } } },
        { $sort: { count: -1 } }
    ]);
};

researchEventSchema.statics.getExperimentEvents = function (experimentId, group = null) {
    const query = { 'experimentData.experimentId': experimentId };
    if (group) query['experimentData.group'] = group;
    return this.find(query).sort({ timestamp: -1 });
};

module.exports = mongoose.model('ResearchEvent', researchEventSchema);
