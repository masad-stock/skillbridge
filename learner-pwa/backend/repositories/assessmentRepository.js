const Assessment = require('../models/Assessment');

/**
 * Assessment Repository
 * Handles all database operations for Assessment model
 */
class AssessmentRepository {
    async findAll(query = {}, options = {}) {
        const { page = 1, limit = 10, sort = { createdAt: -1 }, populate } = options;

        let queryBuilder = Assessment.find(query)
            .sort(sort)
            .skip((page - 1) * limit)
            .limit(limit);

        if (populate) {
            queryBuilder = queryBuilder.populate(populate);
        }

        const assessments = await queryBuilder;
        const total = await Assessment.countDocuments(query);

        return { assessments, total };
    }

    async findById(id, populate) {
        let query = Assessment.findById(id);
        if (populate) {
            query = query.populate(populate);
        }
        return await query;
    }

    async findOne(query, populate) {
        let queryBuilder = Assessment.findOne(query);
        if (populate) {
            queryBuilder = queryBuilder.populate(populate);
        }
        return await queryBuilder;
    }

    async create(assessmentData) {
        return await Assessment.create(assessmentData);
    }

    async update(id, updates) {
        return await Assessment.findByIdAndUpdate(id, updates, {
            new: true,
            runValidators: true
        });
    }

    async delete(id) {
        return await Assessment.findByIdAndDelete(id);
    }

    async deleteMany(query) {
        return await Assessment.deleteMany(query);
    }

    async count(query = {}) {
        return await Assessment.countDocuments(query);
    }

    async findByUser(userId, limit = 10) {
        return await Assessment.find({ user: userId })
            .sort({ createdAt: -1 })
            .limit(limit);
    }

    async findByStatus(status) {
        return await Assessment.find({ status });
    }

    async getCompletedCount() {
        return await Assessment.countDocuments({ status: 'completed' });
    }

    async getAverageScore(query = {}) {
        const result = await Assessment.aggregate([
            { $match: query },
            {
                $group: {
                    _id: null,
                    avgScore: { $avg: '$aiAnalysis.overallScore' }
                }
            }
        ]);
        return result[0]?.avgScore || 0;
    }

    async getStatsByStatus(startDate) {
        const query = startDate ? { createdAt: { $gte: startDate } } : {};

        return await Assessment.aggregate([
            { $match: query },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    avgScore: { $avg: '$aiAnalysis.overallScore' }
                }
            }
        ]);
    }
}

module.exports = new AssessmentRepository();
