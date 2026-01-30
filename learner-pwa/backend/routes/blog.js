const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');
const { auth, adminAuth } = require('../middleware/auth');

/**
 * @route   GET /api/v1/blog
 * @desc    Get all blog posts (published only for public, all for admin)
 * @access  Public
 */
router.get('/', async (req, res) => {
    try {
        const { category, tag, limit = 10, page = 1, includeUnpublished } = req.query;

        const query = {};

        // Only show published posts unless includeUnpublished is true (admin only)
        if (!includeUnpublished || includeUnpublished === 'false') {
            query.published = true;
        }

        if (category) {
            query.category = category;
        }

        if (tag) {
            query.tags = tag;
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const posts = await Blog.find(query)
            .populate('author', 'profile.firstName profile.lastName email')
            .sort({ publishedAt: -1, createdAt: -1 })
            .limit(parseInt(limit))
            .skip(skip);

        const total = await Blog.countDocuments(query);

        res.json({
            success: true,
            data: posts,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error('Error fetching blog posts:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch blog posts',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/v1/blog/:slug
 * @desc    Get single blog post by slug
 * @access  Public
 */
router.get('/:slug', async (req, res) => {
    try {
        const post = await Blog.findOne({ slug: req.params.slug })
            .populate('author', 'profile.firstName profile.lastName email')
            .populate('comments.user', 'profile.firstName profile.lastName');

        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Blog post not found'
            });
        }

        // Only show published posts to non-authenticated users
        if (!post.published && (!req.user || req.user.role !== 'admin')) {
            return res.status(404).json({
                success: false,
                message: 'Blog post not found'
            });
        }

        res.json({
            success: true,
            data: post
        });
    } catch (error) {
        console.error('Error fetching blog post:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch blog post',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/v1/blog/category/:category
 * @desc    Get blog posts by category
 * @access  Public
 */
router.get('/category/:category', async (req, res) => {
    try {
        const posts = await Blog.find({
            category: req.params.category,
            published: true
        })
            .populate('author', 'profile.firstName profile.lastName email')
            .sort({ publishedAt: -1 });

        res.json({
            success: true,
            data: posts
        });
    } catch (error) {
        console.error('Error fetching posts by category:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch posts',
            error: error.message
        });
    }
});

/**
 * @route   POST /api/v1/blog/:slug/view
 * @desc    Increment view count
 * @access  Public
 */
router.post('/:slug/view', async (req, res) => {
    try {
        const post = await Blog.findOneAndUpdate(
            { slug: req.params.slug },
            { $inc: { views: 1 } },
            { new: true }
        );

        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Blog post not found'
            });
        }

        res.json({
            success: true,
            data: { views: post.views }
        });
    } catch (error) {
        console.error('Error incrementing view count:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to increment view count',
            error: error.message
        });
    }
});

/**
 * @route   POST /api/v1/blog
 * @desc    Create new blog post
 * @access  Admin
 */
router.post('/', adminAuth, async (req, res) => {
    try {
        const { title, content, excerpt, featuredImage, category, tags, published } = req.body;

        const post = new Blog({
            title,
            content,
            excerpt,
            featuredImage,
            category,
            tags,
            published,
            author: req.user._id
        });

        await post.save();
        await post.populate('author', 'profile.firstName profile.lastName email');

        res.status(201).json({
            success: true,
            message: 'Blog post created successfully',
            data: post
        });
    } catch (error) {
        console.error('Error creating blog post:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create blog post',
            error: error.message
        });
    }
});

/**
 * @route   PUT /api/v1/blog/:id
 * @desc    Update blog post
 * @access  Admin
 */
router.put('/:id', adminAuth, async (req, res) => {
    try {
        const { title, content, excerpt, featuredImage, category, tags, published } = req.body;

        const post = await Blog.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Blog post not found'
            });
        }

        // Update fields
        if (title) post.title = title;
        if (content) post.content = content;
        if (excerpt !== undefined) post.excerpt = excerpt;
        if (featuredImage !== undefined) post.featuredImage = featuredImage;
        if (category) post.category = category;
        if (tags) post.tags = tags;
        if (published !== undefined) post.published = published;

        await post.save();
        await post.populate('author', 'profile.firstName profile.lastName email');

        res.json({
            success: true,
            message: 'Blog post updated successfully',
            data: post
        });
    } catch (error) {
        console.error('Error updating blog post:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update blog post',
            error: error.message
        });
    }
});

/**
 * @route   POST /api/v1/blog/:id/publish
 * @desc    Publish blog post
 * @access  Admin
 */
router.post('/:id/publish', adminAuth, async (req, res) => {
    try {
        const post = await Blog.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Blog post not found'
            });
        }

        post.published = true;
        if (!post.publishedAt) {
            post.publishedAt = new Date();
        }

        await post.save();

        res.json({
            success: true,
            message: 'Blog post published successfully',
            data: post
        });
    } catch (error) {
        console.error('Error publishing blog post:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to publish blog post',
            error: error.message
        });
    }
});

/**
 * @route   DELETE /api/v1/blog/:id
 * @desc    Delete blog post
 * @access  Admin
 */
router.delete('/:id', adminAuth, async (req, res) => {
    try {
        const post = await Blog.findByIdAndDelete(req.params.id);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Blog post not found'
            });
        }

        res.json({
            success: true,
            message: 'Blog post deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting blog post:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete blog post',
            error: error.message
        });
    }
});

module.exports = router;
