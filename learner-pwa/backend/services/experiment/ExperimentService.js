/**
 * Experiment Service
 * Manages A/B testing experiments for research validation
 */

const Experiment = require('../../models/Experiment');
const User = require('../../models/User');
const logger = require('../../utils/logger');

class ExperimentService {
    /**
     * Create a new experiment
     * @param {Object} experimentData - Experiment configuration
     */
    async createExperiment(experimentData) {
        const { name, description, hypothesis, groups, targeting, metrics, createdBy } = experimentData;

        // Validate group ratios
        const totalRatio = groups.reduce((sum, g) => sum + g.ratio, 0);
        if (Math.abs(totalRatio - 1) > 0.001) {
            throw new Error('Group ratios must sum to 1');
        }

        const experiment = new Experiment({
            name,
            description,
            hypothesis,
            groups,
            targeting: targeting || {},
            metrics: metrics || { primaryMetric: 'completion_rate' },
            createdBy,
            status: 'draft'
        });

        await experiment.save();
        logger.info('Experiment created', { experimentId: experiment._id, name });

        return experiment;
    }

    /**
     * Start an experiment
     * @param {string} experimentId - Experiment ID
     */
    async startExperiment(experimentId) {
        const experiment = await Experiment.findById(experimentId);

        if (!experiment) {
            throw new Error('Experiment not found');
        }

        if (experiment.status !== 'draft' && experiment.status !== 'paused') {
            throw new Error(`Cannot start experiment in ${experiment.status} status`);
        }

        experiment.status = 'active';
        experiment.startDate = experiment.startDate || new Date();
        await experiment.save();

        logger.info('Experiment started', { experimentId, name: experiment.name });

        return experiment;
    }

    /**
     * Pause an experiment
     * @param {string} experimentId - Experiment ID
     */
    async pauseExperiment(experimentId) {
        const experiment = await Experiment.findById(experimentId);

        if (!experiment) {
            throw new Error('Experiment not found');
        }

        experiment.status = 'paused';
        await experiment.save();

        logger.info('Experiment paused', { experimentId });

        return experiment;
    }

    /**
     * Complete an experiment
     * @param {string} experimentId - Experiment ID
     */
    async completeExperiment(experimentId) {
        const experiment = await Experiment.findById(experimentId);

        if (!experiment) {
            throw new Error('Experiment not found');
        }

        experiment.status = 'completed';
        experiment.endDate = new Date();
        await experiment.save();

        logger.info('Experiment completed', { experimentId });

        return experiment;
    }

    /**
     * Get experiment by ID
     * @param {string} experimentId - Experiment ID
     */
    async getExperiment(experimentId) {
        return Experiment.findById(experimentId);
    }

    /**
     * Get all experiments
     * @param {Object} filters - Optional filters
     */
    async getExperiments(filters = {}) {
        const query = {};

        if (filters.status) {
            query.status = filters.status;
        }

        return Experiment.find(query).sort({ createdAt: -1 });
    }

    /**
     * Get active experiments
     */
    async getActiveExperiments() {
        return Experiment.getActiveExperiments();
    }

    /**
     * Get user's experiment assignments
     * @param {string} userId - User ID
     */
    async getUserExperiments(userId) {
        const experiments = await Experiment.getUserExperiments(userId);

        return experiments.map(exp => {
            const assignment = exp.assignments.find(
                a => a.userId.toString() === userId.toString()
            );
            const group = exp.groups.find(g => g.name === assignment?.group);

            return {
                experimentId: exp._id,
                experimentName: exp.name,
                group: assignment?.group,
                features: group?.features || {},
                assignedAt: assignment?.assignedAt
            };
        });
    }

    /**
     * Get user's features based on experiment assignments
     * @param {string} userId - User ID
     */
    async getUserFeatures(userId) {
        const experiments = await this.getUserExperiments(userId);

        // Default features (all enabled)
        const features = {
            aiRecommendations: true,
            adaptiveDifficulty: true,
            gamification: true,
            voiceGuidance: true,
            simplifiedUI: false,
            interventions: true
        };

        // Apply experiment-specific feature flags
        experiments.forEach(exp => {
            if (exp.features) {
                Object.keys(exp.features).forEach(key => {
                    // If any experiment disables a feature, it's disabled
                    if (exp.features[key] === false) {
                        features[key] = false;
                    }
                });
            }
        });

        return features;
    }

    /**
     * Update experiment results
     * @param {string} experimentId - Experiment ID
     * @param {Object} results - Calculated results
     */
    async updateResults(experimentId, results) {
        const experiment = await Experiment.findById(experimentId);

        if (!experiment) {
            throw new Error('Experiment not found');
        }

        experiment.results = {
            ...results,
            calculatedAt: new Date()
        };

        await experiment.save();

        logger.info('Experiment results updated', { experimentId });

        return experiment;
    }

    /**
     * Get experiment statistics
     * @param {string} experimentId - Experiment ID
     */
    async getExperimentStats(experimentId) {
        const experiment = await Experiment.findById(experimentId);

        if (!experiment) {
            throw new Error('Experiment not found');
        }

        const groupStats = {};
        experiment.groups.forEach(group => {
            const assignments = experiment.assignments.filter(a => a.group === group.name);
            groupStats[group.name] = {
                count: assignments.length,
                ratio: group.ratio,
                actualRatio: experiment.assignments.length > 0
                    ? assignments.length / experiment.assignments.length
                    : 0
            };
        });

        return {
            experimentId: experiment._id,
            name: experiment.name,
            status: experiment.status,
            totalAssignments: experiment.assignments.length,
            groupStats,
            results: experiment.results,
            startDate: experiment.startDate,
            endDate: experiment.endDate
        };
    }

    /**
     * Delete experiment (only drafts)
     * @param {string} experimentId - Experiment ID
     */
    async deleteExperiment(experimentId) {
        const experiment = await Experiment.findById(experimentId);

        if (!experiment) {
            throw new Error('Experiment not found');
        }

        if (experiment.status !== 'draft') {
            throw new Error('Can only delete draft experiments');
        }

        await Experiment.findByIdAndDelete(experimentId);

        logger.info('Experiment deleted', { experimentId });

        return { success: true };
    }
}

module.exports = new ExperimentService();
