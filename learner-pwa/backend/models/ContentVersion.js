const mongoose = require('mongoose');

/**
 * Content Version Model
 * Tracks versions of enhanced content for modules
 * Enables rollback and change tracking
 */

const ContentVersionSchema = new mongoose.Schema({
    moduleId: {
        type: String,
        required: true,
        ref: 'Module'
    },
    version: {
        type: Number,
        required: true,
        min: 1
    },
    versionName: String, // e.g., "v1.0", "Initial Release", "Bug Fix"
    description: String, // What changed in this version

    // Snapshot of enhanced content at this version
    contentSnapshot: {
        sections: [mongoose.Schema.Types.Mixed],
        practicalExercises: [mongoose.Schema.Types.Mixed],
        troubleshooting: [mongoose.Schema.Types.Mixed],
        careerPathways: mongoose.Schema.Types.Mixed,
        kenyanContext: mongoose.Schema.Types.Mixed
    },

    // Change tracking
    changes: [{
        type: {
            type: String,
            enum: ['added', 'modified', 'removed'],
            required: true
        },
        component: {
            type: String,
            enum: ['section', 'exercise', 'troubleshooting', 'career', 'kenyan-context'],
            required: true
        },
        componentId: String, // ID of the changed component
        description: String,
        timestamp: { type: Date, default: Date.now }
    }],

    // Version metadata
    createdBy: {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        name: String,
        role: String
    },

    status: {
        type: String,
        enum: ['draft', 'review', 'approved', 'published', 'archived'],
        default: 'draft'
    },

    // Quality metrics for this version
    metrics: {
        completionRate: Number,
        userRating: Number,
        engagementScore: Number,
        issuesReported: Number
    },

    // Approval workflow
    approvals: [{
        approver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        status: { type: String, enum: ['pending', 'approved', 'rejected'] },
        comments: String,
        timestamp: { type: Date, default: Date.now }
    }],

    isActive: { type: Boolean, default: false }, // Only one version can be active
    publishedAt: Date,
    archivedAt: Date

}, {
    timestamps: true
});

// Indexes for efficient querying
ContentVersionSchema.index({ moduleId: 1, version: -1 });
ContentVersionSchema.index({ moduleId: 1, isActive: 1 });
ContentVersionSchema.index({ status: 1 });

// Methods
ContentVersionSchema.methods.activate = async function () {
    // Deactivate all other versions for this module
    await this.constructor.updateMany(
        { moduleId: this.moduleId, _id: { $ne: this._id } },
        { isActive: false }
    );

    // Activate this version
    this.isActive = true;
    this.status = 'published';
    this.publishedAt = new Date();

    return this.save();
};

ContentVersionSchema.methods.createNextVersion = function (changes = []) {
    const nextVersion = new this.constructor({
        moduleId: this.moduleId,
        version: this.version + 1,
        contentSnapshot: this.contentSnapshot,
        changes: changes,
        createdBy: this.createdBy,
        status: 'draft'
    });

    return nextVersion;
};

// Static methods
ContentVersionSchema.statics.getActiveVersion = function (moduleId) {
    return this.findOne({ moduleId, isActive: true });
};

ContentVersionSchema.statics.getLatestVersion = function (moduleId) {
    return this.findOne({ moduleId }).sort({ version: -1 });
};

ContentVersionSchema.statics.createInitialVersion = function (moduleId, content, createdBy) {
    return new this({
        moduleId,
        version: 1,
        versionName: 'Initial Version',
        description: 'Initial enhanced content version',
        contentSnapshot: content,
        createdBy,
        status: 'draft'
    });
};

module.exports = mongoose.model('ContentVersion', ContentVersionSchema);