const Module = require('../models/Module');
const User = require('../models/User');
const Assessment = require('../models/Assessment');
const Certificate = require('../models/Certificate');

class SearchService {
    /**
     * Search modules
     */
    async searchModules(query, filters = {}, options = {}) {
        try {
            const {
                category,
                difficulty,
                minDuration,
                maxDuration,
                tags
            } = filters;

            const {
                page = 1,
                limit = 10,
                sortBy = 'relevance'
            } = options;

            // Build search query
            const searchQuery = {};

            // Text search
            if (query) {
                searchQuery.$or = [
                    { title: { $regex: query, $options: 'i' } },
                    { description: { $regex: query, $options: 'i' } },
                    { category: { $regex: query, $options: 'i' } },
                    { tags: { $regex: query, $options: 'i' } }
                ];
            }

            // Filters
            if (category) {
                searchQuery.category = category;
            }

            if (difficulty) {
                searchQuery.difficulty = difficulty;
            }

            if (minDuration || maxDuration) {
                searchQuery.duration = {};
                if (minDuration) searchQuery.duration.$gte = minDuration;
                if (maxDuration) searchQuery.duration.$lte = maxDuration;
            }

            if (tags && tags.length > 0) {
                searchQuery.tags = { $in: Array.isArray(tags) ? tags : [tags] };
            }

            // Sorting
            let sort = {};
            switch (sortBy) {
                case 'title':
                    sort = { title: 1 };
                    break;
                case 'duration':
                    sort = { duration: 1 };
                    break;
                case 'difficulty':
                    sort = { difficulty: 1 };
                    break;
                case 'popular':
                    sort = { enrollmentCount: -1 };
                    break;
                case 'newest':
                    sort = { createdAt: -1 };
                    break;
                default:
                    sort = { title: 1 };
            }

            // Execute query
            const skip = (page - 1) * limit;
            const modules = await Module.find(searchQuery)
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .lean();

            const total = await Module.countDocuments(searchQuery);

            return {
                success: true,
                data: modules,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            throw new Error(`Module search failed: ${error.message}`);
        }
    }

    /**
     * Search users (admin only)
     */
    async searchUsers(query, filters = {}, options = {}) {
        try {
            const {
                role,
                isActive,
                isVerified
            } = filters;

            const {
                page = 1,
                limit = 10,
                sortBy = 'name'
            } = options;

            // Build search query
            const searchQuery = {};

            // Text search
            if (query) {
                searchQuery.$or = [
                    { email: { $regex: query, $options: 'i' } },
                    { 'profile.firstName': { $regex: query, $options: 'i' } },
                    { 'profile.lastName': { $regex: query, $options: 'i' } },
                    { 'profile.phoneNumber': { $regex: query, $options: 'i' } }
                ];
            }

            // Filters
            if (role) {
                searchQuery.role = role;
            }

            if (isActive !== undefined) {
                searchQuery.isActive = isActive;
            }

            if (isVerified !== undefined) {
                searchQuery.isVerified = isVerified;
            }

            // Sorting
            let sort = {};
            switch (sortBy) {
                case 'name':
                    sort = { 'profile.firstName': 1, 'profile.lastName': 1 };
                    break;
                case 'email':
                    sort = { email: 1 };
                    break;
                case 'newest':
                    sort = { createdAt: -1 };
                    break;
                case 'lastLogin':
                    sort = { lastLogin: -1 };
                    break;
                default:
                    sort = { 'profile.firstName': 1 };
            }

            // Execute query
            const skip = (page - 1) * limit;
            const users = await User.find(searchQuery)
                .select('-password -resetPasswordToken')
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .lean();

            const total = await User.countDocuments(searchQuery);

            return {
                success: true,
                data: users,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            throw new Error(`User search failed: ${error.message}`);
        }
    }

    /**
     * Search certificates
     */
    async searchCertificates(query, filters = {}, options = {}) {
        try {
            const {
                userId,
                moduleId,
                status,
                grade
            } = filters;

            const {
                page = 1,
                limit = 10,
                sortBy = 'newest'
            } = options;

            // Build search query
            const searchQuery = {};

            // Text search
            if (query) {
                searchQuery.certificateNumber = { $regex: query, $options: 'i' };
            }

            // Filters
            if (userId) {
                searchQuery.user = userId;
            }

            if (moduleId) {
                searchQuery.module = moduleId;
            }

            if (status) {
                searchQuery.status = status;
            }

            if (grade) {
                searchQuery.grade = grade;
            }

            // Sorting
            let sort = {};
            switch (sortBy) {
                case 'newest':
                    sort = { issueDate: -1 };
                    break;
                case 'oldest':
                    sort = { issueDate: 1 };
                    break;
                case 'score':
                    sort = { score: -1 };
                    break;
                default:
                    sort = { issueDate: -1 };
            }

            // Execute query
            const skip = (page - 1) * limit;
            const certificates = await Certificate.find(searchQuery)
                .populate('user', 'profile email')
                .populate('module', 'title category')
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .lean();

            const total = await Certificate.countDocuments(searchQuery);

            return {
                success: true,
                data: certificates,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            throw new Error(`Certificate search failed: ${error.message}`);
        }
    }

    /**
     * Global search (all entities)
     */
    async globalSearch(query, options = {}) {
        try {
            const { limit = 5 } = options;

            const [modules, users, certificates] = await Promise.all([
                this.searchModules(query, {}, { limit }),
                this.searchUsers(query, {}, { limit }),
                this.searchCertificates(query, {}, { limit })
            ]);

            return {
                success: true,
                data: {
                    modules: modules.data,
                    users: users.data,
                    certificates: certificates.data
                },
                counts: {
                    modules: modules.pagination.total,
                    users: users.pagination.total,
                    certificates: certificates.pagination.total
                }
            };
        } catch (error) {
            throw new Error(`Global search failed: ${error.message}`);
        }
    }

    /**
     * Get search suggestions (autocomplete)
     */
    async getSuggestions(query, type = 'modules', limit = 5) {
        try {
            let suggestions = [];

            switch (type) {
                case 'modules':
                    suggestions = await Module.find({
                        $or: [
                            { title: { $regex: query, $options: 'i' } },
                            { category: { $regex: query, $options: 'i' } }
                        ]
                    })
                        .select('title category')
                        .limit(limit)
                        .lean();
                    break;

                case 'users':
                    suggestions = await User.find({
                        $or: [
                            { email: { $regex: query, $options: 'i' } },
                            { 'profile.firstName': { $regex: query, $options: 'i' } },
                            { 'profile.lastName': { $regex: query, $options: 'i' } }
                        ]
                    })
                        .select('email profile.firstName profile.lastName')
                        .limit(limit)
                        .lean();
                    break;

                case 'certificates':
                    suggestions = await Certificate.find({
                        certificateNumber: { $regex: query, $options: 'i' }
                    })
                        .select('certificateNumber')
                        .limit(limit)
                        .lean();
                    break;

                default:
                    throw new Error('Invalid suggestion type');
            }

            return {
                success: true,
                data: suggestions
            };
        } catch (error) {
            throw new Error(`Suggestions failed: ${error.message}`);
        }
    }

    /**
     * Get popular searches
     */
    async getPopularSearches(limit = 10) {
        try {
            // Get most popular modules by enrollment
            const popularModules = await Module.find()
                .sort({ enrollmentCount: -1 })
                .limit(limit)
                .select('title category')
                .lean();

            return {
                success: true,
                data: popularModules.map(m => m.title)
            };
        } catch (error) {
            throw new Error(`Popular searches failed: ${error.message}`);
        }
    }

    /**
     * Get search filters metadata
     */
    async getSearchFilters() {
        try {
            const [categories, difficulties, tags] = await Promise.all([
                Module.distinct('category'),
                Module.distinct('difficulty'),
                Module.distinct('tags')
            ]);

            return {
                success: true,
                data: {
                    categories: categories.filter(Boolean),
                    difficulties: difficulties.filter(Boolean),
                    tags: tags.filter(Boolean).flat()
                }
            };
        } catch (error) {
            throw new Error(`Get filters failed: ${error.message}`);
        }
    }
}

module.exports = new SearchService();
