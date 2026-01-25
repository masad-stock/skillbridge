const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: 6,
        select: false
    },
    profile: {
        firstName: { type: String, required: true, trim: true },
        lastName: { type: String, required: true, trim: true },
        phoneNumber: { type: String, trim: true },
        profilePhoto: { type: String }, // URL to profile photo
        dateOfBirth: Date,
        gender: { type: String, enum: ['male', 'female', 'other', 'prefer_not_to_say'] },
        location: {
            constituency: { type: String, default: 'Kiharu' },
            ward: String,
            village: String
        },
        education: {
            level: { type: String, enum: ['primary', 'secondary', 'tertiary', 'university', 'none'] },
            institution: String
        },
        employment: {
            status: { type: String, enum: ['employed', 'self_employed', 'unemployed', 'student'] },
            sector: String
        }
    },
    role: {
        type: String,
        enum: ['user', 'instructor', 'admin'],
        default: 'user'
    },
    skillsProfile: {
        assessmentCompleted: { type: Boolean, default: false },
        lastAssessmentDate: Date,
        competencyLevels: {
            basic_digital: { type: Number, min: 0, max: 4, default: 0 },
            business_automation: { type: Number, min: 0, max: 4, default: 0 },
            e_commerce: { type: Number, min: 0, max: 4, default: 0 },
            digital_marketing: { type: Number, min: 0, max: 4, default: 0 },
            financial_management: { type: Number, min: 0, max: 4, default: 0 },
            communication: { type: Number, min: 0, max: 4, default: 0 }
        },
        overallScore: { type: Number, min: 0, max: 100, default: 0 },
        // ML-enhanced fields
        mlCompetencyProfile: {
            confidence: { type: Number, min: 0, max: 1 },
            probabilities: {
                beginner: Number,
                intermediate: Number,
                advanced: Number,
                expert: Number
            },
            lastMLAssessment: Date,
            mlMethod: { type: String, enum: ['ml-model', 'rule-based-fallback'] }
        },
        learningStyle: {
            style: { type: String, enum: ['visual', 'auditory', 'kinesthetic', 'reading', 'balanced'] },
            confidence: Number,
            detectedDate: Date,
            preferences: {
                videoRatio: Number,
                textRatio: Number,
                interactiveRatio: Number
            }
        },
        assessmentHistory: [{
            date: Date,
            responses: Array,
            timings: Array,
            confidence: Array,
            competencyLevel: Number,
            mlConfidence: Number
        }]
    },
    learningProgress: {
        enrolledModules: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Module' }],
        completedModules: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Module' }],
        currentModule: { type: mongoose.Schema.Types.ObjectId, ref: 'Module' },
        totalTimeSpent: { type: Number, default: 0 }, // minutes
        lastActiveDate: Date
    },
    businessProfile: {
        hasBusinesss: { type: Boolean, default: false },
        businessName: String,
        businessType: String,
        businessSize: { type: String, enum: ['micro', 'small', 'medium'] },
        monthlyRevenue: Number,
        toolsUsed: [String]
    },
    preferences: {
        language: { type: String, default: 'en', enum: ['en', 'sw'] },
        notifications: { type: Boolean, default: true },
        offlineMode: { type: Boolean, default: true }
    },
    researchParticipant: {
        consentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Consent' },
        experimentGroup: String,
        enrolledAt: Date,
        baselineAssessmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'ResearchAssessment' },
        followUpSchedule: [{
            date: Date,
            type: { type: String, enum: ['retention_3m', 'retention_6m'] },
            skillCategory: String,
            completed: { type: Boolean, default: false }
        }]
    },
    accessibilityPreferences: {
        voiceGuidance: { type: Boolean, default: false },
        simplifiedUI: { type: Boolean, default: false },
        language: { type: String, default: 'en', enum: ['en', 'sw'] },
        speechRate: { type: Number, default: 1.0, min: 0.5, max: 2.0 },
        highContrast: { type: Boolean, default: false },
        fontSize: { type: String, default: 'medium', enum: ['small', 'medium', 'large'] }
    },
    economicBaseline: {
        incomeRange: String,
        employmentStatus: String,
        hasBusiness: { type: Boolean, default: false },
        surveyCompletedAt: Date
    },
    interventionHistory: [{
        interventionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Intervention' },
        type: String,
        deliveredAt: Date,
        responded: { type: Boolean, default: false }
    }],
    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
    verificationToken: String,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    lastLogin: Date
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Generate password reset token
userSchema.methods.generateResetToken = function () {
    const crypto = require('crypto');

    // Generate token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Hash token and set to resetPasswordToken field
    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // Set expire time (1 hour)
    this.resetPasswordExpire = Date.now() + 60 * 60 * 1000;

    return resetToken;
};

// Verify reset token
userSchema.statics.findByResetToken = async function (resetToken) {
    const crypto = require('crypto');

    // Hash the token to compare with stored hash
    const hashedToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // Find user with valid token
    return await this.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpire: { $gt: Date.now() }
    });
};

// Generate full name
userSchema.virtual('fullName').get(function () {
    return `${this.profile.firstName} ${this.profile.lastName}`;
});

// Ensure virtuals are included in JSON
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('User', userSchema);
