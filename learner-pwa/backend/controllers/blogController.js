const BlogPost = require('../models/BlogPost');
const Joi = require('joi');

/**
 * Get all published blog posts
 */
exports.getAllPosts = async (req, res) => {
    try {
        const schema = Joi.object({
            page: Joi.number().integer().min(1).default(1),
            limit: Joi.number().integer().min(1).max(50).default(10),
            search: Joi.string().allow('').optional(),
            category: Joi.string().allow('').optional(),
            tag: Joi.string().allow('').optional()
        });

        const { value, error } = schema.validate(req.query);
        if (error) {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                details: error.details
            });
        }

        const { page, limit, search, category, tag } = value;
        const skip = (page - 1) * limit;

        // Build query - only published posts
        const query = { published: true };

        // Add search filter
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { content: { $regex: search, $options: 'i' } },
                { tags: { $regex: search, $options: 'i' } }
            ];
        }

        // Add category filter
        if (category) {
            query.category = category;
        }

        // Add tag filter
        if (tag) {
            query.tags = tag;
        }

        // Execute query
        const posts = await BlogPost.find(query)
            .populate('author', 'profile.firstName profile.lastName email')
            .select('-content -__v')
            .skip(skip)
            .limit(limit)
            .sort({ publishedAt: -1 });

        const total = await BlogPost.countDocuments(query);

        res.json({
            success: true,
            data: posts,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('[Blog] Get all posts error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Get blog post by slug
 */
exports.getPostBySlug = async (req, res) => {
    try {
        const schema = Joi.object({
            slug: Joi.string().required()
        });

        const { value, error } = schema.validate(req.params);
        if (error) {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                details: error.details
            });
        }

        const { slug } = value;

        const post = await BlogPost.findOne({ slug, published: true })
            .populate('author', 'profile.firstName profile.lastName email profile.profilePhoto')
            .select('-__v');

        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Blog post not found'
            });
        }

        // Get related posts (same category, excluding current post)
        const relatedPosts = await BlogPost.find({
            category: post.category,
            published: true,
            _id: { $ne: post._id }
        })
            .select('title slug excerpt featuredImage publishedAt')
            .limit(3)
            .sort({ publishedAt: -1 });

        res.json({
            success: true,
            data: {
                post,
                relatedPosts
            }
        });
    } catch (error) {
        console.error('[Blog] Get post by slug error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Get posts by category
 */
exports.getPostsByCategory = async (req, res) => {
    try {
        const paramSchema = Joi.object({
            category: Joi.string().required()
        });

        const querySchema = Joi.object({
            page: Joi.number().integer().min(1).default(1),
            limit: Joi.number().integer().min(1).max(50).default(10)
        });

        const paramResult = paramSchema.validate(req.params);
        if (paramResult.error) {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                details: paramResult.error.details
            });
        }

        const queryResult = querySchema.validate(req.query);
        if (queryResult.error) {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                details: queryResult.error.details
            });
        }

        const { category } = paramResult.value;
        const { page, limit } = queryResult.value;
        const skip = (page - 1) * limit;

        const posts = await BlogPost.find({ category, published: true })
            .populate('author', 'profile.firstName profile.lastName email')
            .select('-content -__v')
            .skip(skip)
            .limit(limit)
            .sort({ publishedAt: -1 });

        const total = await BlogPost.countDocuments({ category, published: true });

        res.json({
            success: true,
            data: posts,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('[Blog] Get posts by category error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Increment view count
 */
exports.incrementViewCount = async (req, res) => {
    try {
        const schema = Joi.object({
            slug: Joi.string().required()
        });

        const { value, error } = schema.validate(req.params);
        if (error) {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                details: error.details
            });
        }

        const { slug } = value;

        const post = await BlogPost.findOne({ slug });

        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Blog post not found'
            });
        }

        await post.incrementViews();

        res.json({
            success: true,
            message: 'View count incremented',
            views: post.views
        });
    } catch (error) {
        console.error('[Blog] Increment view count error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Create blog post (Admin only)
 */
exports.createPost = async (req, res) => {
    try {
        const schema = Joi.object({
            title: Joi.string().required().trim(),
            slug: Joi.string().optional().trim(),
            content: Joi.string().required(),
            excerpt: Joi.string().optional().trim(),
            featuredImage: Joi.string().uri().optional().allow(''),
            category: Joi.string().optional().trim(),
            tags: Joi.array().items(Joi.string().trim()).optional(),
            published: Joi.boolean().optional()
        });

        const { value, error } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                details: error.details
            });
        }

        // Add author from authenticated user
        value.author = req.user.id;

        // Check if slug already exists
        if (value.slug) {
            const existingPost = await BlogPost.findOne({ slug: value.slug });
            if (existingPost) {
                return res.status(400).json({
                    success: false,
                    message: 'A post with this slug already exists'
                });
            }
        }

        const post = new BlogPost(value);

        // If published, set publishedAt
        if (post.published && !post.publishedAt) {
            post.publishedAt = new Date();
        }

        await post.save();

        res.status(201).json({
            success: true,
            message: 'Blog post created successfully',
            data: post
        });
    } catch (error) {
        console.error('[Blog] Create post error:', error);

        // Handle duplicate key error
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'A post with this slug already exists'
            });
        }

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Update blog post (Admin only)
 */
exports.updatePost = async (req, res) => {
    try {
        const paramSchema = Joi.object({
            id: Joi.string().required()
        });

        const bodySchema = Joi.object({
            title: Joi.string().optional().trim(),
            slug: Joi.string().optional().trim(),
            content: Joi.string().optional(),
            excerpt: Joi.string().optional().trim(),
            featuredImage: Joi.string().uri().optional().allow(''),
            category: Joi.string().optional().trim(),
            tags: Joi.array().items(Joi.string().trim()).optional(),
            published: Joi.boolean().optional()
        });

        const paramResult = paramSchema.validate(req.params);
        if (paramResult.error) {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                details: paramResult.error.details
            });
        }

        const bodyResult = bodySchema.validate(req.body);
        if (bodyResult.error) {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                details: bodyResult.error.details
            });
        }

        const { id } = paramResult.value;
        const updates = bodyResult.value;

        // Check if slug is being changed and if it's already taken
        if (updates.slug) {
            const existingPost = await BlogPost.findOne({
                slug: updates.slug,
                _id: { $ne: id }
            });
            if (existingPost) {
                return res.status(400).json({
                    success: false,
                    message: 'Slug is already taken by another post'
                });
            }
        }

        const post = await BlogPost.findByIdAndUpdate(
            id,
            updates,
            { new: true, runValidators: true }
        );

        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Blog post not found'
            });
        }

        res.json({
            success: true,
            message: 'Blog post updated successfully',
            data: post
        });
    } catch (error) {
        console.error('[Blog] Update post error:', error);

        // Handle duplicate key error
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Slug is already taken by another post'
            });
        }

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Publish blog post (Admin only)
 */
exports.publishPost = async (req, res) => {
    try {
        const schema = Joi.object({
            id: Joi.string().required()
        });

        const { value, error } = schema.validate(req.params);
        if (error) {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                details: error.details
            });
        }

        const { id } = value;

        const post = await BlogPost.findById(id);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Blog post not found'
            });
        }

        if (post.published) {
            return res.status(400).json({
                success: false,
                message: 'Post is already published'
            });
        }

        post.publish();
        await post.save();

        res.json({
            success: true,
            message: 'Blog post published successfully',
            data: post
        });
    } catch (error) {
        console.error('[Blog] Publish post error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Delete blog post (Admin only)
 */
exports.deletePost = async (req, res) => {
    try {
        const schema = Joi.object({
            id: Joi.string().required()
        });

        const { value, error } = schema.validate(req.params);
        if (error) {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                details: error.details
            });
        }

        const { id } = value;

        const post = await BlogPost.findByIdAndDelete(id);

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
        console.error('[Blog] Delete post error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
