/**
 * Learning Pathway Generator Service
 * Creates personalized learning pathways based on competency evaluation
 */

const LearningPathway = require('../models/LearningPathway');
const CompetencyScore = require('../models/CompetencyScore');
const Module = require('../models/Module');
const Progress = require('../models/Progress');
const logger = require('../utils/logger');

class PathwayGeneratorService {
    /**
     * Generate personalized learning pathway for user
     */
    async generatePathway(userId, options = {}) {
        try {
            logger.info(`Generating learning pathway for user ${userId}`);

            // Get latest competency evaluation
            const competencyScore = await CompetencyScore.getLatestForUser(userId);
            if (!competencyScore) {
                throw new Error('No competency evaluation found. Please complete an assessment first.');
            }

            // Deactivate existing pathways
            await LearningPathway.updateMany(
                { userId, isActive: true },
                { isActive: false }
            );

            // Determine focus areas from improvement areas
            const focusAreas = competencyScore.improvementAreas.map(area => area.domain);

            // Get user preferences
            const targetLevel = options.targetLevel || this._determineTargetLevel(competencyScore);
            const learningStyle = options.learningStyle || 'mixed';
            const availableTime = options.availableTimePerWeek || 10;

            // Generate module sequence
            const modules = await this._generateModuleSequence(
                competencyScore,
                focusAreas,
                targetLevel
            );

            // Create pathway
            const pathway = new LearningPathway({
                userId,
                targetCompetencyLevel: targetLevel,
                focusAreas,
                learningStyle,
                availableTimePerWeek: availableTime,
                modules,
                competencyScoreId: competencyScore._id
            });

            // Calculate metrics
            pathway.calculateTotalHours();
            pathway.updateProjectedCompletion();

            // Unlock first module
            if (pathway.modules.length > 0) {
                pathway.modules[0].status = 'available';
                pathway.modules[0].prerequisitesMet = true;
            }

            await pathway.save();

            logger.info(`Learning pathway generated for user ${userId}: ${modules.length} modules`);

            return pathway;
        } catch (error) {
            logger.error('Error generating learning pathway:', error);
            throw error;
        }
    }

    /**
     * Generate module sequence based on competency and goals
     * @private
     */
    async _generateModuleSequence(competencyScore, focusAreas, targetLevel) {
        const moduleSequence = [];
        let sequenceOrder = 1;

        // For each focus area, get relevant modules
        for (const area of focusAreas) {
            const areaScore = competencyScore.competencies[area]?.score || 0;
            const currentLevel = competencyScore.competencies[area]?.level || 'beginner';

            // Determine appropriate difficulty progression
            const difficulties = this._getDifficultyProgression(currentLevel, targetLevel);

            for (const difficulty of difficulties) {
                // Get modules for this area and difficulty
                const modules = await Module.find({
                    category: area,
                    difficulty,
                    isActive: true
                }).limit(3).sort({ order: 1 });

                for (const module of modules) {
                    moduleSequence.push({
                        moduleId: module._id,
                        sequenceOrder: sequenceOrder++,
                        prerequisitesMet: sequenceOrder === 1, // First module is always available
                        recommendationReason: `Strengthen ${area} skills (current: ${areaScore}/100)`,
                        estimatedDuration: module.estimatedDuration || 5,
                        difficulty,
                        status: 'locked',
                        difficultyAdjustment: this._calculateDifficultyAdjustment(areaScore, difficulty)
                    });
                }
            }
        }

        // Add foundational modules if user is beginner
        if (competencyScore.overallLevel === 'beginner') {
            const foundationalModules = await this._getFoundationalModules();
            foundationalModules.forEach((module, index) => {
                moduleSequence.unshift({
                    moduleId: module._id,
                    sequenceOrder: index + 1,
                    prerequisitesMet: index === 0,
                    recommendationReason: 'Essential foundation for digital skills',
                    estimatedDuration: module.estimatedDuration || 3,
                    difficulty: 'beginner',
                    status: index === 0 ? 'available' : 'locked'
                });
            });

            // Reorder sequence numbers
            moduleSequence.forEach((m, index) => {
                m.sequenceOrder = index + 1;
            });
        }

        // Optimize sequence for learning efficiency
        return this._optimizeSequence(moduleSequence, competencyScore);
    }

    /**
     * Determine target competency level
     * @private
     */
    _determineTargetLevel(competencyScore) {
        const currentLevel = competencyScore.overallLevel;

        const levelProgression = {
            'beginner': 'intermediate',
            'intermediate': 'advanced',
            'advanced': 'expert',
            'expert': 'expert'
        };

        return levelProgression[currentLevel] || 'intermediate';
    }

    /**
     * Get difficulty progression path
     * @private
     */
    _getDifficultyProgression(currentLevel, targetLevel) {
        const progressionMap = {
            'beginner': {
                'intermediate': ['beginner', 'intermediate'],
                'advanced': ['beginner', 'intermediate', 'advanced'],
                'expert': ['beginner', 'intermediate', 'advanced']
            },
            'intermediate': {
                'intermediate': ['intermediate'],
                'advanced': ['intermediate', 'advanced'],
                'expert': ['intermediate', 'advanced']
            },
            'advanced': {
                'advanced': ['advanced'],
                'expert': ['advanced']
            },
            'expert': {
                'expert': ['advanced']
            }
        };

        return progressionMap[currentLevel]?.[targetLevel] || ['intermediate'];
    }

    /**
     * Calculate difficulty adjustment based on score
     * @private
     */
    _calculateDifficultyAdjustment(score, difficulty) {
        if (difficulty === 'beginner' && score > 50) return 1; // Make it slightly harder
        if (difficulty === 'intermediate' && score < 30) return -1; // Make it slightly easier
        if (difficulty === 'advanced' && score < 60) return -1;
        return 0;
    }

    /**
     * Get foundational modules for beginners
     * @private
     */
    async _getFoundationalModules() {
        return await Module.find({
            category: 'basicDigitalLiteracy',
            difficulty: 'beginner',
            isActive: true,
            isFundamental: true
        }).limit(3).sort({ order: 1 });
    }

    /**
     * Optimize module sequence for learning efficiency
     * @private
     */
    _optimizeSequence(modules, competencyScore) {
        // Sort by:
        // 1. Prerequisite dependencies
        // 2. Difficulty (easier first)
        // 3. Relevance to improvement areas

        const improvementPriorities = {};
        competencyScore.improvementAreas.forEach((area, index) => {
            improvementPriorities[area.domain] = 3 - index; // Higher priority = higher number
        });

        modules.sort((a, b) => {
            // Get module details
            const aModule = a.moduleId;
            const bModule = b.moduleId;

            // Priority 1: Prerequisites (handled by sequenceOrder)
            if (a.sequenceOrder !== b.sequenceOrder) {
                return a.sequenceOrder - b.sequenceOrder;
            }

            // Priority 2: Difficulty
            const difficultyOrder = { 'beginner': 1, 'intermediate': 2, 'advanced': 3 };
            const diffDiff = difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
            if (diffDiff !== 0) return diffDiff;

            // Priority 3: Improvement area priority
            const aPriority = improvementPriorities[aModule?.category] || 0;
            const bPriority = improvementPriorities[bModule?.category] || 0;
            return bPriority - aPriority;
        });

        // Update sequence orders after sorting
        modules.forEach((module, index) => {
            module.sequenceOrder = index + 1;
        });

        return modules;
    }

    /**
     * Adapt existing pathway based on performance
     */
    async adaptPathway(userId, reason, changes) {
        try {
            const pathway = await LearningPathway.getActivePathway(userId);

            if (!pathway) {
                throw new Error('No active pathway found');
            }

            await pathway.adaptPathway(reason, changes);

            logger.info(`Pathway adapted for user ${userId}: ${reason}`);

            return pathway;
        } catch (error) {
            logger.error('Error adapting pathway:', error);
            throw error;
        }
    }

    /**
     * Check if pathway needs adaptation based on performance
     */
    async checkForAdaptation(userId) {
        try {
            const pathway = await LearningPathway.getActivePathway(userId);
            if (!pathway) return null;

            const progress = await Progress.find({ userId }).sort({ updatedAt: -1 }).limit(5);

            // Check for struggling pattern (low scores)
            const recentScores = progress.map(p => p.score || 0);
            const avgScore = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;

            if (avgScore < 60 && recentScores.length >= 3) {
                // User is struggling - suggest easier content
                return {
                    shouldAdapt: true,
                    reason: 'User struggling with current difficulty',
                    suggestedChanges: {
                        triggerMetric: 'low_scores',
                        reorder: true,
                        priorities: this._generateEasierPriorities(pathway)
                    }
                };
            }

            // Check for excelling pattern (high scores, fast completion)
            if (avgScore > 85 && recentScores.length >= 3) {
                // User excelling - suggest more challenging content
                return {
                    shouldAdapt: true,
                    reason: 'User excelling - ready for advanced content',
                    suggestedChanges: {
                        triggerMetric: 'high_scores',
                        addModules: await this._getAdvancedModules(pathway)
                    }
                };
            }

            return { shouldAdapt: false };
        } catch (error) {
            logger.error('Error checking for adaptation:', error);
            return null;
        }
    }

    /**
     * Generate easier priorities for struggling users
     * @private
     */
    _generateEasierPriorities(pathway) {
        const priorities = {};

        pathway.modules.forEach((module, index) => {
            if (module.difficulty === 'beginner') {
                priorities[module.moduleId] = index; // Keep beginner modules early
            } else if (module.difficulty === 'intermediate') {
                priorities[module.moduleId] = index + 100; // Push intermediate later
            } else {
                priorities[module.moduleId] = index + 200; // Push advanced much later
            }
        });

        return priorities;
    }

    /**
     * Get advanced modules for excelling users
     * @private
     */
    async _getAdvancedModules(pathway) {
        const focusAreas = pathway.focusAreas;
        const advancedModules = [];

        for (const area of focusAreas) {
            const modules = await Module.find({
                category: area,
                difficulty: 'advanced',
                isActive: true
            }).limit(2);

            modules.forEach(module => {
                advancedModules.push({
                    moduleId: module._id,
                    reason: 'Advanced content for high performers',
                    duration: module.estimatedDuration || 8,
                    difficulty: 'advanced'
                });
            });
        }

        return advancedModules;
    }

    /**
     * Get pathway recommendations for user
     */
    async getRecommendations(userId) {
        try {
            const pathway = await LearningPathway.getActivePathway(userId);

            if (!pathway) {
                return {
                    hasPathway: false,
                    recommendation: 'Generate a personalized learning pathway to get started'
                };
            }

            const currentModule = pathway.currentModule;
            const nextModules = pathway.nextModules;

            return {
                hasPathway: true,
                currentModule,
                nextModules,
                completionPercentage: pathway.completionPercentage,
                projectedCompletion: pathway.projectedCompletionDate,
                totalHours: pathway.totalEstimatedHours,
                hoursCompleted: pathway.hoursCompleted
            };
        } catch (error) {
            logger.error('Error getting recommendations:', error);
            throw error;
        }
    }
}

module.exports = new PathwayGeneratorService();
