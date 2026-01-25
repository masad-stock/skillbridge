const mongoose = require('mongoose');

/**
 * Enhanced Content Models
 * These schemas define the structure for enhanced learning content
 * including interactive elements, exercises, and contextual information
 */

// Interactive Element Schema
const InteractiveElementSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['quiz', 'checklist', 'template', 'exercise', 'reflection'],
        required: true
    },
    title: { type: String, required: true },
    instructions: String,
    data: {
        // Quiz data
        questions: [{
            question: { type: String, required: true },
            options: [{ type: String, required: true }],
            correctAnswer: { type: Number, required: true },
            explanation: String
        }],
        // Checklist data
        items: [{
            text: { type: String, required: true },
            required: { type: Boolean, default: false },
            completed: { type: Boolean, default: false }
        }],
        // Template data
        templateUrl: String,
        downloadInstructions: String,
        fileType: String,
        fileSize: Number
    },
    metadata: {
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
        version: { type: Number, default: 1 }
    }
});

// Content Section Schema
const ContentSectionSchema = new mongoose.Schema({
    id: { type: String, required: true },
    title: { type: String, required: true },
    type: {
        type: String,
        enum: ['introduction', 'lesson', 'exercise', 'assessment', 'summary'],
        required: true
    },
    content: { type: String, required: true }, // Rich HTML content
    estimatedTime: { type: Number, default: 0 }, // minutes
    learningObjectives: [String],
    keyTakeaways: [String],
    interactiveElements: [InteractiveElementSchema],
    resources: [{
        title: { type: String, required: true },
        type: {
            type: String,
            enum: ['pdf', 'video', 'article', 'interactive', 'template', 'link'],
            required: true
        },
        url: { type: String, required: true },
        description: String,
        size: Number, // in MB
        isExternal: { type: Boolean, default: true },
        kenyanRelevance: String // How this resource relates to Kenyan context
    }],
    prerequisites: [String], // Skills or knowledge needed for this section
    difficulty: { type: Number, min: 1, max: 3, default: 1 },
    order: { type: Number, required: true }
});

// Practical Exercise Schema
const PracticalExerciseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    difficulty: { type: Number, min: 1, max: 3, default: 1 },
    estimatedTime: { type: Number, required: true }, // minutes
    category: {
        type: String,
        enum: ['hands-on', 'simulation', 'case-study', 'project'],
        default: 'hands-on'
    },
    tools: [{
        name: { type: String, required: true },
        type: {
            type: String,
            enum: ['free', 'paid', 'mobile', 'web', 'desktop'],
            required: true
        },
        alternatives: [String],
        kenyanAvailability: {
            available: { type: Boolean, default: true },
            notes: String,
            localAlternatives: [String]
        },
        downloadUrl: String,
        cost: {
            amount: Number,
            currency: { type: String, default: 'KES' },
            billing: { type: String, enum: ['one-time', 'monthly', 'yearly'] }
        }
    }],
    steps: [{
        stepNumber: { type: Number, required: true },
        instruction: { type: String, required: true },
        screenshot: String, // URL to screenshot
        tips: [String],
        commonMistakes: [String],
        expectedResult: String,
        troubleshooting: [{
            issue: String,
            solution: String
        }]
    }],
    expectedOutcome: { type: String, required: true },
    evaluationCriteria: [{
        criterion: { type: String, required: true },
        weight: { type: Number, min: 0, max: 100 },
        description: String
    }],
    successMetrics: [String],
    kenyanContext: {
        businessScenario: String,
        localExamples: [String],
        culturalConsiderations: [String]
    }
});

// Troubleshooting Guide Schema
const TroubleshootingSchema = new mongoose.Schema({
    problem: { type: String, required: true },
    category: {
        type: String,
        enum: ['technical', 'process', 'access', 'understanding'],
        required: true
    },
    symptoms: [{ type: String, required: true }],
    solutions: [{
        step: { type: Number, required: true },
        action: { type: String, required: true },
        explanation: String,
        screenshot: String
    }],
    prevention: String,
    relatedProblems: [String],
    difficulty: { type: Number, min: 1, max: 3, default: 1 },
    kenyanSpecific: {
        isKenyanSpecific: { type: Boolean, default: false },
        context: String,
        localResources: [String]
    }
});

// Career Pathway Schema
const CareerPathwaySchema = new mongoose.Schema({
    jobOpportunities: [{
        title: { type: String, required: true },
        description: String,
        averageSalary: {
            min: Number,
            max: Number,
            currency: { type: String, default: 'KES' }
        },
        requirements: [String],
        kenyanMarket: {
            demand: { type: String, enum: ['high', 'medium', 'low'] },
            growth: { type: String, enum: ['growing', 'stable', 'declining'] },
            notes: String
        }
    }],
    nextSteps: [{
        step: { type: String, required: true },
        description: String,
        timeframe: String,
        resources: [String]
    }],
    advancedSkills: [{
        skill: { type: String, required: true },
        description: String,
        learningResources: [String],
        difficulty: { type: Number, min: 1, max: 3 }
    }],
    certifications: [{
        name: { type: String, required: true },
        provider: String,
        cost: {
            amount: Number,
            currency: { type: String, default: 'KES' }
        },
        duration: String,
        kenyanRecognition: String,
        url: String
    }]
});

// Kenyan Context Schema
const KenyanContextSchema = new mongoose.Schema({
    localExamples: [{
        title: { type: String, required: true },
        description: { type: String, required: true },
        category: {
            type: String,
            enum: ['business', 'government', 'education', 'healthcare', 'agriculture'],
            required: true
        },
        location: String, // City or region in Kenya
        impact: String,
        source: String
    }],
    businessCases: [{
        companyName: String,
        industry: { type: String, required: true },
        challenge: { type: String, required: true },
        solution: { type: String, required: true },
        outcome: { type: String, required: true },
        lessons: [String],
        applicability: String // How this applies to learners
    }],
    regulations: [{
        title: { type: String, required: true },
        description: { type: String, required: true },
        authority: String, // Which government body
        compliance: [String],
        penalties: String,
        resources: [String],
        lastUpdated: Date
    }],
    localTools: [{
        name: { type: String, required: true },
        description: { type: String, required: true },
        category: {
            type: String,
            enum: ['payment', 'communication', 'business', 'education', 'government'],
            required: true
        },
        provider: String,
        cost: {
            type: { type: String, enum: ['free', 'paid', 'freemium'] },
            amount: Number,
            currency: { type: String, default: 'KES' }
        },
        availability: {
            mobile: Boolean,
            web: Boolean,
            offline: Boolean
        },
        popularity: { type: String, enum: ['high', 'medium', 'low'] },
        alternatives: [String]
    }]
});

// Content validation functions
const ContentValidation = {
    validateSection: function (section) {
        const errors = [];

        if (!section.title || section.title.trim().length === 0) {
            errors.push('Section title is required');
        }

        if (!section.content || section.content.trim().length === 0) {
            errors.push('Section content is required');
        }

        if (section.estimatedTime < 0) {
            errors.push('Estimated time cannot be negative');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    },

    validateExercise: function (exercise) {
        const errors = [];

        if (!exercise.title || exercise.title.trim().length === 0) {
            errors.push('Exercise title is required');
        }

        if (!exercise.steps || exercise.steps.length === 0) {
            errors.push('Exercise must have at least one step');
        }

        if (!exercise.expectedOutcome || exercise.expectedOutcome.trim().length === 0) {
            errors.push('Exercise must have an expected outcome');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    },

    validateInteractiveElement: function (element) {
        const errors = [];

        if (!element.title || element.title.trim().length === 0) {
            errors.push('Interactive element title is required');
        }

        if (element.type === 'quiz' && (!element.data.questions || element.data.questions.length === 0)) {
            errors.push('Quiz must have at least one question');
        }

        if (element.type === 'checklist' && (!element.data.items || element.data.items.length === 0)) {
            errors.push('Checklist must have at least one item');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
};

// Export schemas and validation
module.exports = {
    InteractiveElementSchema,
    ContentSectionSchema,
    PracticalExerciseSchema,
    TroubleshootingSchema,
    CareerPathwaySchema,
    KenyanContextSchema,
    ContentValidation
};