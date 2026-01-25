const Progress = require('../models/Progress');

/**
 * Progress Repository
 * Handles all database operations for Progress model
 */
class ProgressRepository {
    async findAll(query = {}, options = {}) {
        const { sort = { lastAccessedAt: -1 }, populate } = options;

        let queryBuilder = Progress.find(query).sort(sort);

        if (populate) {
            queryBuilder = queryBuilder.populate(populate);
        }

        return await queryBuilder;
    }

    async findById(id, populate) {
        let query = Progress.findById(id);
        if (populate) {
            query = query.populate(populate);
        }
        return await query;
    }

    async findOne(query, populate) {
        let queryBuilder = Progress.findOne(query);
        if (populate) {
            queryBuilder = queryBuilder.populate(populate);
        }
        return await queryBuilder;
    }

    async create(progressData) {
        return await Progress.create(progressData);
    }

    async update(id, updates) {
        return await Progress.findByIdAndUpdate(id, updates, {
            new: true,
            runValidators: true
        });
    }

    async updateOne(query, updates) {
        return await Progress.findOneAndUpdate(query, updates, {
            new: true,
            runValidators: true,
            upsert: true
        });
    }

    async delete(id) {
        return await Progress.findByIdAndDelete(id);
    }

    async deleteMany(query) {
        return await Progress.deleteMany(query);
    }

    async count(query = {}) {
        return await Progress.countDocuments(query);
    }

    async findByUser(userId, populate) {
        let query = Progress.find({ user: userId }).sort({ lastAccessedAt: -1 });
        if (populate) {
            query = query.populate(populate);
        }
        return await query;
    }

    async findByModule(moduleId) {
        return await Progress.find({ module: moduleId });
    }

    async findByUserAndModule(userId, moduleId) {
        return await Progress.findOne({ user: userId, module: moduleId });
    }

    async getPopularModules(limit = 5) {
        return await Progress.aggregate([
            { $group: { _id: '$module', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: limit },
            {
                $lookup: {
                    from: 'modules',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'moduleInfo'
                }
            }
        ]);
    }

    async getModuleEngagement(startDate, limit = 10) {
        const query = startDate ? { startedAt: { $gte: startDate } } : {};

        return await Progress.aggregate([
            { $match: query },
            {
                $group: {
                    _id: '$module',
                    enrollments: { $sum: 1 },
                    completions: {
                        $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
                    },
                    avgProgress: { $avg: '$progress' }
                }
            },
            {
                $lookup: {
                    from: 'modules',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'moduleInfo'
                }
            },
            { $sort: { enrollments: -1 } },
            { $limit: limit }
        ]);
    }

    async getCompletionRatesByCategory() {
        return await Progress.aggregate([
            {
                $lookup: {
                    from: 'modules',
                    localField: 'module',
                    foreignField: '_id',
                    as: 'moduleInfo'
                }
            },
            { $unwind: '$moduleInfo' },
            {
                $group: {
                    _id: '$moduleInfo.category',
                    total: { $sum: 1 },
                    completed: {
                        $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
                    }
                }
            },
            {
                $project: {
                    category: '$_id',
                    total: 1,
                    completed: 1,
                    completionRate: {
                        $multiply: [{ $divide: ['$completed', '$total'] }, 100]
                    }
                }
            }
        ]);
    }
}

module.exports = new ProgressRepository();
