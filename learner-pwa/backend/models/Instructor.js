const mongoose = require('mongoose');

const instructorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Instructor name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    title: {
        type: String,
        trim: true
    },
    bio: {
        type: String,
        trim: true
    },
    avatar: {
        type: String, // URL to avatar image
        default: ''
    },
    expertise: [{
        type: String,
        trim: true
    }],
    socialLinks: {
        linkedin: { type: String, trim: true },
        twitter: { type: String, trim: true },
        github: { type: String, trim: true },
        website: { type: String, trim: true }
    },
    stats: {
        rating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },
        students: {
            type: Number,
            default: 0,
            min: 0
        },
        courses: {
            type: Number,
            default: 0,
            min: 0
        }
    },
    courses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Module'
    }],
    active: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Index for search functionality
instructorSchema.index({ name: 'text', expertise: 'text' });

// Virtual for full profile URL
instructorSchema.virtual('profileUrl').get(function () {
    return `/instructors/${this._id}`;
});

// Method to update course count
instructorSchema.methods.updateCourseCount = async function () {
    this.stats.courses = this.courses.length;
    await this.save();
};

// Ensure virtuals are included in JSON
instructorSchema.set('toJSON', { virtuals: true });
instructorSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Instructor', instructorSchema);
