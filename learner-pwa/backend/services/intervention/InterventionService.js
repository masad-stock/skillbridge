/**
 * Intervention Service
 * Manages dropout prevention interventions
 */

const mongoose = require('mongoose');
const User = require('../../models/User');
const riskCalculator = require('./RiskCalculator');
const logger = require('../../utils/logger');

// Intervention Schema (embedded in this service for simplicity)
const interventionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    trigger: {
        type: { type: String, enum: ['dropout_risk', 'performance_decline', 'inactivity', 'manual'] },
        riskScore: Number,
        factors: [String]
    },
    intervention: {
        type: { type: String, enum: ['motivational_message', 'content_recommendation', 'admin_alert', 'reminder'] },
        channel: { type: String, enum: ['in_app', 'sms', 'email'] },
        content: String,
        contentSw: String, // Swahili version
        language: { type: String, default: 'en' }
    },
    delivery: {
        scheduledAt: Date,
        deliveredAt: Date,
        status: { type: String, enum: ['pending', 'delivered', 'failed', 'cancelled'], default: 'pending' }
    },
    response: {
        userReturned: Boolean,
        returnedAt: Date,
        subsequentActivity: Number,
        effectivenessScore: Number
    }
}, { timestamps: true });

const Intervention = mongoose.model('Intervention', interventionSchema);

// Motivational messages in English and Swahili
const motivationalMessages = {
    high_risk: [
        {
            en: "We miss you! Your learning journey is waiting. Just 10 minutes today can make a difference. 📚",
            sw: "Tunakukumbuka! Safari yako ya kujifunza inakungoja. Dakika 10 tu leo zinaweza kuleta mabadiliko. 📚"
        },
        {
            en: "Don't give up! Every expert was once a beginner. Come back and continue building your skills. 💪",
            sw: "Usikate tamaa! Kila mtaalamu aliwahi kuwa mwanafunzi. Rudi na uendelee kujenga ujuzi wako. 💪"
        }
    ],
    medium_risk: [
        {
            en: "You're making progress! Keep the momentum going. Your next lesson is ready. 🌟",
            sw: "Unafanya maendeleo! Endelea na kasi. Somo lako lijalo liko tayari. 🌟"
        },
        {
            en: "Small steps lead to big achievements. Continue your learning today! 🚀",
            sw: "Hatua ndogo zinaongoza kwa mafanikio makubwa. Endelea kujifunza leo! 🚀"
        }
    ],
    performance: [
        {
            en: "Learning takes time. Review the previous module to strengthen your understanding. You've got this! 📖",
            sw: "Kujifunza kunachukua muda. Pitia somo lililopita kuimarisha uelewa wako. Unaweza! 📖"
        }
    ]
};

class InterventionService {
    /**
     * Check user risk and trigger intervention if needed
     * @param {string} userId - User ID
     */
    async checkAndIntervene(userId) {
        const risk = await riskCalculator.calculateRiskScore(userId);

        // Check if intervention is needed
        if (risk.score < 60) {
            return { interventionNeeded: false, risk };
        }

        // Check for recent interventions (avoid spam)
        const recentIntervention = await Intervention.findOne({
            userId,
            createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        });

        if (recentIntervention) {
            return {
                interventionNeeded: false,
                reason: 'Recent intervention exists',
                risk
            };
        }

        // Create intervention
        const intervention = await this.createIntervention(userId, risk);

        // If critical risk, also notify admin
        if (risk.score >= 80) {
            await this.notifyAdmin(userId, risk);
        }

        return { interventionNeeded: true, intervention, risk };
    }

    /**
     * Create an intervention for a user
     * @param {string} userId - User ID
     * @param {Object} risk - Risk assessment
     */
    async createIntervention(userId, risk) {
        const user = await User.findById(userId);
        const language = user?.accessibilityPreferences?.language || 'en';

        // Select appropriate message
        const messagePool = risk.score >= 80
            ? motivationalMessages.high_risk
            : motivationalMessages.medium_risk;

        const message = messagePool[Math.floor(Math.random() * messagePool.length)];

        const intervention = new Intervention({
            userId,
            trigger: {
                type: 'dropout_risk',
                riskScore: risk.score,
                factors: Object.entries(risk.factors)
                    .filter(([_, v]) => v.score > 10)
                    .map(([k, _]) => k)
            },
            intervention: {
                type: 'motivational_message',
                channel: 'in_app',
                content: message.en,
                contentSw: message.sw,
                language
            },
            delivery: {
                scheduledAt: new Date(),
                status: 'pending'
            }
        });

        await intervention.save();

        logger.info('Intervention created', {
            userId,
            interventionId: intervention._id,
            riskScore: risk.score
        });

        return intervention;
    }

    /**
     * Deliver pending interventions
     */
    async deliverPendingInterventions() {
        const pending = await Intervention.find({
            'delivery.status': 'pending',
            'delivery.scheduledAt': { $lte: new Date() }
        }).populate('userId', 'email phone');

        const results = [];

        for (const intervention of pending) {
            try {
                await this.deliverIntervention(intervention);
                results.push({ id: intervention._id, status: 'delivered' });
            } catch (error) {
                logger.error('Intervention delivery failed', {
                    interventionId: intervention._id,
                    error: error.message
                });
                results.push({ id: intervention._id, status: 'failed', error: error.message });
            }
        }

        return results;
    }

    /**
     * Deliver a single intervention
     * @param {Object} intervention - Intervention document
     */
    async deliverIntervention(intervention) {
        const { channel } = intervention.intervention;

        switch (channel) {
            case 'in_app':
                // In-app notifications are delivered when user logs in
                intervention.delivery.status = 'delivered';
                intervention.delivery.deliveredAt = new Date();
                break;

            case 'sms':
                // SMS delivery would integrate with Africa's Talking API
                // For now, mark as delivered
                intervention.delivery.status = 'delivered';
                intervention.delivery.deliveredAt = new Date();
                break;

            case 'email':
                // Email delivery would use email service
                intervention.delivery.status = 'delivered';
                intervention.delivery.deliveredAt = new Date();
                break;

            default:
                throw new Error(`Unknown channel: ${channel}`);
        }

        await intervention.save();
        return intervention;
    }

    /**
     * Get pending interventions for a user (for in-app display)
     * @param {string} userId - User ID
     */
    async getUserInterventions(userId) {
        return Intervention.find({
            userId,
            'intervention.channel': 'in_app',
            'delivery.status': 'delivered',
            'response.userReturned': { $ne: true }
        }).sort({ createdAt: -1 }).limit(5);
    }

    /**
     * Mark intervention as acknowledged
     * @param {string} interventionId - Intervention ID
     */
    async acknowledgeIntervention(interventionId) {
        const intervention = await Intervention.findById(interventionId);

        if (!intervention) {
            throw new Error('Intervention not found');
        }

        intervention.response = {
            userReturned: true,
            returnedAt: new Date()
        };

        await intervention.save();
        return intervention;
    }

    /**
     * Track intervention effectiveness
     * @param {string} interventionId - Intervention ID
     */
    async trackEffectiveness(interventionId) {
        const intervention = await Intervention.findById(interventionId);

        if (!intervention || !intervention.response?.returnedAt) {
            return null;
        }

        // Count activity after intervention
        const ResearchEvent = require('../../models/ResearchEvent');
        const activityCount = await ResearchEvent.countDocuments({
            userId: intervention.userId,
            timestamp: { $gte: intervention.response.returnedAt }
        });

        intervention.response.subsequentActivity = activityCount;
        intervention.response.effectivenessScore = Math.min(activityCount * 10, 100);

        await intervention.save();
        return intervention;
    }

    /**
     * Notify admin of critical risk user
     * @param {string} userId - User ID
     * @param {Object} risk - Risk assessment
     */
    async notifyAdmin(userId, risk) {
        const user = await User.findById(userId).select('name email');

        const adminIntervention = new Intervention({
            userId,
            trigger: {
                type: 'dropout_risk',
                riskScore: risk.score,
                factors: Object.keys(risk.factors)
            },
            intervention: {
                type: 'admin_alert',
                channel: 'in_app',
                content: `Critical dropout risk for user ${user?.name || userId}. Risk score: ${risk.score}%`
            },
            delivery: {
                scheduledAt: new Date(),
                status: 'delivered',
                deliveredAt: new Date()
            }
        });

        await adminIntervention.save();

        logger.warn('Admin notified of critical risk', { userId, riskScore: risk.score });

        return adminIntervention;
    }

    /**
     * Get intervention statistics
     */
    async getInterventionStats() {
        const stats = await Intervention.aggregate([
            {
                $group: {
                    _id: '$intervention.type',
                    total: { $sum: 1 },
                    delivered: {
                        $sum: { $cond: [{ $eq: ['$delivery.status', 'delivered'] }, 1, 0] }
                    },
                    responded: {
                        $sum: { $cond: ['$response.userReturned', 1, 0] }
                    },
                    avgEffectiveness: { $avg: '$response.effectivenessScore' }
                }
            }
        ]);

        const totalInterventions = await Intervention.countDocuments();
        const successfulReturns = await Intervention.countDocuments({ 'response.userReturned': true });

        return {
            byType: stats,
            total: totalInterventions,
            successRate: totalInterventions > 0
                ? Math.round((successfulReturns / totalInterventions) * 100)
                : 0
        };
    }

    /**
     * Run daily risk check for all users
     */
    async runDailyRiskCheck() {
        logger.info('Starting daily risk check');

        const usersAtRisk = await riskCalculator.getUsersAtRisk(60);
        const interventions = [];

        for (const risk of usersAtRisk) {
            try {
                const result = await this.checkAndIntervene(risk.userId);
                if (result.interventionNeeded) {
                    interventions.push(result.intervention);
                }
            } catch (error) {
                logger.error('Risk check failed for user', {
                    userId: risk.userId,
                    error: error.message
                });
            }
        }

        logger.info('Daily risk check completed', {
            usersChecked: usersAtRisk.length,
            interventionsCreated: interventions.length
        });

        return {
            usersAtRisk: usersAtRisk.length,
            interventionsCreated: interventions.length
        };
    }
}

module.exports = new InterventionService();
