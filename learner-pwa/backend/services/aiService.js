/**
 * Adaptive Learning Service
 * 
 * Provides intelligent assessment and learning path generation using
 * rule-based algorithms and statistical analysis.
 * 
 * Note: This service uses algorithmic approaches rather than machine learning
 * to provide adaptive learning experiences.
 */

class AdaptiveLearningService {
    constructor() {
        // Initialize service
    }

    // Generate adaptive assessment questions based on user profile
    async generateAssessmentQuestions(user, category) {
        const questionBank = this.getQuestionBank();

        // Filter by category if specified
        let questions = category
            ? questionBank.filter(q => q.category === category)
            : questionBank;

        // Adaptive selection based on user's previous performance
        if (user.skillsProfile && user.skillsProfile.competencyLevels[category]) {
            const userLevel = user.skillsProfile.competencyLevels[category];
            // Select questions around user's level
            questions = questions.filter(q =>
                q.difficulty >= Math.max(1, userLevel - 1) &&
                q.difficulty <= Math.min(4, userLevel + 1)
            );
        }

        // Randomize and select subset
        const shuffled = questions.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, 15);
    }

    // Analyze assessment results using AI
    async analyzeAssessment(assessment) {
        const responses = assessment.responses;
        const questions = assessment.questions;

        // Calculate category-wise performance
        const categoryScores = {};
        const categoryQuestions = {};

        responses.forEach((response, index) => {
            const question = questions[index];
            const category = question.category;

            if (!categoryScores[category]) {
                categoryScores[category] = { correct: 0, total: 0 };
                categoryQuestions[category] = [];
            }

            categoryScores[category].total++;
            if (response.isCorrect) {
                categoryScores[category].correct++;
            } else {
                categoryQuestions[category].push(question);
            }
        });

        // Determine competency levels
        const competencyLevels = {};
        Object.keys(categoryScores).forEach(category => {
            const accuracy = categoryScores[category].correct / categoryScores[category].total;
            competencyLevels[category] = this.calculateCompetencyLevel(accuracy);
        });

        // Calculate overall score
        const totalCorrect = responses.filter(r => r.isCorrect).length;
        const overallScore = Math.round((totalCorrect / responses.length) * 100);

        // Identify strengths and weaknesses
        const strengths = [];
        const weaknesses = [];

        Object.entries(categoryScores).forEach(([category, scores]) => {
            const accuracy = scores.correct / scores.total;
            if (accuracy >= 0.7) {
                strengths.push(this.getCategoryName(category));
            } else if (accuracy < 0.5) {
                weaknesses.push(this.getCategoryName(category));
            }
        });

        // Generate personalized recommendations
        const recommendations = this.generateRecommendations(competencyLevels, weaknesses);

        // Predict learning style and success rate
        const learningStyle = this.predictLearningStyle(responses);
        const predictedSuccessRate = this.predictSuccessRate(competencyLevels, overallScore);
        const suggestedPace = this.suggestLearningPace(overallScore, responses);

        return {
            competencyLevels,
            overallScore,
            categoryScores,
            strengths,
            weaknesses,
            recommendations,
            learningStyle,
            predictedSuccessRate,
            suggestedPace
        };
    }

    calculateCompetencyLevel(accuracy) {
        if (accuracy >= 0.9) return 4; // Expert
        if (accuracy >= 0.7) return 3; // Advanced
        if (accuracy >= 0.5) return 2; // Intermediate
        return 1; // Beginner
    }

    getCategoryName(category) {
        const names = {
            'basic_digital': 'Basic Digital Skills',
            'business_automation': 'Business Automation',
            'e_commerce': 'E-Commerce',
            'digital_marketing': 'Digital Marketing',
            'financial_management': 'Financial Management',
            'communication': 'Digital Communication'
        };
        return names[category] || category;
    }

    generateRecommendations(competencyLevels, weaknesses) {
        const recommendations = [];

        // Prioritize weaknesses
        weaknesses.forEach(weakness => {
            recommendations.push(`Focus on improving ${weakness} through targeted practice modules`);
        });

        // Suggest next steps based on competency
        Object.entries(competencyLevels).forEach(([category, level]) => {
            if (level >= 3) {
                recommendations.push(`Consider advanced ${this.getCategoryName(category)} modules`);
            }
        });

        // Add general recommendations
        if (recommendations.length === 0) {
            recommendations.push('Continue with your personalized learning path');
            recommendations.push('Practice regularly to maintain your skills');
        }

        return recommendations.slice(0, 5);
    }

    predictLearningStyle(responses) {
        // Analyze response patterns
        const avgTimePerQuestion = responses.reduce((sum, r) => sum + (r.timeSpent || 30), 0) / responses.length;

        if (avgTimePerQuestion < 20) return 'fast-paced';
        if (avgTimePerQuestion > 60) return 'thorough';
        return 'balanced';
    }

    predictSuccessRate(competencyLevels, overallScore) {
        const avgLevel = Object.values(competencyLevels).reduce((a, b) => a + b, 0) / Object.keys(competencyLevels).length;
        const baseRate = (avgLevel / 4) * 100;
        const scoreBonus = (overallScore - 50) * 0.2;
        return Math.min(95, Math.max(30, Math.round(baseRate + scoreBonus)));
    }

    suggestLearningPace(overallScore, responses) {
        if (overallScore >= 80) return 'accelerated';
        if (overallScore >= 60) return 'standard';
        return 'foundational';
    }

    // Generate personalized learning path
    async generateLearningPath(user, modules) {
        const competencyLevels = user.skillsProfile.competencyLevels;
        const recommendations = [];

        // Sort categories by competency level (lowest first)
        const sortedCategories = Object.entries(competencyLevels)
            .sort(([, a], [, b]) => a - b);

        // Select modules for each category
        sortedCategories.forEach(([category, level]) => {
            const categoryModules = modules.filter(m =>
                m.category === category &&
                m.difficulty >= level &&
                m.difficulty <= level + 1
            );

            recommendations.push(...categoryModules.slice(0, 2));
        });

        // Add priority modules
        const priorityModules = modules
            .filter(m => m.priority >= 8)
            .sort((a, b) => b.priority - a.priority);

        recommendations.push(...priorityModules.slice(0, 3));

        // Remove duplicates and sort by priority
        const uniqueModules = [...new Map(recommendations.map(m => [m._id.toString(), m])).values()];
        return uniqueModules.sort((a, b) => b.priority - a.priority).slice(0, 10);
    }

    // Question bank for assessments
    getQuestionBank() {
        return [
            // Basic Digital Skills
            {
                question: 'What is the primary function of a web browser?',
                type: 'multiple_choice',
                options: ['Send emails', 'Access websites', 'Store files', 'Edit documents'],
                correctAnswer: 'Access websites',
                category: 'basic_digital',
                difficulty: 1,
                points: 1
            },
            {
                question: 'Which of these is a secure password practice?',
                type: 'multiple_choice',
                options: ['Using your name', 'Same password everywhere', 'Mix of letters, numbers, symbols', 'Sharing with friends'],
                correctAnswer: 'Mix of letters, numbers, symbols',
                category: 'basic_digital',
                difficulty: 1,
                points: 1
            },
            {
                question: 'What does "phishing" mean in internet security?',
                type: 'multiple_choice',
                options: ['Fishing online', 'Scam to steal information', 'Fast internet', 'Email marketing'],
                correctAnswer: 'Scam to steal information',
                category: 'basic_digital',
                difficulty: 2,
                points: 1
            },
            // Business Automation
            {
                question: 'What is the main benefit of digital inventory management?',
                type: 'multiple_choice',
                options: ['More storage space', 'Real-time tracking', 'Cheaper products', 'Faster delivery'],
                correctAnswer: 'Real-time tracking',
                category: 'business_automation',
                difficulty: 2,
                points: 1
            },
            {
                question: 'CRM stands for:',
                type: 'multiple_choice',
                options: ['Customer Revenue Management', 'Customer Relationship Management', 'Company Resource Management', 'Customer Record Maintenance'],
                correctAnswer: 'Customer Relationship Management',
                category: 'business_automation',
                difficulty: 2,
                points: 1
            },
            // E-Commerce
            {
                question: 'What is essential for starting an online store?',
                type: 'multiple_choice',
                options: ['Physical shop', 'Product listings and payment system', 'Large warehouse', 'Delivery trucks'],
                correctAnswer: 'Product listings and payment system',
                category: 'e_commerce',
                difficulty: 2,
                points: 1
            },
            {
                question: 'Which platform is commonly used for e-commerce in Kenya?',
                type: 'multiple_choice',
                options: ['Jumia', 'Amazon', 'eBay', 'Alibaba'],
                correctAnswer: 'Jumia',
                category: 'e_commerce',
                difficulty: 1,
                points: 1
            },
            // Digital Marketing
            {
                question: 'What is the purpose of social media marketing?',
                type: 'multiple_choice',
                options: ['Make friends', 'Engage customers and promote business', 'Share personal photos', 'Play games'],
                correctAnswer: 'Engage customers and promote business',
                category: 'digital_marketing',
                difficulty: 2,
                points: 1
            },
            {
                question: 'SEO stands for:',
                type: 'multiple_choice',
                options: ['Social Engine Optimization', 'Search Engine Optimization', 'Secure Email Operation', 'Sales Enhancement Online'],
                correctAnswer: 'Search Engine Optimization',
                category: 'digital_marketing',
                difficulty: 2,
                points: 1
            },
            // Financial Management
            {
                question: 'M-Pesa is primarily used for:',
                type: 'multiple_choice',
                options: ['Social media', 'Mobile money transfers', 'Email', 'Gaming'],
                correctAnswer: 'Mobile money transfers',
                category: 'financial_management',
                difficulty: 1,
                points: 1
            },
            {
                question: 'What is digital bookkeeping?',
                type: 'multiple_choice',
                options: ['Reading ebooks', 'Recording financial transactions electronically', 'Online shopping', 'Social networking'],
                correctAnswer: 'Recording financial transactions electronically',
                category: 'financial_management',
                difficulty: 2,
                points: 1
            },
            // Communication
            {
                question: 'Professional email should include:',
                type: 'multiple_choice',
                options: ['Emojis only', 'Clear subject and polite tone', 'All caps', 'No greeting'],
                correctAnswer: 'Clear subject and polite tone',
                category: 'communication',
                difficulty: 1,
                points: 1
            }
        ];
    }
}

module.exports = new AdaptiveLearningService();
