const mongoose = require('mongoose');

const researchAssessmentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },

    assessmentType: {
        type: String,
        enum: ['baseline', 'post', 'retention_3m', 'retention_6m'],
        required: true
    },

    skillCategory: {
        type: String,
        required: true,
        enum: [
            'basic_digital',
            'business_automation',
            'e_commerce',
            'digital_marketing',
            'financial_management',
            'communication'
        ]
    },

    questions: [{
        questionId: {
            type: String,
            required: true
        },
        difficulty: {
            type: Number,
            min: 1,
            max: 5,
            required: true
        },
        response: {
            type: String,
            required: true
        },
        correct: {
            type: Boolean,
            required: true
        },
        responseTime: {
            type: Number, // milliseconds
            required: true
        },
        confidence: {
            type: Number,
            min: 1,
            max: 5,
            required: true
        }
    }],

    scores: {
        raw: {
            type: Number,
            required: true
        },
        normalized: {
            type: Number, // 0-100
            required: true
        },
        percentile: Number
    },

    comparison: {
        baselineScore: Number,
        improvement: Number,
        effectSize: Number
    },

    completedAt: {
        type: Date,
        default: Date.now,
        required: true
    },

    scheduledFollowUp: Date,

    metadata: {
        deviceType: String,
        networkType: String,
        language: String,
        totalDuration: Number // milliseconds
    }
}, {
    timestamps: true
});

// Indexes for efficient querying
researchAssessmentSchema.index({ userId: 1, assessmentType: 1 });
researchAssessmentSchema.index({ completedAt: -1 });
researchAssessmentSchema.index({ skillCategory: 1 });

module.exports = mongoose.model('ResearchAssessment', researchAssessmentSchema);
