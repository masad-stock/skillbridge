const userService = require('./userService');
const assessmentRepository = require('../repositories/assessmentRepository');
const progressRepository = require('../repositories/progressRepository');

/**
 * Analytics Service
 * Business logic for analytics and reporting
 */
class AnalyticsService {
    async getDashboardStats() {
        const [userStats, moduleStats, assessmentStats, popularModules] = await Promise.all([
            userService.getUserStats(),
            this.getModuleStats(),
            this.getAssessmentStats(),
            progressRepository.getPopularModules(5)
        ]);

        return {
            users: userStats,
            modules: moduleStats,
            assessments: assessmentStats,
            recentUsers: userStats.recent,
            popularModules
        };
    }

    async getAnalytics(period = 30) {
        const days = parseInt(period);
        const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

        const [userGrowth, assessmentStats, moduleEngagement, completionRates] = await Promise.all([
            userService.getUserGrowth(startDate),
            assessmentRepository.getStatsByStatus(startDate),
            progressRepository.getModuleEngagement(startDate, 10),
            progressRepository.getCompletionRatesByCategory()
        ]);

        return {
            userGrowth,
            assessmentStats,
            moduleEngagement,
            completionRates
        };
    }

    async getModuleStats() {
        const moduleService = require('./moduleService');
        return await moduleService.getModuleStats();
    }

    async getAssessmentStats() {
        const assessmentService = require('./assessmentService');
        return await assessmentService.getAssessmentStats();
    }

    async generateUserReport(startDate, endDate) {
        const userRepository = require('../repositories/userRepository');
        const query = {};

        if (startDate && endDate) {
            query.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const { users, total } = await userRepository.findAll(query, { limit: 1000 });

        return {
            total,
            users,
            generatedAt: new Date(),
            period: { startDate, endDate }
        };
    }

    async generateAssessmentReport(startDate, endDate) {
        const query = {};

        if (startDate && endDate) {
            query.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const { assessments, total } = await assessmentRepository.findAll(query, {
            limit: 1000,
            populate: 'user'
        });

        return {
            total,
            assessments,
            generatedAt: new Date(),
            period: { startDate, endDate }
        };
    }

    async generateModuleReport(startDate, endDate) {
        const query = {};

        if (startDate && endDate) {
            query.startedAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const progress = await progressRepository.findAll(query, {
            populate: ['module', 'user']
        });

        return {
            total: progress.length,
            progress,
            generatedAt: new Date(),
            period: { startDate, endDate }
        };
    }

    async getReport(type, startDate, endDate) {
        switch (type) {
            case 'users':
                return await this.generateUserReport(startDate, endDate);
            case 'assessments':
                return await this.generateAssessmentReport(startDate, endDate);
            case 'modules':
                return await this.generateModuleReport(startDate, endDate);
            default:
                throw new Error('Invalid report type');
        }
    }
}

module.exports = new AnalyticsService();
