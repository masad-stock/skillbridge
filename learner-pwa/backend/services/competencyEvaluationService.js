/**
 * Competency Evaluation Service
 * Evaluates user competencies across multiple dimensions for personalized learning
 */

const CompetencyScore = require('../models/CompetencyScore');
const Assessment = require('../models/Assessment');
const Progress = require('../models/Progress');
const Module = require('../models/Module');
const BusinessTool = require('../models/BusinessTool');
const logger = require('../utils/logger');
const mlServiceClient = require('./mlServiceClient');

class CompetencyEvaluationService {
    /**
     * Evaluate user competencies based on all available data
     */
    async evaluateUserCompetency(userId, options = {}) {
        try {
            logger.info(`Evaluating competency for user ${userId}`);

            // Gather all evidence
            const evidence = await this._gatherEvidence(userId);

            // Calculate competency scores
            const competencies = await this._calculateCompetencies(evidence);

            // Get previous evaluation for comparison
            const previousEval = await CompetencyScore.getLatestForUser(userId);

            // Create new evaluation
            const evaluation = new CompetencyScore({
                userId,
                evaluationDate: new Date(),
                competencies,
                previousEvaluationId: previousEval?._id,
                evaluationMethod: options.method || 'hybrid',
                mlModelVersion: options.mlModelVersion,
                confidenceScore: this._calculateConfidence(evidence),
                dataQuality: this._assessDataQuality(evidence)
            });

            // Calculate derived metrics
            evaluation.calculateOverallScore();
            evaluation.identifyStrengthsAndWeaknesses();
            await evaluation.calculateLearningVelocity();
            evaluation.estimateTimeToNextLevel();

            // Get module recommendations
            evaluation.suggestedModules = await this._generateModuleRecommendations(
                evaluation,
                evidence
            );

            await evaluation.save();

            logger.info(`Competency evaluation completed for user ${userId}: ${evaluation.overallScore}/100`);

            return evaluation;
        } catch (error) {
            logger.error('Error evaluating user competency:', error);
            throw error;
        }
    }

    /**
     * Gather all evidence of user's competencies
     * @private
     */
    async _gatherEvidence(userId) {
        const [assessments, progress, businessToolUsage] = await Promise.all([
            Assessment.find({ userId }).sort({ completedAt: -1 }).limit(50),
            Progress.find({ userId }).populate('moduleId'),
            this._getBusinessToolUsage(userId)
        ]);

        return {
            assessments,
            progress,
            businessToolUsage,
            totalAssessments: assessments.length,
            completedModules: progress.filter(p => p.completed).length,
            totalModules: progress.length
        };
    }

    /**
     * Calculate competency scores for each domain
     * @private
     */
    async _calculateCompetencies(evidence) {
        const competencies = {
            basicDigitalLiteracy: await this._evaluateBasicDigitalLiteracy(evidence),
            digitalCommunication: await this._evaluateDigitalCommunication(evidence),
            eCommerce: await this._evaluateECommerce(evidence),
            digitalFinancialServices: await this._evaluateDigitalFinancialServices(evidence),
            businessAutomation: await this._evaluateBusinessAutomation(evidence),
            digitalMarketing: await this._evaluateDigitalMarketing(evidence),
            dataManagement: await this._evaluateDataManagement(evidence)
        };

        return competencies;
    }

    /**
     * Evaluate Basic Digital Literacy competency
     * @private
     */
    async _evaluateBasicDigitalLiteracy(evidence) {
        const relevantAssessments = evidence.assessments.filter(a =>
            a.category === 'basic_digital_literacy' ||
            a.title?.toLowerCase().includes('basic') ||
            a.title?.toLowerCase().includes('introduction')
        );

        const relevantModules = evidence.progress.filter(p =>
            p.moduleId?.category === 'basic_digital_literacy' ||
            p.moduleId?.title?.toLowerCase().includes('basic')
        );

        const subSkills = {
            deviceOperation: this._calculateSubSkillScore(relevantAssessments, relevantModules, 'device'),
            fileManagement: this._calculateSubSkillScore(relevantAssessments, relevantModules, 'file'),
            internetNavigation: this._calculateSubSkillScore(relevantAssessments, relevantModules, 'internet'),
            emailCommunication: this._calculateSubSkillScore(relevantAssessments, relevantModules, 'email')
        };

        const avgScore = Object.values(subSkills).reduce((sum, skill) => sum + skill.score, 0) / 4;

        return {
            score: Math.round(avgScore),
            level: this._scoreToLevel(avgScore),
            subSkills: Object.entries(subSkills).map(([name, data]) => ({
                name,
                score: data.score,
                assessmentDate: new Date(),
                evidenceCount: data.evidenceCount
            })),
            lastAssessed: new Date(),
            assessmentCount: relevantAssessments.length
        };
    }

    /**
     * Evaluate Digital Communication competency
     * @private
     */
    async _evaluateDigitalCommunication(evidence) {
        const relevantAssessments = evidence.assessments.filter(a =>
            a.category === 'digital_communication' ||
            a.title?.toLowerCase().includes('communication')
        );

        const relevantModules = evidence.progress.filter(p =>
            p.moduleId?.category === 'digital_communication'
        );

        const subSkills = {
            professionalEmail: this._calculateSubSkillScore(relevantAssessments, relevantModules, 'email'),
            videoConferencing: this._calculateSubSkillScore(relevantAssessments, relevantModules, 'video'),
            collaborationTools: this._calculateSubSkillScore(relevantAssessments, relevantModules, 'collaboration'),
            socialMediaProfessional: this._calculateSubSkillScore(relevantAssessments, relevantModules, 'social')
        };

        const avgScore = Object.values(subSkills).reduce((sum, skill) => sum + skill.score, 0) / 4;

        return {
            score: Math.round(avgScore),
            level: this._scoreToLevel(avgScore),
            subSkills: Object.entries(subSkills).map(([name, data]) => ({
                name,
                score: data.score,
                assessmentDate: new Date(),
                evidenceCount: data.evidenceCount
            })),
            lastAssessed: new Date(),
            assessmentCount: relevantAssessments.length
        };
    }

    /**
     * Evaluate E-Commerce competency
     * @private
     */
    async _evaluateECommerce(evidence) {
        const relevantAssessments = evidence.assessments.filter(a =>
            a.category === 'ecommerce' ||
            a.title?.toLowerCase().includes('commerce') ||
            a.title?.toLowerCase().includes('online selling')
        );

        const relevantModules = evidence.progress.filter(p =>
            p.moduleId?.category === 'ecommerce'
        );

        const subSkills = {
            onlineMarketplaces: this._calculateSubSkillScore(relevantAssessments, relevantModules, 'marketplace'),
            productListing: this._calculateSubSkillScore(relevantAssessments, relevantModules, 'product'),
            orderManagement: this._calculateSubSkillScore(relevantAssessments, relevantModules, 'order'),
            customerService: this._calculateSubSkillScore(relevantAssessments, relevantModules, 'customer')
        };

        const avgScore = Object.values(subSkills).reduce((sum, skill) => sum + skill.score, 0) / 4;

        return {
            score: Math.round(avgScore),
            level: this._scoreToLevel(avgScore),
            subSkills: Object.entries(subSkills).map(([name, data]) => ({
                name,
                score: data.score,
                assessmentDate: new Date(),
                evidenceCount: data.evidenceCount
            })),
            lastAssessed: new Date(),
            assessmentCount: relevantAssessments.length
        };
    }

    /**
     * Evaluate Digital Financial Services competency
     * @private
     */
    async _evaluateDigitalFinancialServices(evidence) {
        const relevantAssessments = evidence.assessments.filter(a =>
            a.category === 'digital_finance' ||
            a.title?.toLowerCase().includes('payment') ||
            a.title?.toLowerCase().includes('financial')
        );

        const relevantModules = evidence.progress.filter(p =>
            p.moduleId?.category === 'digital_finance'
        );

        // Bonus points for actual business tool usage
        const paymentToolUsage = evidence.businessToolUsage.payment || 0;

        const subSkills = {
            mobileMoney: this._calculateSubSkillScore(relevantAssessments, relevantModules, 'mpesa', paymentToolUsage * 10),
            onlinePayments: this._calculateSubSkillScore(relevantAssessments, relevantModules, 'payment', paymentToolUsage * 10),
            digitalBanking: this._calculateSubSkillScore(relevantAssessments, relevantModules, 'banking'),
            financialRecordKeeping: this._calculateSubSkillScore(relevantAssessments, relevantModules, 'record', paymentToolUsage * 5)
        };

        const avgScore = Object.values(subSkills).reduce((sum, skill) => sum + skill.score, 0) / 4;

        return {
            score: Math.round(Math.min(100, avgScore)),
            level: this._scoreToLevel(avgScore),
            subSkills: Object.entries(subSkills).map(([name, data]) => ({
                name,
                score: Math.min(100, data.score),
                assessmentDate: new Date(),
                evidenceCount: data.evidenceCount
            })),
            lastAssessed: new Date(),
            assessmentCount: relevantAssessments.length
        };
    }

    /**
     * Evaluate Business Automation competency
     * @private
     */
    async _evaluateBusinessAutomation(evidence) {
        const relevantAssessments = evidence.assessments.filter(a =>
            a.category === 'business_automation' ||
            a.title?.toLowerCase().includes('business') ||
            a.title?.toLowerCase().includes('automation')
        );

        const relevantModules = evidence.progress.filter(p =>
            p.moduleId?.category === 'business_automation'
        );

        // Heavy weight on actual tool usage
        const toolUsage = evidence.businessToolUsage;

        const subSkills = {
            inventoryManagement: this._calculateSubSkillScore(relevantAssessments, relevantModules, 'inventory', toolUsage.inventory * 15),
            paymentTracking: this._calculateSubSkillScore(relevantAssessments, relevantModules, 'payment', toolUsage.payment * 15),
            customerRelationshipManagement: this._calculateSubSkillScore(relevantAssessments, relevantModules, 'crm', toolUsage.crm * 15),
            businessAnalytics: this._calculateSubSkillScore(relevantAssessments, relevantModules, 'analytics', toolUsage.analytics * 10)
        };

        const avgScore = Object.values(subSkills).reduce((sum, skill) => sum + skill.score, 0) / 4;

        return {
            score: Math.round(Math.min(100, avgScore)),
            level: this._scoreToLevel(avgScore),
            subSkills: Object.entries(subSkills).map(([name, data]) => ({
                name,
                score: Math.min(100, data.score),
                assessmentDate: new Date(),
                evidenceCount: data.evidenceCount
            })),
            lastAssessed: new Date(),
            assessmentCount: relevantAssessments.length
        };
    }

    /**
     * Evaluate Digital Marketing competency
     * @private
     */
    async _evaluateDigitalMarketing(evidence) {
        const relevantAssessments = evidence.assessments.filter(a =>
            a.category === 'digital_marketing' ||
            a.title?.toLowerCase().includes('marketing')
        );

        const relevantModules = evidence.progress.filter(p =>
            p.moduleId?.category === 'digital_marketing'
        );

        const subSkills = {
            socialMediaMarketing: this._calculateSubSkillScore(relevantAssessments, relevantModules, 'social'),
            contentCreation: this._calculateSubSkillScore(relevantAssessments, relevantModules, 'content'),
            onlineAdvertising: this._calculateSubSkillScore(relevantAssessments, relevantModules, 'advertising'),
            customerEngagement: this._calculateSubSkillScore(relevantAssessments, relevantModules, 'engagement')
        };

        const avgScore = Object.values(subSkills).reduce((sum, skill) => sum + skill.score, 0) / 4;

        return {
            score: Math.round(avgScore),
            level: this._scoreToLevel(avgScore),
            subSkills: Object.entries(subSkills).map(([name, data]) => ({
                name,
                score: data.score,
                assessmentDate: new Date(),
                evidenceCount: data.evidenceCount
            })),
            lastAssessed: new Date(),
            assessmentCount: relevantAssessments.length
        };
    }

    /**
     * Evaluate Data Management competency
     * @private
     */
    async _evaluateDataManagement(evidence) {
        const relevantAssessments = evidence.assessments.filter(a =>
            a.category === 'data_management' ||
            a.title?.toLowerCase().includes('data') ||
            a.title?.toLowerCase().includes('spreadsheet')
        );

        const relevantModules = evidence.progress.filter(p =>
            p.moduleId?.category === 'data_management'
        );

        const subSkills = {
            spreadsheetBasics: this._calculateSubSkillScore(relevantAssessments, relevantModules, 'spreadsheet'),
            dataEntry: this._calculateSubSkillScore(relevantAssessments, relevantModules, 'entry'),
            dataAnalysis: this._calculateSubSkillScore(relevantAssessments, relevantModules, 'analysis'),
            reportGeneration: this._calculateSubSkillScore(relevantAssessments, relevantModules, 'report')
        };

        const avgScore = Object.values(subSkills).reduce((sum, skill) => sum + skill.score, 0) / 4;

        return {
            score: Math.round(avgScore),
            level: this._scoreToLevel(avgScore),
            subSkills: Object.entries(subSkills).map(([name, data]) => ({
                name,
                score: data.score,
                assessmentDate: new Date(),
                evidenceCount: data.evidenceCount
            })),
            lastAssessed: new Date(),
            assessmentCount: relevantAssessments.length
        };
    }

    /**
     * Calculate sub-skill score based on evidence
     * @private
     */
    _calculateSubSkillScore(assessments, modules, keyword, bonusPoints = 0) {
        let score = 0;
        let evidenceCount = 0;

        // Assessment scores (weighted 60%)
        const relevantAssessments = assessments.filter(a =>
            a.title?.toLowerCase().includes(keyword) ||
            a.questions?.some(q => q.text?.toLowerCase().includes(keyword))
        );

        if (relevantAssessments.length > 0) {
            const avgAssessmentScore = relevantAssessments.reduce((sum, a) =>
                sum + (a.score || 0), 0) / relevantAssessments.length;
            score += avgAssessmentScore * 0.6;
            evidenceCount += relevantAssessments.length;
        }

        // Module completion (weighted 30%)
        const relevantModules = modules.filter(m =>
            m.moduleId?.title?.toLowerCase().includes(keyword) ||
            m.moduleId?.description?.toLowerCase().includes(keyword)
        );

        if (relevantModules.length > 0) {
            const completionRate = relevantModules.filter(m => m.completed).length / relevantModules.length;
            const avgModuleScore = relevantModules.reduce((sum, m) =>
                sum + (m.score || 0), 0) / relevantModules.length;
            score += (completionRate * 100 + avgModuleScore) / 2 * 0.3;
            evidenceCount += relevantModules.length;
        }

        // Bonus points from actual usage (weighted 10%)
        score += Math.min(10, bonusPoints * 0.1);

        return {
            score: Math.round(Math.min(100, score)),
            evidenceCount
        };
    }

    /**
     * Get business tool usage statistics
     * @private
     */
    async _getBusinessToolUsage(userId) {
        // This would integrate with BusinessToolUsage model when implemented
        // For now, return placeholder
        return {
            payment: 0,
            inventory: 0,
            crm: 0,
            analytics: 0
        };
    }

    /**
     * Generate module recommendations based on competency gaps
     * @private
     */
    async _generateModuleRecommendations(evaluation, evidence) {
        const recommendations = [];

        // Focus on improvement areas
        for (const area of evaluation.improvementAreas) {
            const modules = await Module.find({
                category: area.domain,
                difficulty: this._getAppropriateLevel(area.score)
            }).limit(2);

            modules.forEach((module, index) => {
                recommendations.push({
                    moduleId: module._id,
                    reason: `Strengthen ${area.domain} skills`,
                    priority: area.priority === 'high' ? 3 : area.priority === 'medium' ? 2 : 1
                });
            });
        }

        // Sort by priority
        recommendations.sort((a, b) => b.priority - a.priority);

        return recommendations.slice(0, 5); // Top 5 recommendations
    }

    /**
     * Get appropriate difficulty level based on score
     * @private
     */
    _getAppropriateLevel(score) {
        if (score < 30) return 'beginner';
        if (score < 60) return 'intermediate';
        return 'advanced';
    }

    /**
     * Calculate confidence in evaluation
     * @private
     */
    _calculateConfidence(evidence) {
        const assessmentWeight = Math.min(1, evidence.totalAssessments / 10) * 0.5;
        const moduleWeight = Math.min(1, evidence.completedModules / 5) * 0.3;
        const toolWeight = 0.2; // Placeholder for tool usage

        return assessmentWeight + moduleWeight + toolWeight;
    }

    /**
     * Assess data quality
     * @private
     */
    _assessDataQuality(evidence) {
        const totalEvidence = evidence.totalAssessments + evidence.completedModules;

        if (totalEvidence >= 10) return 'high';
        if (totalEvidence >= 5) return 'medium';
        return 'low';
    }

    /**
     * Convert score to level
     * @private
     */
    _scoreToLevel(score) {
        if (score >= 90) return 'expert';
        if (score >= 70) return 'advanced';
        if (score >= 40) return 'intermediate';
        return 'beginner';
    }

    /**
     * Get competency comparison between two evaluations
     */
    async compareEvaluations(userId, evaluation1Id, evaluation2Id) {
        const [eval1, eval2] = await Promise.all([
            CompetencyScore.findById(evaluation1Id),
            CompetencyScore.findById(evaluation2Id)
        ]);

        if (!eval1 || !eval2) {
            throw new Error('Evaluations not found');
        }

        const comparison = {
            timeframe: {
                from: eval1.evaluationDate,
                to: eval2.evaluationDate,
                days: Math.floor((eval2.evaluationDate - eval1.evaluationDate) / (1000 * 60 * 60 * 24))
            },
            overallChange: {
                scoreBefore: eval1.overallScore,
                scoreAfter: eval2.overallScore,
                change: eval2.overallScore - eval1.overallScore,
                percentChange: ((eval2.overallScore - eval1.overallScore) / eval1.overallScore) * 100
            },
            domainChanges: {}
        };

        // Compare each domain
        Object.keys(eval1.competencies).forEach(domain => {
            comparison.domainChanges[domain] = {
                scoreBefore: eval1.competencies[domain].score,
                scoreAfter: eval2.competencies[domain].score,
                change: eval2.competencies[domain].score - eval1.competencies[domain].score,
                levelBefore: eval1.competencies[domain].level,
                levelAfter: eval2.competencies[domain].level,
                levelChanged: eval1.competencies[domain].level !== eval2.competencies[domain].level
            };
        });

        return comparison;
    }
}

module.exports = new CompetencyEvaluationService();
