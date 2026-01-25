/**
 * Group Assignment Service
 * Handles random assignment of users to experiment groups
 */

const Experiment = require('../../models/Experiment');
const User = require('../../models/User');
const logger = require('../../utils/logger');

class GroupAssignmentService {
    /**
     * Assign user to experiment group
     * @param {string} userId - User ID
     * @param {string} experimentId - Experiment ID
     */
    async assignUserToExperiment(userId, experimentId) {
        const experiment = await Experiment.findById(experimentId);

        if (!experiment) {
            throw new Error('Experiment not found');
        }

        if (experiment.status !== 'active') {
            throw new Error('Experiment is not active');
        }

        // Check if user is already assigned
        if (experiment.isUserAssigned(userId)) {
            const existingGroup = experiment.getUserGroup(userId);
            return {
                alreadyAssigned: true,
                group: existingGroup,
                features: experiment.getGroupFeatures(existingGroup)
            };
        }

        // Check targeting criteria
        const user = await User.findById(userId);
        if (!this.meetsTargetingCriteria(user, experiment.targeting)) {
            return {
                eligible: false,
                reason: 'User does not meet targeting criteria'
            };
        }

        // Perform random assignment
        const assignedGroup = this.selectGroup(experiment.groups);

        // Record assignment
        experiment.assignments.push({
            userId,
            group: assignedGroup,
            assignedAt: new Date()
        });

        await experiment.save();

        // Update user's experiment data
        await User.findByIdAndUpdate(userId, {
            'researchParticipant.experimentGroup': assignedGroup
        });

        logger.info('User assigned to experiment', {
            userId,
            experimentId,
            group: assignedGroup
        });

        return {
            assigned: true,
            group: assignedGroup,
            features: experiment.getGroupFeatures(assignedGroup)
        };
    }

    /**
     * Auto-assign user to all active experiments
     * @param {string} userId - User ID
     */
    async autoAssignUser(userId) {
        const activeExperiments = await Experiment.getActiveExperiments();
        const assignments = [];

        for (const experiment of activeExperiments) {
            try {
                const result = await this.assignUserToExperiment(userId, experiment._id);
                assignments.push({
                    experimentId: experiment._id,
                    experimentName: experiment.name,
                    ...result
                });
            } catch (error) {
                logger.error('Auto-assignment failed', {
                    userId,
                    experimentId: experiment._id,
                    error: error.message
                });
            }
        }

        return assignments;
    }

    /**
     * Select group based on configured ratios
     * @param {Array} groups - Experiment groups with ratios
     */
    selectGroup(groups) {
        const random = Math.random();
        let cumulative = 0;

        for (const group of groups) {
            cumulative += group.ratio;
            if (random < cumulative) {
                return group.name;
            }
        }

        // Fallback to last group (shouldn't happen if ratios sum to 1)
        return groups[groups.length - 1].name;
    }

    /**
     * Check if user meets targeting criteria
     * @param {Object} user - User object
     * @param {Object} targeting - Targeting configuration
     */
    meetsTargetingCriteria(user, targeting) {
        if (!targeting) return true;

        // Check new users only
        if (targeting.newUsersOnly) {
            const daysSinceCreation = (Date.now() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24);
            if (daysSinceCreation > 7) {
                return false;
            }
        }

        // Check age range
        if (user.dateOfBirth) {
            const age = this.calculateAge(user.dateOfBirth);
            if (targeting.minAge && age < targeting.minAge) return false;
            if (targeting.maxAge && age > targeting.maxAge) return false;
        }

        // Check location
        if (targeting.locations && targeting.locations.length > 0) {
            if (!user.location || !targeting.locations.includes(user.location)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Calculate age from date of birth
     * @param {Date} dateOfBirth - Date of birth
     */
    calculateAge(dateOfBirth) {
        const today = new Date();
        const birthDate = new Date(dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        return age;
    }

    /**
     * Get assignment distribution for experiment
     * @param {string} experimentId - Experiment ID
     */
    async getAssignmentDistribution(experimentId) {
        const experiment = await Experiment.findById(experimentId);

        if (!experiment) {
            throw new Error('Experiment not found');
        }

        const distribution = {};
        experiment.groups.forEach(group => {
            distribution[group.name] = {
                expected: group.ratio,
                count: 0,
                actual: 0
            };
        });

        experiment.assignments.forEach(assignment => {
            if (distribution[assignment.group]) {
                distribution[assignment.group].count++;
            }
        });

        const total = experiment.assignments.length;
        Object.keys(distribution).forEach(group => {
            distribution[group].actual = total > 0
                ? distribution[group].count / total
                : 0;
        });

        return {
            experimentId,
            totalAssignments: total,
            distribution
        };
    }

    /**
     * Validate assignment balance using chi-square test
     * @param {string} experimentId - Experiment ID
     */
    async validateAssignmentBalance(experimentId) {
        const distribution = await this.getAssignmentDistribution(experimentId);
        const total = distribution.totalAssignments;

        if (total < 30) {
            return {
                valid: true,
                message: 'Sample size too small for statistical validation',
                sampleSize: total
            };
        }

        // Calculate chi-square statistic
        let chiSquare = 0;
        Object.values(distribution.distribution).forEach(group => {
            const expected = group.expected * total;
            const observed = group.count;
            chiSquare += Math.pow(observed - expected, 2) / expected;
        });

        // Degrees of freedom = number of groups - 1
        const df = Object.keys(distribution.distribution).length - 1;

        // Critical value for p=0.05 (approximate)
        const criticalValues = { 1: 3.84, 2: 5.99, 3: 7.81, 4: 9.49 };
        const criticalValue = criticalValues[df] || 3.84;

        const isBalanced = chiSquare < criticalValue;

        return {
            valid: isBalanced,
            chiSquare,
            criticalValue,
            degreesOfFreedom: df,
            sampleSize: total,
            message: isBalanced
                ? 'Assignment distribution is statistically balanced'
                : 'Assignment distribution may be unbalanced'
        };
    }

    /**
     * Reassign user to different group (for testing/admin)
     * @param {string} userId - User ID
     * @param {string} experimentId - Experiment ID
     * @param {string} newGroup - New group name
     */
    async reassignUser(userId, experimentId, newGroup) {
        const experiment = await Experiment.findById(experimentId);

        if (!experiment) {
            throw new Error('Experiment not found');
        }

        // Validate group exists
        const groupExists = experiment.groups.some(g => g.name === newGroup);
        if (!groupExists) {
            throw new Error('Invalid group name');
        }

        // Find and update assignment
        const assignmentIndex = experiment.assignments.findIndex(
            a => a.userId.toString() === userId.toString()
        );

        if (assignmentIndex === -1) {
            throw new Error('User not assigned to this experiment');
        }

        const oldGroup = experiment.assignments[assignmentIndex].group;
        experiment.assignments[assignmentIndex].group = newGroup;
        experiment.assignments[assignmentIndex].assignedAt = new Date();

        await experiment.save();

        // Update user's experiment data
        await User.findByIdAndUpdate(userId, {
            'researchParticipant.experimentGroup': newGroup
        });

        logger.info('User reassigned', {
            userId,
            experimentId,
            oldGroup,
            newGroup
        });

        return {
            reassigned: true,
            oldGroup,
            newGroup,
            features: experiment.getGroupFeatures(newGroup)
        };
    }
}

module.exports = new GroupAssignmentService();
