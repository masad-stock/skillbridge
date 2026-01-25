const ResearchAssessment = require('../../models/ResearchAssessment');
const User = require('../../models/User');
const logger = require('../../utils/logger');

/**
 * Standardized question bank for research assessments
 * Questions are categorized by skill and difficulty level
 */
const QUESTION_BANK = {
    basic_digital: [
        { id: 'bd_1', difficulty: 1, question: 'What is a web browser?', correctAnswer: 'A' },
        { id: 'bd_2', difficulty: 2, question: 'How do you create a strong password?', correctAnswer: 'B' },
        { id: 'bd_3', difficulty: 3, question: 'What is cloud storage?', correctAnswer: 'C' },
        { id: 'bd_4', difficulty: 4, question: 'How do you identify a phishing email?', correctAnswer: 'D' },
        { id: 'bd_5', difficulty: 5, question: 'What is two-factor authentication?', correctAnswer: 'A' }
    ],
    business_automation: [
        { id: 'ba_1', difficulty: 1, question: 'What is inventory management?', correctAnswer: 'B' },
        { id: 'ba_2', difficulty: 2, question: 'How do you track customer information?', correctAnswer: 'C' },
        { id: 'ba_3', difficulty: 3, question: 'What is a sales pipeline?', correctAnswer: 'A' },
        { id: 'ba_4', difficulty: 4, question: 'How do you automate invoicing?', correctAnswer: 'D' },
        { id: 'ba_5', difficulty: 5, question: 'What is business process automation?', correctAnswer: 'B' }
    ],
    e_commerce: [
        { id: 'ec_1', difficulty: 1, question: 'What is online selling?', correctAnswer: 'A' },
        { id: 'ec_2', difficulty: 2, question: 'How do you list products online?', correctAnswer: 'C' },
        { id: 'ec_3', difficulty: 3, question: 'What is a payment gateway?', correctAnswer: 'B' },
        { id: 'ec_4', difficulty: 4, question: 'How do you handle online orders?', correctAnswer: 'D' },
        { id: 'ec_5', difficulty: 5, question: 'What is conversion rate optimization?', correctAnswer: 'A' }
    ],
    digital_marketing: [
        { id: 'dm_1', difficulty: 1, question: 'What is social media marketing?', correctAnswer: 'B' },
        { id: 'dm_2', difficulty: 2, question: 'How do you create engaging content?', correctAnswer: 'A' },
        { id: 'dm_3', difficulty: 3, question: 'What is SEO?', correctAnswer: 'C' },
        { id: 'dm_4', difficulty: 4, question: 'How do you measure campaign success?', correctAnswer: 'D' },
        { id: 'dm_5', difficulty: 5, question: 'What is marketing automation?', correctAnswer: 'B' }
    ],
    financial_management: [
        { id: 'fm_1', difficulty: 1, question: 'What is a budget?', correctAnswer: 'A' },
        { id: 'fm_2', difficulty: 2, question: 'How do you track expenses?', correctAnswer: 'C' },
        { id: 'fm_3', difficulty: 3, question: 'What is profit margin?', correctAnswer: 'B' },
        { id: 'fm_4', difficulty: 4, question: 'How do you create financial reports?', correctAnswer: 'D' },
        { id: 'fm_5', difficulty: 5, question: 'What is cash flow management?', correctAnswer: 'A' }
    ],
    communication: [
        { id: 'cm_1', difficulty: 1, question: 'What is email communication?', correctAnswer: 'B' },
        { id: 'cm_2', difficulty: 2, question: 'How do you write professional emails?', correctAnswer: 'C' },
        { id: 'cm_3', difficulty: 3, question: 'What is video conferencing?', correctAnswer: 'A' },
        { id: 'cm_4', difficulty: 4, question: 'How do you collaborate online?', correctAnswer: 'D' },
        { id: 'cm_5', difficulty: 5, question: 'What is asynchronous communication?', correctAnswer: 'B' }
    ]
};

class BaselineAssessmentService {
    /**
     * Generate a standardized assessment for a skill category
     */
    async generateAssessment(userId, skillCategory, assessmentType = 'baseline') {
        try {
            const questions = QUESTION_BANK[skillCategory];

            if (!questions) {
                throw new Error(`Invalid skill category: ${skillCategory}`);
            }

            // Return questions without correct answers (for frontend)
            return {
                skillCategory,
                assessmentType,
                questions: questions.map(q => ({
                    questionId: q.id,
                    difficulty: q.difficulty,
                    question: q.question
                }))
            };
        } catch (error) {
            logger.error('Error generating assessment:', error);
            throw error;
        }
    }

    /**
     * Submit and score an assessment
     */
    async submitAssessment(userId, assessmentData) {
        try {
            const { skillCategory, assessmentType, responses, metadata } = assessmentData;

            // Get correct answers from question bank
            const questions = QUESTION_BANK[skillCategory];

            // Score each response
            const scoredQuestions = responses.map(response => {
                const question = questions.find(q => q.id === response.questionId);
                const correct = question && question.correctAnswer === response.answer;

                return {
                    questionId: response.questionId,
                    difficulty: question ? question.difficulty : 3,
                    response: response.answer,
                    correct,
                    responseTime: response.responseTime,
                    confidence: response.confidence
                };
            });

            // Calculate scores
            const correctCount = scoredQuestions.filter(q => q.correct).length;
            const raw = correctCount;
            const normalized = (correctCount / questions.length) * 100;

            // Get baseline score for comparison (if this is a follow-up assessment)
            let comparison = {};
            if (assessmentType !== 'baseline') {
                const baseline = await ResearchAssessment.findOne({
                    userId,
                    skillCategory,
                    assessmentType: 'baseline'
                });

                if (baseline) {
                    const improvement = normalized - baseline.scores.normalized;
                    const effectSize = this.calculateEffectSize(
                        baseline.scores.normalized,
                        normalized,
                        15 // Assumed standard deviation
                    );

                    comparison = {
                        baselineScore: baseline.scores.normalized,
                        improvement,
                        effectSize
                    };
                }
            }

            // Create assessment record
            const assessment = new ResearchAssessment({
                userId,
                assessmentType,
                skillCategory,
                questions: scoredQuestions,
                scores: {
                    raw,
                    normalized
                },
                comparison,
                completedAt: new Date(),
                metadata
            });

            await assessment.save();

            // Update user's skills profile
            await this.updateUserSkillsProfile(userId, skillCategory, normalized);

            // Schedule follow-up if this is baseline
            if (assessmentType === 'baseline') {
                await this.scheduleFollowUps(userId, skillCategory);
            }

            logger.info(`Assessment submitted for user ${userId}, category ${skillCategory}`);

            return {
                assessmentId: assessment._id,
                scores: assessment.scores,
                comparison: assessment.comparison
            };
        } catch (error) {
            logger.error('Error submitting assessment:', error);
            throw error;
        }
    }

    /**
     * Calculate Cohen's d effect size
     */
    calculateEffectSize(mean1, mean2, pooledSD) {
        return (mean2 - mean1) / pooledSD;
    }

    /**
     * Update user's skills profile based on assessment results
     */
    async updateUserSkillsProfile(userId, skillCategory, normalizedScore) {
        try {
            const competencyLevel = Math.floor(normalizedScore / 25); // 0-4 scale

            const updateField = `skillsProfile.competencyLevels.${skillCategory}`;

            await User.findByIdAndUpdate(userId, {
                $set: {
                    [updateField]: competencyLevel,
                    'skillsProfile.lastAssessmentDate': new Date()
                }
            });

            logger.info(`Updated skills profile for user ${userId}, ${skillCategory}: ${competencyLevel}`);
        } catch (error) {
            logger.error('Error updating user skills profile:', error);
            throw error;
        }
    }

    /**
     * Schedule follow-up assessments at 3 and 6 months
     */
    async scheduleFollowUps(userId, skillCategory) {
        try {
            const now = new Date();
            const threeMonths = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
            const sixMonths = new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000);

            // Store follow-up schedule in user document
            await User.findByIdAndUpdate(userId, {
                $push: {
                    'researchParticipant.followUpSchedule': {
                        $each: [
                            { date: threeMonths, type: 'retention_3m', skillCategory },
                            { date: sixMonths, type: 'retention_6m', skillCategory }
                        ]
                    }
                }
            });

            logger.info(`Scheduled follow-ups for user ${userId}, category ${skillCategory}`);
        } catch (error) {
            logger.error('Error scheduling follow-ups:', error);
            throw error;
        }
    }

    /**
     * Get assessment history for a user
     */
    async getAssessmentHistory(userId, skillCategory = null) {
        try {
            const query = { userId };
            if (skillCategory) {
                query.skillCategory = skillCategory;
            }

            const assessments = await ResearchAssessment.find(query)
                .sort({ completedAt: -1 })
                .select('-questions.response'); // Don't expose answers

            return assessments;
        } catch (error) {
            logger.error('Error getting assessment history:', error);
            throw error;
        }
    }

    /**
     * Check if user needs to complete baseline assessment
     */
    async needsBaselineAssessment(userId) {
        try {
            const baselineCount = await ResearchAssessment.countDocuments({
                userId,
                assessmentType: 'baseline'
            });

            return baselineCount === 0;
        } catch (error) {
            logger.error('Error checking baseline assessment:', error);
            throw error;
        }
    }

    /**
     * Get due follow-up assessments for a user
     */
    async getDueFollowUps(userId) {
        try {
            const user = await User.findById(userId);

            if (!user || !user.researchParticipant || !user.researchParticipant.followUpSchedule) {
                return [];
            }

            const now = new Date();
            const dueFollowUps = user.researchParticipant.followUpSchedule.filter(
                followUp => followUp.date <= now
            );

            return dueFollowUps;
        } catch (error) {
            logger.error('Error getting due follow-ups:', error);
            throw error;
        }
    }
}

module.exports = new BaselineAssessmentService();
