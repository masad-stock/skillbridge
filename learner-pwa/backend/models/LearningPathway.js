/**
 * Learning Pathway Model
 * Personalized learning sequences based on competency evaluation
 */

const mongoose = require('mongoose');

const pathwayModuleSchema = new mongoose.Schema({
    moduleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Module',
        required: true
    },
    sequenceOrder: {
        type: Number,
        required: true
    },
    prerequisitesMet: {
        type: Boolean,
        default: false
    },
    recommendationReason: String,
    estimatedDuration: Number, // hours
    difficulty: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        required: true
    },
    status: {
        type: String,
        enum: ['locked', 'available', 'in-progress', 'completed'],
        default: 'locked'
    },
    contentVariant: String, // Which version of content to show
    difficultyAdjustment: {
        type: Number,
        min: -2,
        max: 2,
        default: 0
    },
    additionalResources: [String],
    startedAt: Date,
    completedAt: Date
}, { _id: false });

const adaptationHistorySchema = new mongoose.Schema({
    date: {
        type: Date,
        default: Date.now
    },
    reason: String,
    changesMade: String,
    triggerMetric: String,
    previousSequence: [Number],
    newSequence: [Number]
}, { _id: false });

const learningPathwaySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },

    createdDate: {
        type: Date,
        default: Date.now
    },

    lastUpdated: {
        type: Date,
        default: Date.now
    },

    // Pathway Configuration
    targetCompetencyLevel: {
        type: String,
        enum: ['intermediate', 'advanced', 'expert'],
        default: 'intermediate'
    },

    focusAreas: [{
        type: String,
        enum: [
            'basicDigitalLiteracy',
            'digitalCommunication',
            'eCommerce',
            'digitalFinancialServices',
            'businessAutomation',
            'digitalMarketing',
            'dataManagement'
        ]
    }],

    learningStyle: {
        type: String,
        enum: ['visual', 'auditory', 'kinesthetic', 'reading', 'mixed'],
        default: 'mixed'
    },

    availableTimePerWeek: {
        type: Number,
        default: 10 // hours
    },

    // Personalized Module Sequence
    modules: [pathwayModuleSchema],

    // Progress Tracking
    currentModuleIndex: {
        type: Number,
        default: 0
    },

    completedModules: {
        type: Number,
        default: 0
    },

    totalEstimatedHours: {
        type: Number,
        default: 0
    },

    hoursCompleted: {
        type: Number,
        default: 0
    },

    projectedCompletionDate: Date,

    // Adaptation History
    adaptations: [adaptationHistorySchema],

    // Metadata
    competencyScoreId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CompetencyScore'
    },

    isActive: {
        type: Boolean,
        default: true
    },

    completionPercentage: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    }
}, {
    timestamps: true
});

// Indexes
learningPathwaySchema.index({ userId: 1, isActive: 1 });
learningPathwaySchema.index({ createdDate: -1 });

// Virtual for current module
learningPathwaySchema.virtual('currentModule').get(function () {
    return this.modules[this.currentModuleIndex];
});

// Virtual for next modules
learningPathwaySchema.virtual('nextModules').get(function () {
    return this.modules.slice(this.currentModuleIndex + 1, this.currentModuleIndex + 4);
});

// Method to calculate total estimated hours
learningPathwaySchema.methods.calculateTotalHours = function () {
    this.totalEstimatedHours = this.modules.reduce((sum, module) => {
        return sum + (module.estimatedDuration || 0);
    }, 0);
    return this.totalEstimatedHours;
};

// Method to calculate completion percentage
learningPathwaySchema.methods.calculateCompletionPercentage = function () {
    if (this.modules.length === 0) {
        this.completionPercentage = 0;
        return 0;
    }

    const completed = this.modules.filter(m => m.status === 'completed').length;
    this.completionPercentage = Math.round((completed / this.modules.length) * 100);
    return this.completionPercentage;
};

// Method to update projected completion date
learningPathwaySchema.methods.updateProjectedCompletion = function () {
    const remainingHours = this.totalEstimatedHours - this.hoursCompleted;
    const weeksNeeded = Math.ceil(remainingHours / this.availableTimePerWeek);

    this.projectedCompletionDate = new Date();
    this.projectedCompletionDate.setDate(this.projectedCompletionDate.getDate() + (weeksNeeded * 7));

    return this.projectedCompletionDate;
};

// Method to unlock next module
learningPathwaySchema.methods.unlockNextModule = function () {
    const currentModule = this.modules[this.currentModuleIndex];

    if (currentModule && currentModule.status === 'completed') {
        this.currentModuleIndex++;

        if (this.currentModuleIndex < this.modules.length) {
            const nextModule = this.modules[this.currentModuleIndex];
            if (nextModule.prerequisitesMet) {
                nextModule.status = 'available';
            }
        }
    }
};

// Method to mark module as completed
learningPathwaySchema.methods.completeModule = async function (moduleId, hoursSpent) {
    const moduleIndex = this.modules.findIndex(m =>
        m.moduleId.toString() === moduleId.toString()
    );

    if (moduleIndex !== -1) {
        this.modules[moduleIndex].status = 'completed';
        this.modules[moduleIndex].completedAt = new Date();
        this.completedModules++;
        this.hoursCompleted += hoursSpent || 0;

        this.calculateCompletionPercentage();
        this.updateProjectedCompletion();

        // Unlock next module if this was the current one
        if (moduleIndex === this.currentModuleIndex) {
            this.unlockNextModule();
        }

        await this.save();
    }
};

// Method to adapt pathway based on performance
learningPathwaySchema.methods.adaptPathway = async function (reason, changes) {
    const previousSequence = this.modules.map(m => m.sequenceOrder);

    // Record adaptation
    this.adaptations.push({
        date: new Date(),
        reason,
        changesMade: JSON.stringify(changes),
        triggerMetric: changes.triggerMetric || 'manual',
        previousSequence,
        newSequence: [] // Will be filled after changes
    });

    // Apply changes
    if (changes.reorder) {
        // Reorder modules based on new priorities
        this.modules.sort((a, b) => {
            const aPriority = changes.priorities?.[a.moduleId] || a.sequenceOrder;
            const bPriority = changes.priorities?.[b.moduleId] || b.sequenceOrder;
            return aPriority - bPriority;
        });

        // Update sequence orders
        this.modules.forEach((module, index) => {
            module.sequenceOrder = index + 1;
        });
    }

    if (changes.addModules) {
        // Add new recommended modules
        changes.addModules.forEach((newModule, index) => {
            this.modules.push({
                moduleId: newModule.moduleId,
                sequenceOrder: this.modules.length + index + 1,
                prerequisitesMet: true,
                recommendationReason: newModule.reason,
                estimatedDuration: newModule.duration || 5,
                difficulty: newModule.difficulty || 'intermediate',
                status: 'locked'
            });
        });
    }

    if (changes.removeModules) {
        // Remove modules that are no longer relevant
        this.modules = this.modules.filter(m =>
            !changes.removeModules.includes(m.moduleId.toString())
        );
    }

    // Update adaptation record with new sequence
    const lastAdaptation = this.adaptations[this.adaptations.length - 1];
    lastAdaptation.newSequence = this.modules.map(m => m.sequenceOrder);

    this.lastUpdated = new Date();
    this.calculateTotalHours();
    this.updateProjectedCompletion();

    await this.save();
};

// Static method to get active pathway for user
learningPathwaySchema.statics.getActivePathway = async function (userId) {
    return await this.findOne({ userId, isActive: true })
        .populate('modules.moduleId')
        .populate('competencyScoreId');
};

// Static method to get pathway statistics
learningPathwaySchema.statics.getPathwayStatistics = async function (filters = {}) {
    const matchStage = { isActive: true };

    if (filters.targetLevel) {
        matchStage.targetCompetencyLevel = filters.targetLevel;
    }

    const stats = await this.aggregate([
        { $match: matchStage },
        {
            $group: {
                _id: null,
                totalPathways: { $sum: 1 },
                avgCompletionPercentage: { $avg: '$completionPercentage' },
                avgModulesPerPathway: { $avg: { $size: '$modules' } },
                avgEstimatedHours: { $avg: '$totalEstimatedHours' },
                totalAdaptations: { $sum: { $size: '$adaptations' } },
                completedPathways: {
                    $sum: { $cond: [{ $eq: ['$completionPercentage', 100] }, 1, 0] }
                }
            }
        }
    ]);

    return stats[0] || {
        totalPathways: 0,
        avgCompletionPercentage: 0,
        avgModulesPerPathway: 0,
        avgEstimatedHours: 0,
        totalAdaptations: 0,
        completedPathways: 0
    };
};

// Pre-save hook
learningPathwaySchema.pre('save', function (next) {
    this.lastUpdated = new Date();
    this.calculateCompletionPercentage();
    next();
});

module.exports = mongoose.model('LearningPathway', learningPathwaySchema);
