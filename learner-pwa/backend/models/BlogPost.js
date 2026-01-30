const mongoose = require('mongoose');

const blogPostSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Blog post title is required'],
        trim: true
    },
    slug: {
        type: String,
        required: [true, 'Slug is required'],
        unique: true,
        lowercase: true,
        trim: true
    },
    content: {
        type: String,
        required: [true, 'Blog post content is required']
    },
    excerpt: {
        type: String,
        trim: true
    },
    featuredImage: {
        type: String, // URL to featured image
        default: ''
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Author is required']
    },
    category: {
        type: String,
        trim: true,
        default: 'General'
    },
    tags: [{
        type: String,
        trim: true
    }],
    published: {
        type: Boolean,
        default: false
    },
    publishedAt: {
        type: Date
    },
    views: {
        type: Number,
        default: 0,
        min: 0
    }
}, {
    timestamps: true
});

// Index for search functionality
blogPostSchema.index({ title: 'text', content: 'text', tags: 'text' });

// Index for slug lookups
blogPostSchema.index({ slug: 1 });

// Index for published posts
blogPostSchema.index({ published: 1, publishedAt: -1 });

// Virtual for reading time (assuming 200 words per minute)
blogPostSchema.virtual('readingTime').get(function () {
    const wordsPerMinute = 200;
    const wordCount = this.content.split(/\s+/).length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return minutes;
});

// Virtual for post URL
blogPostSchema.virtual('postUrl').get(function () {
    return `/blog/${this.slug}`;
});

// Method to generate slug from title
blogPostSchema.methods.generateSlug = function () {
    this.slug = this.title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/--+/g, '-')
        .trim();
};

// Method to publish post
blogPostSchema.methods.publish = function () {
    this.published = true;
    this.publishedAt = new Date();
};

// Method to increment view count
blogPostSchema.methods.incrementViews = async function () {
    this.views += 1;
    await this.save();
};

// Pre-save hook to generate slug if not provided
blogPostSchema.pre('save', function (next) {
    if (!this.slug && this.title) {
        this.generateSlug();
    }
    next();
});

// Pre-save hook to generate excerpt if not provided
blogPostSchema.pre('save', function (next) {
    if (!this.excerpt && this.content) {
        // Take first 150 characters of content
        this.excerpt = this.content.substring(0, 150).trim() + '...';
    }
    next();
});

// Ensure virtuals are included in JSON
blogPostSchema.set('toJSON', { virtuals: true });
blogPostSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('BlogPost', blogPostSchema);
