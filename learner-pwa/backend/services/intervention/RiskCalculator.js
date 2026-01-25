/**
 * Risk Calculator Service
 * Calculates dropout risk scores for learners
 */

const User = require('../../models/User');
const Progress = require('../../models/Progress');
const ResearchEvent = require('../../models/ResearchEvent');
const logger = require('../../utils/logger');

class RiskCalculator {
    /**
     * Calculate dropout risk score for a user
     * @param {string} userId - User ID
     * @returns {Object} Risk assessment
     */
    async calculateRiskScore(userId) {
        const user = await User.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        const factors = await this.collectRiskFactors(userId);
        const score = this.computeScore(factors);

        return {
            userId,
            score,
            riskLevel: this.getRiskLevel(score),
            factors,
            calculatedAt: new Date()
        };
    }

    /**
     * Collect all risk factors for a user
     * @param {string} userId - User ID
     */
    async collectRiskFactors(userId) {
        const [
            inactivityFactor,
            performanceFactor,
            completionFactor,
            engagementFactor,
            progressFactor
        ] = await Promise.all([
            this.calculateInactivityFactor(userId),
            this.calculatePerformanceFactor(userId),
            this.calculateCompletionFactor(userId),
            this.calculateEngagementFactor(userId),
            this.calculateProgressFactor(userId)
        ]);

        return {
            inactivity: inactivityFactor,
            performance: performanceFactor,
            completion: completionFactor,
            engagement: engagementFactor,
            progress: progressFactor
        };
    }

    /**
     * Calculate inactivity factor (0-30 points)
     * Based on days since last activity
     */
    async calculateInactivityFactor(userId) {
        const lastEvent = await ResearchEvent.findOne({ userId })
            .sort({ timestamp: -1 })
            .select('timestamp');

        if (!lastEvent) {
            return { score: 30, daysSinceActive: null, description: 'No activity recorded' };
        }

        const daysSinceActive = Math.floor(
            (Date.now() - new Date(lastEvent.timestamp)) / (1000 * 60 * 60 * 24)
        );

        let score = 0;
        let description = '';

        if (daysSinceActive > 14) {
            score = 30;
            description = 'Inactive for more than 2 weeks';
        } else if (daysSinceActive > 7) {
            score = 20;
            description = 'Inactive for more than 1 week';
        } else if (daysSinceActive > 3) {
            score = 10;
            description = 'Inactive for more than 3 days';
        } else {
            score = 0;
            description = 'Recently active';
        }

        return { score, daysSinceActive, description };
    }

    /**
     * Calculate performance factor (0-25 points)
     * Based on average assessment scores
     */
    async calculatePerformanceFactor(userId) {
        const assessmentEvents = await ResearchEvent.find({
            userId,
            eventType: 'assessment_complete'
        }).select('eventData.score');

        if (assessmentEvents.length === 0) {
            return { score: 15, avgScore: null, description: 'No assessments completed' };
        }

        const scores = assessmentEvents
            .map(e => e.eventData?.score)
            .filter(s => s !== undefined && s !== null);

        if (scores.length === 0) {
            return { score: 15, avgScore: null, description: 'No valid scores' };
        }

        const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;

        let score = 0;
        let description = '';

        if (avgScore < 40) {
            score = 25;
            description = 'Very low assessment performance';
        } else if (avgScore < 60) {
            score = 15;
            description = 'Below average performance';
        } else if (avgScore < 75) {
            score = 5;
            description = 'Average performance';
        } else {
            score = 0;
            description = 'Good performance';
        }

        return { score, avgScore: Math.round(avgScore), description };
    }

    /**
     * Calculate completion factor (0-25 points)
     * Based on module completion rate
     */
    async calculateCompletionFactor(userId) {
        const progress = await Progress.find({ userId });

        if (progress.length === 0) {
            return { score: 20, completionRate: 0, description: 'No modules started' };
        }

        const completed = progress.filter(p => p.completed).length;
        const completionRate = completed / progress.length;

        let score = 0;
        let description = '';

        if (completionRate < 0.2) {
            score = 25;
            description = 'Very low completion rate';
        } else if (completionRate < 0.5) {
            score = 15;
            description = 'Below average completion';
        } else if (completionRate < 0.75) {
            score = 5;
            description = 'Moderate completion rate';
        } else {
            score = 0;
            description = 'High completion rate';
        }

        return {
            score,
            completionRate: Math.round(completionRate * 100),
            modulesCompleted: completed,
            totalModules: progress.length,
            description
        };
    }

    /**
     * Calculate engagement factor (0-20 points)
     * Based on average session duration
     */
    async calculateEngagementFactor(userId) {
        // Get session durations from page view events
        const sessions = await ResearchEvent.aggregate([
            { $match: { userId: require('mongoose').Types.ObjectId(userId) } },
            { $sort: { timestamp: 1 } },
            {
                $group: {
                    _id: '$sessionId',
                    startTime: { $first: '$timestamp' },
                    endTime: { $last: '$timestamp' },
                    eventCount: { $sum: 1 }
                }
            },
            {
                $project: {
                    duration: { $subtract: ['$endTime', '$startTime'] },
                    eventCount: 1
                }
            }
        ]);

        if (sessions.length === 0) {
            return { score: 15, avgDuration: null, description: 'No sessions recorded' };
        }

        // Calculate average session duration in minutes
        const durations = sessions
            .map(s => s.duration / (1000 * 60))
            .filter(d => d > 0 && d < 180); // Filter out invalid durations

        if (durations.length === 0) {
            return { score: 15, avgDuration: null, description: 'No valid sessions' };
        }

        const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;

        let score = 0;
        let description = '';

        if (avgDuration < 5) {
            score = 20;
            description = 'Very short sessions';
        } else if (avgDuration < 15) {
            score = 10;
            description = 'Short sessions';
        } else if (avgDuration < 30) {
            score = 5;
            description = 'Moderate session length';
        } else {
            score = 0;
            description = 'Good session engagement';
        }

        return {
            score,
            avgDuration: Math.round(avgDuration),
            sessionCount: sessions.length,
            description
        };
    }

    /**
     * Calculate progress factor (0-10 points)
     * Based on learning progress trend
     */
    async calculateProgressFactor(userId) {
        // Get progress events from last 2 weeks
        const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

        const recentProgress = await ResearchEvent.find({
            userId,
            eventType: { $in: ['module_progress', 'module_complete'] },
            timestamp: { $gte: twoWeeksAgo }
        }).sort({ timestamp: 1 });

        if (recentProgress.length === 0) {
            return { score: 10, trend: 'stagnant', description: 'No recent progress' };
        }

        // Calculate progress trend
        const progressValues = recentProgress
            .map(e => e.eventData?.score || 0)
            .filter(v => v > 0);

        if (progressValues.length < 2) {
            return { score: 5, trend: 'insufficient_data', description: 'Not enough data for trend' };
        }

        // Simple trend calculation
        const firstHalf = progressValues.slice(0, Math.floor(progressValues.length / 2));
        const secondHalf = progressValues.slice(Math.floor(progressValues.length / 2));

        const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

        let score = 0;
        let trend = '';
        let description = '';

        if (secondAvg > firstAvg * 1.1) {
            score = 0;
            trend = 'improving';
            description = 'Progress is improving';
        } else if (secondAvg < firstAvg * 0.9) {
            score = 10;
            trend = 'declining';
            description = 'Progress is declining';
        } else {
            score = 5;
            trend = 'stable';
            description = 'Progress is stable';
        }

        return { score, trend, recentEvents: recentProgress.length, description };
    }

    /**
     * Compute total risk score from factors
     * @param {Object} factors - Risk factors
     */
    computeScore(factors) {
        const totalScore =
            factors.inactivity.score +
            factors.performance.score +
            factors.completion.score +
            factors.engagement.score +
            factors.progress.score;

        // Normalize to 0-100
        return Math.min(totalScore, 100);
    }

    /**
     * Get risk level from score
     * @param {number} score - Risk score (0-100)
     */
    getRiskLevel(score) {
        if (score >= 80) return 'critical';
        if (score >= 60) return 'high';
        if (score >= 40) return 'medium';
        if (score >= 20) return 'low';
        return 'minimal';
    }

    /**
     * Calculate risk scores for all active users
     */
    async calculateAllUserRisks() {
        const users = await User.find({ isActive: true }).select('_id');
        const results = [];

        for (const user of users) {
            try {
                const risk = await this.calculateRiskScore(user._id);
                results.push(risk);
            } catch (error) {
                logger.error('Risk calculation failed', { userId: user._id, error: error.message });
            }
        }

        return results;
    }

    /**
     * Get users at risk (score >= threshold)
     * @param {number} threshold - Risk score threshold
     */
    async getUsersAtRisk(threshold = 60) {
        const allRisks = await this.calculateAllUserRisks();
        return allRisks.filter(r => r.score >= threshold);
    }
}

module.exports = new RiskCalculator();
