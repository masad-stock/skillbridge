const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    question: { type: String, required: true },
    type: { type: String, enum: ['multiple_choice', 'practical', 'scenario'], required: true },
    options: [String],
    correctAnswer: { type: String, required: true },
    category: { type: String, required: true },
    difficulty: { type: Number, min: 1, max: 4, required: true },
    points: { type: Number, default: 1 }
});

const assessmentSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['initial', 'progress', 'final'], default: 'initial' },
    category: String,
    questions: [questionSchema],
    responses: [{
        questionId: mongoose.Schema.Types.ObjectId,
        userAnswer: String,
        isCorrect: Boolean,
        timeSpent: Number, // seconds
        timestamp: { type: Date, default: Date.now }
    }],
    results: {
        totalQuestions: Number,
        correctAnswers: Number,
        score: Number,
        accuracy: Number,
        categoryScores: mongoose.Schema.Types.Mixed,
        competencyLevel: Number,
        strengths: [String],
        weaknesses: [String],
        recommendations: [String]
    },
    aiAnalysis: {
        learningStyle: String,
        adaptiveRecommendations: [String],
        predictedSuccessRate: Number,
        suggestedPace: String,
        // ML-enhanced fields
        mlPrediction: {
            competencyLevel: Number,
            confidence: Number,
            probabilities: {
                beginner: Number,
                intermediate: Number,
                advanced: Number,
                expert: Number
            },
            method: { type: String, enum: ['ml-model', 'rule-based-fallback'] },
            timestamp: Date
        },
        learningStyleDetection: {
            style: String,
            confidence: Number,
            recommendations: [String],
            timestamp: Date
        },
        performanceMetrics: {
            avgResponseTime: Number,
            responseTimeVariance: Number,
            confidenceScores: [Number],
            streakCorrect: Number,
            streakIncorrect: Number
        }
    },
    status: { type: String, enum: ['in_progress', 'completed', 'abandoned'], default: 'in_progress' },
    startedAt: { type: Date, default: Date.now },
    completedAt: Date,
    duration: Number // minutes
}, {
    timestamps: true
});

// Calculate results before saving
assessmentSchema.pre('save', function (next) {
    if (this.status === 'completed' && !this.results.score) {
        const totalQuestions = this.responses.length;
        const correctAnswers = this.responses.filter(r => r.isCorrect).length;
        const accuracy = (correctAnswers / totalQuestions) * 100;

        this.results = {
            totalQuestions,
            correctAnswers,
            score: Math.round(accuracy),
            accuracy: accuracy.toFixed(2)
        };
    }
    next();
});

module.exports = mongoose.model('Assessment', assessmentSchema);
