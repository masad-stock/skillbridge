const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    module: { type: mongoose.Schema.Types.ObjectId, ref: 'Module', required: true },
    status: {
        type: String,
        enum: ['not_started', 'in_progress', 'completed', 'paused'],
        default: 'not_started'
    },
    progress: { type: Number, min: 0, max: 100, default: 0 },
    score: { type: Number, min: 0, max: 100, default: 0 },
    timeSpent: { type: Number, default: 0 }, // minutes
    lastAccessedAt: { type: Date, default: Date.now },
    startedAt: Date,
    completedAt: Date,
    skillsAcquired: [{ type: String }],
    activities: [{
        type: { type: String, enum: ['video_watched', 'quiz_completed', 'material_downloaded', 'practice_completed', 'module_completed', 'lesson_completed'] },
        timestamp: { type: Date, default: Date.now },
        data: mongoose.Schema.Types.Mixed
    }],
    quizScores: [{
        quizId: String,
        score: Number,
        attempts: Number,
        completedAt: Date
    }],
    notes: String,
    bookmarks: [{
        timestamp: Number,
        note: String,
        createdAt: { type: Date, default: Date.now }
    }],
    rating: { type: Number, min: 1, max: 5 },
    feedback: String
}, {
    timestamps: true
});

// Index for efficient queries
progressSchema.index({ user: 1, module: 1 }, { unique: true });
progressSchema.index({ user: 1, status: 1 });

module.exports = mongoose.model('Progress', progressSchema);
