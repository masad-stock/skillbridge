const assessmentRepository = require('../repositories/assessmentRepository');
const mlService = require('./mlServiceClient');
const logger = require('../utils/logger');

/**
 * Assessment Service
 * Business logic for assessment operations
 */
class AssessmentService {
    async getAllAssessments(filters = {}, pagination = {}) {
        const { userId, status } = filters;
        const { page = 1, limit = 10 } = pagination;

        const query = {};

        if (userId) {
            query.user = userId;
        }

        if (status) {
            query.status = status;
        }

        const { assessments, total } = await assessmentRepository.findAll(query, {
            page,
            limit,
            populate: 'user'
        });

        return {
            assessments,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        };
    }

    async getAssessmentById(assessmentId) {
        const assessment = await assessmentRepository.findById(assessmentId, 'user');

        if (!assessment) {
            throw new Error('Assessment not found');
        }

        return assessment;
    }

    async createAssessment(assessmentData) {
        // Validate required fields
        if (!assessmentData.user) {
            throw new Error('User is required');
        }

        const assessment = await assessmentRepository.create({
            ...assessmentData,
            status: assessmentData.status || 'in_progress',
            createdAt: new Date()
        });

        return assessment;
    }

    async updateAssessment(assessmentId, updates) {
        const assessment = await assessmentRepository.update(assessmentId, updates);

        if (!assessment) {
            throw new Error('Assessment not found');
        }

        return assessment;
    }

    async deleteAssessment(assessmentId) {
        const assessment = await assessmentRepository.findById(assessmentId);

        if (!assessment) {
            throw new Error('Assessment not found');
        }

        await assessmentRepository.delete(assessmentId);

        return { message: 'Assessment deleted successfully' };
    }

    async getAssessmentsByUser(userId, limit = 10) {
        return await assessmentRepository.findByUser(userId, limit);
    }

    async getAssessmentsByStatus(status) {
        return await assessmentRepository.findByStatus(status);
    }

    async getAssessmentStats() {
        const total = await assessmentRepository.count();
        const completed = await assessmentRepository.getCompletedCount();
        const completionRate = total > 0 ? ((completed / total) * 100).toFixed(2) : 0;

        return {
            total,
            completed,
            completionRate
        };
    }

    async getAssessmentStatsByStatus(startDate) {
        return await assessmentRepository.getStatsByStatus(startDate);
    }

    async calculateAverageScore(filters = {}) {
        return await assessmentRepository.getAverageScore(filters);
    }

    async completeAssessment(assessmentId, results) {
        const assessment = await assessmentRepository.findById(assessmentId);

        if (!assessment) {
            throw new Error('Assessment not found');
        }

        if (assessment.status === 'completed') {
            throw new Error('Assessment already completed');
        }

        // Prepare data for ML assessment
        const responses = assessment.responses.map(r => ({
            correct: r.isCorrect,
            category: assessment.questions.find(q => q._id.toString() === r.questionId.toString())?.category || 'unknown'
        }));

        const timings = assessment.responses.map(r => r.timeSpent || 30);
        const confidence = results.confidence || timings.map(() => 0.7);

        // Get ML-powered competency assessment
        let mlPrediction = null;
        try {
            const mlResult = await mlService.assessCompetency(
                assessment.user.toString(),
                responses,
                timings,
                confidence
            );

            if (mlResult.success) {
                mlPrediction = {
                    competencyLevel: mlResult.data.competency_level,
                    confidence: mlResult.data.confidence,
                    probabilities: mlResult.data.probabilities,
                    method: mlResult.method,
                    timestamp: new Date()
                };

                // Update learning style if detected
                if (mlResult.data.learning_style) {
                    mlPrediction.learningStyle = mlResult.data.learning_style;
                }
            }
        } catch (error) {
            logger.error('ML assessment failed, using fallback:', error);
        }

        // Calculate performance metrics
        const avgResponseTime = timings.reduce((a, b) => a + b, 0) / timings.length;
        const responseTimeVariance = timings.reduce((sum, time) => {
            return sum + Math.pow(time - avgResponseTime, 2);
        }, 0) / timings.length;

        // Calculate streaks
        let streakCorrect = 0;
        let streakIncorrect = 0;
        let maxStreakCorrect = 0;
        let maxStreakIncorrect = 0;

        responses.forEach(r => {
            if (r.correct) {
                streakCorrect++;
                maxStreakCorrect = Math.max(maxStreakCorrect, streakCorrect);
                streakIncorrect = 0;
            } else {
                streakIncorrect++;
                maxStreakIncorrect = Math.max(maxStreakIncorrect, streakIncorrect);
                streakCorrect = 0;
            }
        });

        const updates = {
            status: 'completed',
            completedAt: new Date(),
            'aiAnalysis.mlPrediction': mlPrediction,
            'aiAnalysis.performanceMetrics': {
                avgResponseTime,
                responseTimeVariance,
                confidenceScores: confidence,
                streakCorrect: maxStreakCorrect,
                streakIncorrect: maxStreakIncorrect
            },
            ...results
        };

        const updatedAssessment = await assessmentRepository.update(assessmentId, updates);

        // Update user's skills profile with ML results
        if (mlPrediction && updatedAssessment.user) {
            await this.updateUserSkillsProfile(updatedAssessment.user, mlPrediction, responses);
        }

        return updatedAssessment;
    }

    async updateUserSkillsProfile(userId, mlPrediction, responses) {
        try {
            const User = require('../models/User');
            const user = await User.findById(userId);

            if (!user) return;

            // Update ML competency profile
            user.skillsProfile.mlCompetencyProfile = {
                confidence: mlPrediction.confidence,
                probabilities: mlPrediction.probabilities,
                lastMLAssessment: new Date(),
                mlMethod: mlPrediction.method
            };

            // Update competency levels based on ML prediction
            const competencyLevel = mlPrediction.competencyLevel;

            // Calculate category-wise competency
            const categoryPerformance = {};
            responses.forEach(r => {
                if (!categoryPerformance[r.category]) {
                    categoryPerformance[r.category] = { correct: 0, total: 0 };
                }
                categoryPerformance[r.category].total++;
                if (r.correct) {
                    categoryPerformance[r.category].correct++;
                }
            });

            // Update each category
            Object.keys(categoryPerformance).forEach(category => {
                const accuracy = categoryPerformance[category].correct / categoryPerformance[category].total;
                const categoryLevel = Math.ceil(accuracy * 4); // Scale to 1-4
                if (user.skillsProfile.competencyLevels[category] !== undefined) {
                    user.skillsProfile.competencyLevels[category] = categoryLevel;
                }
            });

            // Update learning style if detected
            if (mlPrediction.learningStyle) {
                user.skillsProfile.learningStyle = {
                    style: mlPrediction.learningStyle,
                    confidence: mlPrediction.confidence,
                    detectedDate: new Date()
                };
            }

            // Add to assessment history
            if (!user.skillsProfile.assessmentHistory) {
                user.skillsProfile.assessmentHistory = [];
            }

            user.skillsProfile.assessmentHistory.push({
                date: new Date(),
                responses,
                competencyLevel,
                mlConfidence: mlPrediction.confidence
            });

            // Keep only last 10 assessments
            if (user.skillsProfile.assessmentHistory.length > 10) {
                user.skillsProfile.assessmentHistory = user.skillsProfile.assessmentHistory.slice(-10);
            }

            user.skillsProfile.assessmentCompleted = true;
            user.skillsProfile.lastAssessmentDate = new Date();

            await user.save();

            logger.info(`Updated skills profile for user ${userId} with ML results`);
        } catch (error) {
            logger.error('Error updating user skills profile:', error);
        }
    }
}

module.exports = new AssessmentService();
