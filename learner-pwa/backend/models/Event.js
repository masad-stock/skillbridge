const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Event title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
        type: String,
        required: [true, 'Event description is required']
    },
    startDate: {
        type: Date,
        required: [true, 'Start date is required']
    },
    endDate: {
        type: Date,
        default: null
    },
    location: {
        type: String,
        trim: true,
        default: null
    },
    isOnline: {
        type: Boolean,
        default: false
    },
    meetingLink: {
        type: String,
        default: null
    },
    category: {
        type: String,
        trim: true,
        default: 'General'
    },
    image: {
        type: String,
        default: null
    },
    organizer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    maxAttendees: {
        type: Number,
        default: null
    },
    attendees: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        registeredAt: {
            type: Date,
            default: Date.now
        },
        attended: {
            type: Boolean,
            default: false
        }
    }],
    status: {
        type: String,
        enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
        default: 'upcoming'
    },
    tags: [{
        type: String,
        trim: true
    }]
}, {
    timestamps: true
});

// Virtual for checking if event is full
eventSchema.virtual('isFull').get(function () {
    if (!this.maxAttendees) return false;
    return this.attendees.length >= this.maxAttendees;
});

// Virtual for attendee count
eventSchema.virtual('attendeeCount').get(function () {
    return this.attendees.length;
});

// Method to check if user is registered
eventSchema.methods.isUserRegistered = function (userId) {
    return this.attendees.some(attendee =>
        attendee.user.toString() === userId.toString()
    );
};

// Method to register user
eventSchema.methods.registerUser = function (userId) {
    if (this.isUserRegistered(userId)) {
        throw new Error('User already registered for this event');
    }
    if (this.isFull) {
        throw new Error('Event is full');
    }
    this.attendees.push({ user: userId });
    return this.save();
};

// Method to unregister user
eventSchema.methods.unregisterUser = function (userId) {
    this.attendees = this.attendees.filter(attendee =>
        attendee.user.toString() !== userId.toString()
    );
    return this.save();
};

// Indexes for better query performance
eventSchema.index({ startDate: 1 });
eventSchema.index({ endDate: 1 });
eventSchema.index({ status: 1 });
eventSchema.index({ category: 1 });
eventSchema.index({ organizer: 1 });
eventSchema.index({ 'attendees.user': 1 });

// Ensure virtuals are included in JSON
eventSchema.set('toJSON', { virtuals: true });
eventSchema.set('toObject', { virtuals: true });

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
