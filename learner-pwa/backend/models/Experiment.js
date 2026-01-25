/**
 * Experiment Model
 * Supports A/B testing and control group assignment for research validation
 */

const mongoose = require('mongoose');

const experimentGroupSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    ratio: {
        type: Number,
        required: true,
        min: 0,
        max: 1
    },
    features: {
        aiRecommendations: { type: Boolean, default: true },
        adaptiveDifficulty: { type: Boolean, default: true },
        gamification: { type: Boolean, default: true },
        voiceGuidance: { type: Boolean, default: true },
        simplifiedUI: { type: Boolean, default: false },
        interventions: { type: Boolean, default: true }
    },
    description: String
}, { _id: false });

const experimentResultsSchema = new mongoose.Schema({
    sampleSize: { type: Number, default: 0 },
    controlMean: Number,
    treatmentMean: Number,
    effectSize: Number,
    pValue: Number,
    confidenceInterval: {
        lower: Number,
        upper: Number
    },
    calculatedAt: Date
}, { _id: false });

const experimentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },

    description: {
        type: String,
        required: true
    },

    hypothesis: {
        type: String,
        required: true
    },

    status: {
        type: String,
        enum: ['draft', 'active', 'paused', 'completed', 'archived'],
        default: 'draft',
        index: true
    },

    groups: [experimentGroupSchema],

    targeting: {
        newUsersOnly: { type: Boolean, default: true },
        minAge: { type: Number, default: 18 },
        maxAge: { type: Number, default: 35 },
        locations: [String],
        demographicFilters: mongoose.Schema.Types.Mixed
    },

    metrics: {
        primaryMetric: {
            type: String,
            required: true,
            default: 'completion_rate'
        },
        secondaryMetrics: [String],
        minimumSampleSize: { type: Number, default: 100 }
    },

    results: experimentResultsSchema,

    assignments: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        group: String,
        assignedAt: { type: Date, default: Date.now }
    }],

    startDate: {
        type: Date
    },

    endDate: {
        type: Date
    },

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Indexes
experimentSchema.index({ status: 1, startDate: 1 });
experimentSchema.index({ 'assignments.userId': 1 });

// Validate group ratios sum to 1
experimentSchema.pre('save', function (next) {
    if (this.groups && this.groups.length > 0) {
        const totalRatio = this.groups.reduce((sum, g) => sum + g.ratio, 0);
        if (Math.abs(totalRatio - 1) > 0.001) {
            return next(new Error('Group ratios must sum to 1'));
        }
    }
    next();
});

// Method to get user's group assignment
experimentSchema.methods.getUserGroup = function (userId) {
    const assignment = this.assignments.find(
        a => a.userId.toString() === userId.toString()
    );
    return assignment ? assignment.group : null;
};

// Method to check if user is assigned
experimentSchema.methods.isUserAssigned = function (userId) {
    return this.assignments.some(
        a => a.userId.toString() === userId.toString()
    );
};

// Method to get group features
experimentSchema.methods.getGroupFeatures = function (groupName) {
    const group = this.groups.find(g => g.name === groupName);
    return group ? group.features : null;
};

// Static method to get active experiments
experimentSchema.statics.getActiveExperiments = function () {
    return this.find({
        status: 'active',
        startDate: { $lte: new Date() },
        $or: [
            { endDate: { $gte: new Date() } },
            { endDate: null }
        ]
    });
};

// Static method to get user's experiment assignments
experimentSchema.statics.getUserExperiments = async function (userId) {
    return this.find({
        'assignments.userId': userId,
        status: { $in: ['active', 'completed'] }
    }).select('name status groups assignments');
};

module.exports = mongoose.model('Experiment', experimentSchema);
