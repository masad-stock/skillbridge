/**
 * Economic Survey Model
 * Tracks economic impact for research validation
 */

const mongoose = require('mongoose');

const economicSurveySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },

    surveyType: {
        type: String,
        enum: ['baseline', 'followup_3m', 'followup_6m', 'followup_12m'],
        required: true
    },

    employment: {
        status: {
            type: String,
            enum: ['employed', 'self_employed', 'unemployed', 'student', 'other'],
            required: true
        },
        sector: String,
        hoursPerWeek: Number,
        jobTitle: String,
        employerType: {
            type: String,
            enum: ['private', 'government', 'ngo', 'self', 'other']
        }
    },

    income: {
        range: {
            type: String,
            enum: [
                'below_5k',      // Below KES 5,000
                '5k_10k',        // KES 5,000 - 10,000
                '10k_20k',       // KES 10,000 - 20,000
                '20k_30k',       // KES 20,000 - 30,000
                '30k_50k',       // KES 30,000 - 50,000
                '50k_100k',      // KES 50,000 - 100,000
                'above_100k',    // Above KES 100,000
                'prefer_not_say'
            ],
            required: true
        },
        currency: {
            type: String,
            default: 'KES'
        },
        sources: [{
            type: String,
            enum: ['salary', 'business', 'freelance', 'farming', 'remittances', 'other']
        }]
    },

    business: {
        hasBusiness: {
            type: Boolean,
            default: false
        },
        type: String,
        monthlyRevenue: {
            type: String,
            enum: [
                'below_10k',
                '10k_30k',
                '30k_50k',
                '50k_100k',
                '100k_500k',
                'above_500k',
                'prefer_not_say'
            ]
        },
        employeesCount: Number,
        yearsInOperation: Number,
        registrationStatus: {
            type: String,
            enum: ['registered', 'unregistered', 'in_progress']
        }
    },

    digitalSkillsApplication: {
        usesDigitalPayments: { type: Boolean, default: false },
        paymentMethods: [{
            type: String,
            enum: ['mpesa', 'bank_transfer', 'card', 'paypal', 'other']
        }],
        hasOnlinePresence: { type: Boolean, default: false },
        onlineChannels: [{
            type: String,
            enum: ['facebook', 'instagram', 'whatsapp', 'website', 'tiktok', 'other']
        }],
        usesBusinessSoftware: { type: Boolean, default: false },
        softwareUsed: [String],
        sellsOnline: { type: Boolean, default: false },
        onlineSalesPercentage: Number
    },

    skillsGained: [{
        skill: String,
        proficiencyBefore: { type: Number, min: 1, max: 5 },
        proficiencyAfter: { type: Number, min: 1, max: 5 }
    }],

    platformImpact: {
        helpedFindJob: { type: Boolean, default: false },
        helpedStartBusiness: { type: Boolean, default: false },
        helpedGrowBusiness: { type: Boolean, default: false },
        helpedIncreaseIncome: { type: Boolean, default: false },
        incomeIncreasePercentage: Number,
        overallSatisfaction: { type: Number, min: 1, max: 5 },
        wouldRecommend: { type: Boolean, default: true },
        testimonial: String
    },

    challenges: [{
        type: String,
        enum: [
            'internet_access',
            'device_access',
            'time_constraints',
            'language_barrier',
            'content_difficulty',
            'technical_issues',
            'other'
        ]
    }],

    completedAt: {
        type: Date,
        default: Date.now
    },

    remindersSent: {
        type: Number,
        default: 0
    },

    lastReminderAt: Date
}, {
    timestamps: true
});

// Compound indexes
economicSurveySchema.index({ userId: 1, surveyType: 1 }, { unique: true });
economicSurveySchema.index({ surveyType: 1, completedAt: 1 });

// Virtual for income range midpoint (for calculations)
economicSurveySchema.virtual('incomeMidpoint').get(function () {
    const midpoints = {
        'below_5k': 2500,
        '5k_10k': 7500,
        '10k_20k': 15000,
        '20k_30k': 25000,
        '30k_50k': 40000,
        '50k_100k': 75000,
        'above_100k': 150000,
        'prefer_not_say': null
    };
    return midpoints[this.income?.range] || null;
});

// Method to calculate improvement from baseline
economicSurveySchema.methods.calculateImprovement = async function () {
    if (this.surveyType === 'baseline') {
        return null;
    }

    const baseline = await this.constructor.findOne({
        userId: this.userId,
        surveyType: 'baseline'
    });

    if (!baseline) {
        return null;
    }

    const baselineMidpoint = baseline.incomeMidpoint;
    const currentMidpoint = this.incomeMidpoint;

    if (!baselineMidpoint || !currentMidpoint) {
        return null;
    }

    return {
        incomeChange: currentMidpoint - baselineMidpoint,
        percentageChange: ((currentMidpoint - baselineMidpoint) / baselineMidpoint) * 100,
        employmentChanged: baseline.employment?.status !== this.employment?.status,
        businessStarted: !baseline.business?.hasBusiness && this.business?.hasBusiness,
        digitalAdoption: {
            payments: !baseline.digitalSkillsApplication?.usesDigitalPayments &&
                this.digitalSkillsApplication?.usesDigitalPayments,
            onlinePresence: !baseline.digitalSkillsApplication?.hasOnlinePresence &&
                this.digitalSkillsApplication?.hasOnlinePresence,
            onlineSales: !baseline.digitalSkillsApplication?.sellsOnline &&
                this.digitalSkillsApplication?.sellsOnline
        }
    };
};

// Static method to get survey completion rate
economicSurveySchema.statics.getCompletionRate = async function (surveyType) {
    const User = require('./User');
    const totalUsers = await User.countDocuments({ isActive: true });
    const completedSurveys = await this.countDocuments({ surveyType });

    return {
        total: totalUsers,
        completed: completedSurveys,
        rate: totalUsers > 0 ? (completedSurveys / totalUsers) * 100 : 0
    };
};

// Static method to get aggregate economic impact
economicSurveySchema.statics.getAggregateImpact = async function () {
    const results = await this.aggregate([
        {
            $match: { surveyType: { $ne: 'baseline' } }
        },
        {
            $group: {
                _id: null,
                totalResponses: { $sum: 1 },
                helpedFindJob: {
                    $sum: { $cond: ['$platformImpact.helpedFindJob', 1, 0] }
                },
                helpedStartBusiness: {
                    $sum: { $cond: ['$platformImpact.helpedStartBusiness', 1, 0] }
                },
                helpedGrowBusiness: {
                    $sum: { $cond: ['$platformImpact.helpedGrowBusiness', 1, 0] }
                },
                helpedIncreaseIncome: {
                    $sum: { $cond: ['$platformImpact.helpedIncreaseIncome', 1, 0] }
                },
                avgSatisfaction: { $avg: '$platformImpact.overallSatisfaction' },
                wouldRecommend: {
                    $sum: { $cond: ['$platformImpact.wouldRecommend', 1, 0] }
                }
            }
        }
    ]);

    return results[0] || {
        totalResponses: 0,
        helpedFindJob: 0,
        helpedStartBusiness: 0,
        helpedGrowBusiness: 0,
        helpedIncreaseIncome: 0,
        avgSatisfaction: 0,
        wouldRecommend: 0
    };
};

module.exports = mongoose.model('EconomicSurvey', economicSurveySchema);
