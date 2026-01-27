/**
 * Economic Survey Service
 * Handles economic impact tracking and analysis for thesis validation
 */

const EconomicSurvey = require('../models/EconomicSurvey');
const User = require('../models/User');
const logger = require('../utils/logger');

class EconomicSurveyService {
    /**
     * Create or update economic survey
     */
    async submitSurvey(userId, surveyData) {
        try {
            const { surveyType, ...data } = surveyData;

            // Check if survey already exists
            const existing = await EconomicSurvey.findOne({ userId, surveyType });

            if (existing) {
                // Update existing survey
                Object.assign(existing, data);
                existing.completedAt = new Date();
                await existing.save();

                logger.info(`Economic survey updated: ${surveyType} for user ${userId}`);
                return existing;
            }

            // Create new survey
            const survey = new EconomicSurvey({
                userId,
                surveyType,
                ...data,
                completedAt: new Date()
            });

            await survey.save();
            logger.info(`Economic survey created: ${surveyType} for user ${userId}`);

            return survey;
        } catch (error) {
            logger.error('Error submitting economic survey:', error);
            throw error;
        }
    }

    /**
     * Get user's surveys with comparison data
     */
    async getUserSurveys(userId) {
        try {
            const surveys = await EconomicSurvey.find({ userId })
                .sort({ completedAt: 1 })
                .lean();

            if (surveys.length === 0) {
                return { surveys: [], comparison: null };
            }

            // Calculate improvements for follow-up surveys
            const baseline = surveys.find(s => s.surveyType === 'baseline');
            const surveysWithComparison = await Promise.all(
                surveys.map(async (survey) => {
                    if (survey.surveyType === 'baseline') {
                        return { ...survey, improvement: null };
                    }

                    const surveyDoc = await EconomicSurvey.findById(survey._id);
                    const improvement = await surveyDoc.calculateImprovement();
                    return { ...survey, improvement };
                })
            );

            return {
                surveys: surveysWithComparison,
                comparison: this._generateComparison(surveysWithComparison)
            };
        } catch (error) {
            logger.error('Error getting user surveys:', error);
            throw error;
        }
    }

    /**
     * Get survey by type for user
     */
    async getSurveyByType(userId, surveyType) {
        try {
            const survey = await EconomicSurvey.findOne({ userId, surveyType }).lean();

            if (!survey) {
                return null;
            }

            // Add improvement calculation for follow-up surveys
            if (surveyType !== 'baseline') {
                const surveyDoc = await EconomicSurvey.findById(survey._id);
                const improvement = await surveyDoc.calculateImprovement();
                return { ...survey, improvement };
            }

            return survey;
        } catch (error) {
            logger.error('Error getting survey by type:', error);
            throw error;
        }
    }

    /**
     * Check which surveys user needs to complete
     */
    async getPendingSurveys(userId) {
        try {
            const user = await User.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }

            const completed = await EconomicSurvey.find({ userId }).select('surveyType completedAt');
            const completedTypes = completed.map(s => s.surveyType);

            const pending = [];
            const now = new Date();
            const registrationDate = user.createdAt;
            const daysSinceRegistration = Math.floor((now - registrationDate) / (1000 * 60 * 60 * 24));

            // Baseline survey (should be completed within first week)
            if (!completedTypes.includes('baseline')) {
                pending.push({
                    surveyType: 'baseline',
                    dueDate: new Date(registrationDate.getTime() + 7 * 24 * 60 * 60 * 1000),
                    priority: 'high',
                    overdue: daysSinceRegistration > 7
                });
            }

            // 3-month follow-up (available after 90 days)
            if (daysSinceRegistration >= 90 && !completedTypes.includes('followup_3m')) {
                pending.push({
                    surveyType: 'followup_3m',
                    dueDate: new Date(registrationDate.getTime() + 97 * 24 * 60 * 60 * 1000),
                    priority: 'medium',
                    overdue: daysSinceRegistration > 97
                });
            }

            // 6-month follow-up (available after 180 days)
            if (daysSinceRegistration >= 180 && !completedTypes.includes('followup_6m')) {
                pending.push({
                    surveyType: 'followup_6m',
                    dueDate: new Date(registrationDate.getTime() + 187 * 24 * 60 * 60 * 1000),
                    priority: 'high',
                    overdue: daysSinceRegistration > 187
                });
            }

            // 12-month follow-up (available after 365 days)
            if (daysSinceRegistration >= 365 && !completedTypes.includes('followup_12m')) {
                pending.push({
                    surveyType: 'followup_12m',
                    dueDate: new Date(registrationDate.getTime() + 372 * 24 * 60 * 60 * 1000),
                    priority: 'medium',
                    overdue: daysSinceRegistration > 372
                });
            }

            return pending;
        } catch (error) {
            logger.error('Error getting pending surveys:', error);
            throw error;
        }
    }

    /**
     * Get aggregate economic impact statistics
     */
    async getAggregateImpact(filters = {}) {
        try {
            const matchStage = { surveyType: { $ne: 'baseline' } };

            if (filters.surveyType) {
                matchStage.surveyType = filters.surveyType;
            }

            if (filters.startDate || filters.endDate) {
                matchStage.completedAt = {};
                if (filters.startDate) matchStage.completedAt.$gte = new Date(filters.startDate);
                if (filters.endDate) matchStage.completedAt.$lte = new Date(filters.endDate);
            }

            const results = await EconomicSurvey.aggregate([
                { $match: matchStage },
                {
                    $group: {
                        _id: null,
                        totalResponses: { $sum: 1 },

                        // Employment impact
                        employed: {
                            $sum: { $cond: [{ $eq: ['$employment.status', 'employed'] }, 1, 0] }
                        },
                        selfEmployed: {
                            $sum: { $cond: [{ $eq: ['$employment.status', 'self_employed'] }, 1, 0] }
                        },

                        // Business impact
                        hasBusiness: {
                            $sum: { $cond: ['$business.hasBusiness', 1, 0] }
                        },

                        // Digital adoption
                        usesDigitalPayments: {
                            $sum: { $cond: ['$digitalSkillsApplication.usesDigitalPayments', 1, 0] }
                        },
                        hasOnlinePresence: {
                            $sum: { $cond: ['$digitalSkillsApplication.hasOnlinePresence', 1, 0] }
                        },
                        sellsOnline: {
                            $sum: { $cond: ['$digitalSkillsApplication.sellsOnline', 1, 0] }
                        },

                        // Platform impact
                        helpedFindJob: {
                            $sum: { $cond: ['$platformImpact.helpedFindJob', 1, 0] }
                        },
                        helpedStartBusiness: {
                            $sum: { $cond: ['$platformImpact.helpedStartBusiness', 1, 0] }
                        },
                        helpedGrowBusiness: {
                            $sum: { $cond: ['$platformImpact.helpedGrowBusiness', 1, 0] }
                        },
                        helpedIncreaseIncome: {
                            $sum: { $cond: ['$platformImpact.helpedIncreaseIncome', 1, 0] }
                        },

                        // Satisfaction metrics
                        avgSatisfaction: { $avg: '$platformImpact.overallSatisfaction' },
                        wouldRecommend: {
                            $sum: { $cond: ['$platformImpact.wouldRecommend', 1, 0] }
                        }
                    }
                }
            ]);

            const data = results[0] || { totalResponses: 0 };

            // Calculate percentages
            const total = data.totalResponses || 1; // Avoid division by zero

            return {
                ...data,
                percentages: {
                    employed: (data.employed / total) * 100,
                    selfEmployed: (data.selfEmployed / total) * 100,
                    hasBusiness: (data.hasBusiness / total) * 100,
                    usesDigitalPayments: (data.usesDigitalPayments / total) * 100,
                    hasOnlinePresence: (data.hasOnlinePresence / total) * 100,
                    sellsOnline: (data.sellsOnline / total) * 100,
                    helpedFindJob: (data.helpedFindJob / total) * 100,
                    helpedStartBusiness: (data.helpedStartBusiness / total) * 100,
                    helpedGrowBusiness: (data.helpedGrowBusiness / total) * 100,
                    helpedIncreaseIncome: (data.helpedIncreaseIncome / total) * 100,
                    wouldRecommend: (data.wouldRecommend / total) * 100
                }
            };
        } catch (error) {
            logger.error('Error getting aggregate impact:', error);
            throw error;
        }
    }

    /**
     * Get income distribution analysis
     */
    async getIncomeDistribution(surveyType = null) {
        try {
            const matchStage = surveyType ? { surveyType } : {};

            const distribution = await EconomicSurvey.aggregate([
                { $match: matchStage },
                {
                    $group: {
                        _id: '$income.range',
                        count: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ]);

            return distribution.map(d => ({
                range: d._id,
                count: d.count
            }));
        } catch (error) {
            logger.error('Error getting income distribution:', error);
            throw error;
        }
    }

    /**
     * Compare baseline vs follow-up for cohort analysis
     */
    async getCohortComparison() {
        try {
            // Get all users with both baseline and at least one follow-up
            const usersWithBaseline = await EconomicSurvey.distinct('userId', {
                surveyType: 'baseline'
            });

            const comparisons = await Promise.all(
                usersWithBaseline.map(async (userId) => {
                    const surveys = await EconomicSurvey.find({ userId })
                        .sort({ completedAt: 1 })
                        .lean();

                    const baseline = surveys.find(s => s.surveyType === 'baseline');
                    const latest = surveys[surveys.length - 1];

                    if (baseline && latest && baseline._id.toString() !== latest._id.toString()) {
                        const surveyDoc = await EconomicSurvey.findById(latest._id);
                        const improvement = await surveyDoc.calculateImprovement();

                        return {
                            userId,
                            baseline: baseline.surveyType,
                            latest: latest.surveyType,
                            improvement
                        };
                    }

                    return null;
                })
            );

            return comparisons.filter(c => c !== null);
        } catch (error) {
            logger.error('Error getting cohort comparison:', error);
            throw error;
        }
    }

    /**
     * Get completion rates by survey type
     */
    async getCompletionRates() {
        try {
            const totalUsers = await User.countDocuments({ isActive: true });

            const rates = await Promise.all([
                'baseline',
                'followup_3m',
                'followup_6m',
                'followup_12m'
            ].map(async (surveyType) => {
                const completed = await EconomicSurvey.countDocuments({ surveyType });
                return {
                    surveyType,
                    completed,
                    total: totalUsers,
                    rate: totalUsers > 0 ? (completed / totalUsers) * 100 : 0
                };
            }));

            return rates;
        } catch (error) {
            logger.error('Error getting completion rates:', error);
            throw error;
        }
    }

    /**
     * Generate comparison summary
     * @private
     */
    _generateComparison(surveys) {
        if (surveys.length < 2) {
            return null;
        }

        const baseline = surveys.find(s => s.surveyType === 'baseline');
        const latest = surveys[surveys.length - 1];

        if (!baseline || !latest || baseline._id === latest._id) {
            return null;
        }

        return {
            timeframe: {
                from: baseline.completedAt,
                to: latest.completedAt,
                days: Math.floor((new Date(latest.completedAt) - new Date(baseline.completedAt)) / (1000 * 60 * 60 * 24))
            },
            employment: {
                before: baseline.employment?.status,
                after: latest.employment?.status,
                changed: baseline.employment?.status !== latest.employment?.status
            },
            business: {
                before: baseline.business?.hasBusiness,
                after: latest.business?.hasBusiness,
                started: !baseline.business?.hasBusiness && latest.business?.hasBusiness
            },
            digitalAdoption: {
                payments: {
                    before: baseline.digitalSkillsApplication?.usesDigitalPayments,
                    after: latest.digitalSkillsApplication?.usesDigitalPayments,
                    adopted: !baseline.digitalSkillsApplication?.usesDigitalPayments &&
                        latest.digitalSkillsApplication?.usesDigitalPayments
                },
                onlinePresence: {
                    before: baseline.digitalSkillsApplication?.hasOnlinePresence,
                    after: latest.digitalSkillsApplication?.hasOnlinePresence,
                    adopted: !baseline.digitalSkillsApplication?.hasOnlinePresence &&
                        latest.digitalSkillsApplication?.hasOnlinePresence
                },
                onlineSales: {
                    before: baseline.digitalSkillsApplication?.sellsOnline,
                    after: latest.digitalSkillsApplication?.sellsOnline,
                    adopted: !baseline.digitalSkillsApplication?.sellsOnline &&
                        latest.digitalSkillsApplication?.sellsOnline
                }
            },
            improvement: latest.improvement
        };
    }
}

module.exports = new EconomicSurveyService();
