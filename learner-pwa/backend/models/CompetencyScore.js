/**
 * Competency Score Model
 * Tracks multi-dimensional digital skills competency for personalized learning
 */

const mongoose = require('mongoose');

const subSkillSchema = new mongoose.Schema({
    name: String,
    score: { type: Number, min: 0, max: 100 },
    assessmentDate: Date,
    evidenceCount: { type: Number, default: 0 } // Number of assessments/activities contributing to this score
}, { _id: false });

const competencyDomainSchema = new mongoose.Schema({
    score: { type: Number, min: 0, max: 100, required: true },
    level: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced', 'expert'],
        required: true
    },
    subSkills: [subSkillSchema],
    lastAssessed: Date,
    assessmentCount: { type: Number, default: 0 }
}, { _id: false });

const competencyScoreSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },

    evaluationDate: {
        type: Date,
        default: Date.now,
        index: true
    },

    // Seven core competency domains aligned with digital economy needs
    competencies: {
        basicDigitalLiteracy: {
            type: competencyDomainSchema,
            default: () => ({
                score: 0,
                level: 'beginner',
                subSkills: [
                    { name: 'deviceOperation', score: 0 },
                    { name: 'fileManagement', score: 0 },
                    { name: 'internetNavigation', score: 0 },
                    { name: 'emailCommunication', score: 0 }
                ]
            })
        },

        digitalCommunication: {
            type: competencyDomainSchema,
            default: () => ({
                score: 0,
                level: 'beginner',
                subSkills: [
                    { name: 'professionalEmail', score: 0 },
                    { name: 'videoConferencing', score: 0 },
                    { name: 'collaborationTools', score: 0 },
                    { name: 'socialMediaProfessional', score: 0 }
                ]
            })
        },

        eCommerce: {
            type: competencyDomainSchema,
            default: () => ({
                score: 0,
                level: 'beginner',
                subSkills: [
                    { name: 'onlineMarketplaces', score: 0 },
                    { name: 'productListing', score: 0 },
                    { name: 'orderManagement', score: 0 },
                    { name: 'customerService', score: 0 }
                ]
            })
        },

        digitalFinancialServices: {
            type: competencyDomainSchema,
            default: () => ({
                score: 0,
                level: 'beginner',
                subSkills: [
                    { name: 'mobileMoney', score: 0 },
                    { name: 'onlinePayments', score: 0 },
                    { name: 'digitalBanking', score: 0 },
                    { name: 'financialRecordKeeping', score: 0 }
                ]
            })
        },

        businessAutomation: {
            type: competencyDomainSchema,
            default: () => ({
                score: 0,
                level: 'beginner',
                subSkills: [
                    { name: 'inventoryManagement', score: 0 },
                    { name: 'paymentTracking', score: 0 },
                    { name: 'customerRelationshipManagement', score: 0 },
                    { name: 'businessAnalytics', score: 0 }
                ]
            })
        },

        digitalMarketing: {
            type: competencyDomainSchema,
            default: () => ({
                score: 0,
                level: 'beginner',
                subSkills: [
                    { name: 'socialMediaMarketing', score: 0 },
                    { name: 'contentCreation', score: 0 },
                    { name: 'onlineAdvertising', score: 0 },
                    { name: 'customerEngagement', score: 0 }
                ]
            })
        },

        dataManagement: {
            type: competencyDomainSchema,
            default: () => ({
                score: 0,
                level: 'beginner',
                subSkills: [
                    { name: 'spreadsheetBasics', score: 0 },
                    { name: 'dataEntry', score: 0 },
                    { name: 'dataAnalysis', score: 0 },
                    { name: 'reportGeneration', score: 0 }
                ]
            })
        }
    },

    // Overall metrics
    overallScore: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },

    overallLevel: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced', 'expert'],
        default: 'beginner'
    },

    // Learning characteristics
    learningVelocity: {
        type: Number,
        default: 0,
        min: 0,
        max: 10 // Score representing how quickly user is progressing
    },

    strengthAreas: [{
        domain: String,
        score: Number
    }],

    improvementAreas: [{
        domain: String,
        score: Number,
        priority: { type: String, enum: ['high', 'medium', 'low'] }
    }],

    // Recommendations
    suggestedModules: [{
        moduleId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Module'
        },
        reason: String,
        priority: Number
    }],

    estimatedTimeToNextLevel: {
        type: Number, // hours
        default: 0
    },

    // Confidence and reliability metrics
    confidenceScore: {
        type: Number,
        min: 0,
        max: 1,
        default: 0.5 // How confident we are in this evaluation
    },

    dataQuality: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'low'
    },

    // Tracking
    previousEvaluationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CompetencyScore'
    },

    evaluationMethod: {
        type: String,
        enum: ['assessment', 'ml_model', 'activity_based', 'hybrid'],
        default: 'hybrid'
    },

    mlModelVersion: String,

    notes: String
}, {
    timestamps: true
});

// Indexes
competencyScoreSchema.index({ userId: 1, evaluationDate: -1 });
competencyScoreSchema.index({ overallScore: 1 });
competencyScoreSchema.index({ overallLevel: 1 });

// Virtual for competency domains as array
competencyScoreSchema.virtual('competencyArray').get(function () {
    return Object.keys(this.competencies).map(key => ({
        domain: key,
        ...this.competencies[key]
    }));
});

// Method to calculate overall score from domain scores
competencyScoreSchema.methods.calculateOverallScore = function () {
    const domains = Object.keys(this.competencies);
    const totalScore = domains.reduce((sum, domain) => {
        return sum + (this.competencies[domain]?.score || 0);
    }, 0);

    this.overallScore = Math.round(totalScore / domains.length);
    this.overallLevel = this._scoreToLevel(this.overallScore);

    return this.overallScore;
};

// Method to identify strength and improvement areas
competencyScoreSchema.methods.identifyStrengthsAndWeaknesses = function () {
    const domains = Object.keys(this.competencies).map(key => ({
        domain: key,
        score: this.competencies[key]?.score || 0
    }));

    // Sort by score
    domains.sort((a, b) => b.score - a.score);

    // Top 3 are strengths
    this.strengthAreas = domains.slice(0, 3).map(d => ({
        domain: d.domain,
        score: d.score
    }));

    // Bottom 3 are improvement areas with priority
    this.improvementAreas = domains.slice(-3).map((d, index) => ({
        domain: d.domain,
        score: d.score,
        priority: index === 0 ? 'high' : index === 1 ? 'medium' : 'low'
    }));

    return { strengths: this.strengthAreas, improvements: this.improvementAreas };
};

// Method to calculate learning velocity
competencyScoreSchema.methods.calculateLearningVelocity = async function () {
    if (!this.previousEvaluationId) {
        this.learningVelocity = 0;
        return 0;
    }

    const previousEval = await this.constructor.findById(this.previousEvaluationId);
    if (!previousEval) {
        this.learningVelocity = 0;
        return 0;
    }

    const scoreImprovement = this.overallScore - previousEval.overallScore;
    const timeDiff = (this.evaluationDate - previousEval.evaluationDate) / (1000 * 60 * 60 * 24); // days

    if (timeDiff === 0) {
        this.learningVelocity = 0;
        return 0;
    }

    // Velocity = points gained per week
    const velocity = (scoreImprovement / timeDiff) * 7;
    this.learningVelocity = Math.max(0, Math.min(10, velocity)); // Clamp between 0-10

    return this.learningVelocity;
};

// Method to estimate time to next level
competencyScoreSchema.methods.estimateTimeToNextLevel = function () {
    const currentScore = this.overallScore;
    const velocity = this.learningVelocity || 1; // Default to 1 if no velocity

    let targetScore;
    if (currentScore < 40) targetScore = 40; // To intermediate
    else if (currentScore < 70) targetScore = 70; // To advanced
    else if (currentScore < 90) targetScore = 90; // To expert
    else return 0; // Already at top

    const pointsNeeded = targetScore - currentScore;
    const weeksNeeded = pointsNeeded / velocity;
    const hoursNeeded = weeksNeeded * 10; // Assume 10 hours study per week

    this.estimatedTimeToNextLevel = Math.round(hoursNeeded);
    return this.estimatedTimeToNextLevel;
};

// Static method to get user's latest competency evaluation
competencyScoreSchema.statics.getLatestForUser = async function (userId) {
    return await this.findOne({ userId })
        .sort({ evaluationDate: -1 })
        .populate('suggestedModules.moduleId');
};

// Static method to get competency progression over time
competencyScoreSchema.statics.getProgressionHistory = async function (userId, limit = 10) {
    return await this.find({ userId })
        .sort({ evaluationDate: -1 })
        .limit(limit)
        .select('evaluationDate overallScore overallLevel competencies learningVelocity');
};

// Static method to get cohort statistics
competencyScoreSchema.statics.getCohortStatistics = async function (filters = {}) {
    const matchStage = {};

    if (filters.level) {
        matchStage.overallLevel = filters.level;
    }

    if (filters.minScore) {
        matchStage.overallScore = { $gte: filters.minScore };
    }

    const stats = await this.aggregate([
        { $match: matchStage },
        {
            $group: {
                _id: null,
                totalUsers: { $sum: 1 },
                avgOverallScore: { $avg: '$overallScore' },
                avgLearningVelocity: { $avg: '$learningVelocity' },
                beginners: {
                    $sum: { $cond: [{ $eq: ['$overallLevel', 'beginner'] }, 1, 0] }
                },
                intermediate: {
                    $sum: { $cond: [{ $eq: ['$overallLevel', 'intermediate'] }, 1, 0] }
                },
                advanced: {
                    $sum: { $cond: [{ $eq: ['$overallLevel', 'advanced'] }, 1, 0] }
                },
                expert: {
                    $sum: { $cond: [{ $eq: ['$overallLevel', 'expert'] }, 1, 0] }
                }
            }
        }
    ]);

    return stats[0] || {
        totalUsers: 0,
        avgOverallScore: 0,
        avgLearningVelocity: 0,
        beginners: 0,
        intermediate: 0,
        advanced: 0,
        expert: 0
    };
};

// Helper method to convert score to level
competencyScoreSchema.methods._scoreToLevel = function (score) {
    if (score >= 90) return 'expert';
    if (score >= 70) return 'advanced';
    if (score >= 40) return 'intermediate';
    return 'beginner';
};

// Pre-save hook to calculate derived fields
competencyScoreSchema.pre('save', async function (next) {
    if (this.isModified('competencies')) {
        this.calculateOverallScore();
        this.identifyStrengthsAndWeaknesses();
        await this.calculateLearningVelocity();
        this.estimateTimeToNextLevel();
    }
    next();
});

module.exports = mongoose.model('CompetencyScore', competencyScoreSchema);
