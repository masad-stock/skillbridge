const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    module: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Module',
        required: true
    },
    certificateNumber: {
        type: String,
        required: true,
        unique: true
    },
    issueDate: {
        type: Date,
        default: Date.now
    },
    completionDate: {
        type: Date,
        required: true
    },
    score: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    grade: {
        type: String,
        enum: ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F'],
        required: true
    },
    skills: [{
        name: String,
        level: String
    }],
    verificationCode: {
        type: String,
        required: true,
        unique: true
    },
    pdfUrl: {
        type: String
    },
    status: {
        type: String,
        enum: ['issued', 'revoked', 'expired'],
        default: 'issued'
    },
    metadata: {
        duration: Number, // hours spent
        assessmentsPassed: Number,
        modulesCompleted: Number
    }
}, {
    timestamps: true
});

// Generate certificate number
certificateSchema.pre('save', async function (next) {
    if (!this.certificateNumber) {
        const count = await this.constructor.countDocuments();
        const year = new Date().getFullYear();
        this.certificateNumber = `SB-${year}-${String(count + 1).padStart(6, '0')}`;
    }
    next();
});

// Generate verification code
certificateSchema.pre('save', function (next) {
    if (!this.verificationCode) {
        this.verificationCode = require('crypto')
            .randomBytes(16)
            .toString('hex')
            .toUpperCase();
    }
    next();
});

// Calculate grade from score
certificateSchema.pre('save', function (next) {
    if (!this.grade && this.score !== undefined) {
        if (this.score >= 95) this.grade = 'A+';
        else if (this.score >= 90) this.grade = 'A';
        else if (this.score >= 85) this.grade = 'B+';
        else if (this.score >= 80) this.grade = 'B';
        else if (this.score >= 75) this.grade = 'C+';
        else if (this.score >= 70) this.grade = 'C';
        else if (this.score >= 60) this.grade = 'D';
        else this.grade = 'F';
    }
    next();
});

// Index for quick lookups
certificateSchema.index({ user: 1, module: 1 });

module.exports = mongoose.model('Certificate', certificateSchema);
