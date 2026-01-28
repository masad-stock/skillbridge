const mongoose = require('mongoose');

const imageMetadataSchema = new mongoose.Schema({
    contentId: {
        type: String,
        required: true
    },
    contentType: {
        type: String,
        enum: ['module', 'hero', 'category', 'custom'],
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    prompt: {
        type: String,
        required: true
    },
    category: {
        type: String
    },
    isCustom: {
        type: Boolean,
        default: false
    },
    source: {
        type: String,
        enum: ['unsplash', 'dalle', 'stable-diffusion', 'uploaded'],
        required: true
    },
    metadata: {
        width: Number,
        height: Number,
        format: String,
        size: Number
    },
    generatedAt: {
        type: Date,
        default: Date.now
    },
    expiresAt: {
        type: Date
    },
    accessCount: {
        type: Number,
        default: 0
    },
    lastAccessedAt: Date
}, {
    timestamps: true
});

// Index for efficient queries
imageMetadataSchema.index({ contentId: 1 }, { unique: true });
imageMetadataSchema.index({ category: 1 });
imageMetadataSchema.index({ category: 1, contentType: 1 });
imageMetadataSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Method to increment access count
imageMetadataSchema.methods.recordAccess = function () {
    this.accessCount += 1;
    this.lastAccessedAt = new Date();
    return this.save();
};

// Static method to find non-expired images
imageMetadataSchema.statics.findActive = function (query) {
    return this.find({
        ...query,
        $or: [
            { expiresAt: { $exists: false } },
            { expiresAt: null },
            { expiresAt: { $gt: new Date() } }
        ]
    });
};

// Static method to cleanup expired images
imageMetadataSchema.statics.cleanupExpired = async function () {
    const result = await this.deleteMany({
        expiresAt: { $exists: true, $ne: null, $lt: new Date() }
    });
    return result.deletedCount;
};

const ImageMetadata = mongoose.model('ImageMetadata', imageMetadataSchema);

module.exports = ImageMetadata;
