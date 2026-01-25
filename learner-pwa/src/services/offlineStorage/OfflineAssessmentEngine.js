/**
 * Offline Assessment Engine
 * Runs skills assessments entirely offline with client-side scoring and learning path generation
 * 
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.6
 */

import offlineStorageManager from './OfflineStorageManager';
import syncQueueManager from './SyncQueueManager';

// Skill categories (matching aiAssessment.js)
const SKILL_CATEGORIES = {
    BASIC_DIGITAL: 'basic_digital',
    BUSINESS_AUTOMATION: 'business_automation',
    E_COMMERCE: 'e_commerce',
    DIGITAL_MARKETING: 'digital_marketing',
    FINANCIAL_MANAGEMENT: 'financial_management',
    COMMUNICATION: 'communication'
};

// Competency levels
const COMPETENCY_LEVELS = {
    BEGINNER: 1,
    INTERMEDIATE: 2,
    ADVANCED: 3,
    EXPERT: 4
};

// Course metadata for learning path generation (cached locally)
const COURSE_METADATA = [
    {
        id: 'mobile-basics',
        title: 'Mobile Phone Basics',
        category: SKILL_CATEGORIES.BASIC_DIGITAL,
        difficulty: 1,
        estimatedTime: 30,
        description: 'Learn essential smartphone skills',
        priority: 1,
        requiredLevel: COMPETENCY_LEVELS.BEGINNER
    },
    {
        id: 'internet-basics',
        title: 'Internet & Search Skills',
        category: SKILL_CATEGORIES.BASIC_DIGITAL,
        difficulty: 1,
        estimatedTime: 45,
        description: 'Master online search and browsing',
        priority: 2,
        requiredLevel: COMPETENCY_LEVELS.BEGINNER
    },
    {
        id: 'email-communication',
        title: 'Email Communication',
        category: SKILL_CATEGORIES.COMMUNICATION,
        difficulty: 1,
        estimatedTime: 40,
        description: 'Professional email skills',
        priority: 3,
        requiredLevel: COMPETENCY_LEVELS.BEGINNER
    },
    {
        id: 'mpesa-mastery',
        title: 'M-Pesa & Mobile Money',
        category: SKILL_CATEGORIES.FINANCIAL_MANAGEMENT,
        difficulty: 2,
        estimatedTime: 50,
        description: 'Master mobile money transactions',
        priority: 4,
        requiredLevel: COMPETENCY_LEVELS.INTERMEDIATE
    },
    {
        id: 'financial-tracking',
        title: 'Financial Record Keeping',
        category: SKILL_CATEGORIES.FINANCIAL_MANAGEMENT,
        difficulty: 2,
        estimatedTime: 60,
        description: 'Track business finances effectively',
        priority: 5,
        requiredLevel: COMPETENCY_LEVELS.INTERMEDIATE
    },
    {
        id: 'business-apps',
        title: 'Business Apps & Tools',
        category: SKILL_CATEGORIES.BUSINESS_AUTOMATION,
        difficulty: 2,
        estimatedTime: 55,
        description: 'Use apps to automate your business',
        priority: 6,
        requiredLevel: COMPETENCY_LEVELS.INTERMEDIATE
    },
    {
        id: 'customer-management',
        title: 'Customer Data Management',
        category: SKILL_CATEGORIES.BUSINESS_AUTOMATION,
        difficulty: 2,
        estimatedTime: 50,
        description: 'Organize customer information',
        priority: 7,
        requiredLevel: COMPETENCY_LEVELS.INTERMEDIATE
    },
    {
        id: 'online-selling',
        title: 'Online Selling Basics',
        category: SKILL_CATEGORIES.E_COMMERCE,
        difficulty: 3,
        estimatedTime: 70,
        description: 'Start selling products online',
        priority: 8,
        requiredLevel: COMPETENCY_LEVELS.ADVANCED
    },
    {
        id: 'social-media-marketing',
        title: 'Social Media for Business',
        category: SKILL_CATEGORIES.DIGITAL_MARKETING,
        difficulty: 3,
        estimatedTime: 65,
        description: 'Promote your business on social media',
        priority: 9,
        requiredLevel: COMPETENCY_LEVELS.ADVANCED
    },
    {
        id: 'advanced-ecommerce',
        title: 'Advanced E-Commerce',
        category: SKILL_CATEGORIES.E_COMMERCE,
        difficulty: 4,
        estimatedTime: 90,
        description: 'Scale your online business',
        priority: 10,
        requiredLevel: COMPETENCY_LEVELS.EXPERT
    }
];

class OfflineAssessmentEngine {
    constructor() {
        this.currentAssessment = null;
        this.assessmentState = null;
    }

    /**
     * Load assessment questions and cache locally
     * @returns {Object} Assessment with questions
     */
    async loadAssessment() {
        console.log('[OfflineAssessment] Loading assessment questions');

        // Check if assessment is already cached
        const cachedAssessment = await offlineStorageManager.getAssessment();

        if (cachedAssessment && cachedAssessment.questions) {
            console.log('[OfflineAssessment] Using cached assessment');
            this.currentAssessment = cachedAssessment;
            return cachedAssessment;
        }

        // Generate assessment questions (same as SkillsAssessment.js)
        const questions = this.generateAssessmentQuestions();

        const assessment = {
            id: `assessment-${Date.now()}`,
            type: 'initial',
            questions,
            createdAt: new Date().toISOString(),
            version: '1.0'
        };

        // Cache assessment locally
        await offlineStorageManager.saveAssessment(assessment);
        this.currentAssessment = assessment;

        console.log('[OfflineAssessment] Assessment loaded and cached');
        return assessment;
    }

    /**
     * Generate assessment questions
     * @returns {Array} Array of questions
     */
    generateAssessmentQuestions() {
        return [
            // Basic Digital Skills
            {
                id: 1,
                category: SKILL_CATEGORIES.BASIC_DIGITAL,
                question: "How comfortable are you with using a smartphone for calls and messaging?",
                type: "multiple_choice",
                difficulty: 1,
                options: [
                    { text: "Very comfortable - I use it daily", value: 4, correct: true },
                    { text: "Somewhat comfortable - I know the basics", value: 2, correct: false },
                    { text: "Not comfortable - I rarely use these features", value: 0, correct: false }
                ]
            },
            {
                id: 2,
                category: SKILL_CATEGORIES.BASIC_DIGITAL,
                question: "Can you use the internet to search for information?",
                type: "multiple_choice",
                difficulty: 1,
                options: [
                    { text: "Yes, I search online daily", value: 4, correct: true },
                    { text: "Sometimes, but I need help", value: 2, correct: false },
                    { text: "No, I don't know how to search", value: 0, correct: false }
                ]
            },
            {
                id: 3,
                category: SKILL_CATEGORIES.BASIC_DIGITAL,
                question: "Do you know how to create and use email?",
                type: "multiple_choice",
                difficulty: 1,
                options: [
                    { text: "Yes, I have email and use it regularly", value: 4, correct: true },
                    { text: "I have email but don't use it much", value: 2, correct: false },
                    { text: "I don't have an email account", value: 0, correct: false }
                ]
            },
            // Financial Management
            {
                id: 4,
                category: SKILL_CATEGORIES.FINANCIAL_MANAGEMENT,
                question: "How well do you use M-Pesa or other mobile money services?",
                type: "multiple_choice",
                difficulty: 2,
                options: [
                    { text: "Very well - I use it for most transactions", value: 4, correct: true },
                    { text: "Basic use - sending and receiving money", value: 2, correct: false },
                    { text: "I don't use mobile money services", value: 0, correct: false }
                ]
            },
            {
                id: 5,
                category: SKILL_CATEGORIES.FINANCIAL_MANAGEMENT,
                question: "Do you keep track of your business or personal finances?",
                type: "multiple_choice",
                difficulty: 2,
                options: [
                    { text: "Yes, I have a system for tracking money", value: 4, correct: true },
                    { text: "I try to keep track but it's not organized", value: 2, correct: false },
                    { text: "I don't keep financial records", value: 0, correct: false }
                ]
            },
            // Business Automation
            {
                id: 6,
                category: SKILL_CATEGORIES.BUSINESS_AUTOMATION,
                question: "Do you use any apps to help with your business or work?",
                type: "multiple_choice",
                difficulty: 2,
                options: [
                    { text: "Yes, I use several business apps", value: 4, correct: true },
                    { text: "I use one or two simple apps", value: 2, correct: false },
                    { text: "I don't use any business apps", value: 0, correct: false }
                ]
            },
            {
                id: 7,
                category: SKILL_CATEGORIES.BUSINESS_AUTOMATION,
                question: "Can you keep customer information organized?",
                type: "multiple_choice",
                difficulty: 2,
                options: [
                    { text: "Yes, I have a system for customer data", value: 4, correct: true },
                    { text: "I keep basic customer information", value: 2, correct: false },
                    { text: "I don't keep customer records", value: 0, correct: false }
                ]
            },
            // E-commerce
            {
                id: 8,
                category: SKILL_CATEGORIES.E_COMMERCE,
                question: "Have you ever sold anything online?",
                type: "multiple_choice",
                difficulty: 3,
                options: [
                    { text: "Yes, I sell online regularly", value: 4, correct: true },
                    { text: "I've tried selling online a few times", value: 2, correct: false },
                    { text: "I've never sold anything online", value: 0, correct: false }
                ]
            },
            // Digital Marketing
            {
                id: 9,
                category: SKILL_CATEGORIES.DIGITAL_MARKETING,
                question: "Do you use social media to promote your business or skills?",
                type: "multiple_choice",
                difficulty: 3,
                options: [
                    { text: "Yes, I actively use social media for business", value: 4, correct: true },
                    { text: "I use social media but not for business", value: 2, correct: false },
                    { text: "I don't use social media", value: 0, correct: false }
                ]
            },
            // Communication
            {
                id: 10,
                category: SKILL_CATEGORIES.COMMUNICATION,
                question: "How comfortable are you with basic English for business?",
                type: "multiple_choice",
                difficulty: 1,
                options: [
                    { text: "Very comfortable - I can communicate well", value: 4, correct: true },
                    { text: "Somewhat comfortable - I know some English", value: 2, correct: false },
                    { text: "Not comfortable - I prefer local languages", value: 0, correct: false }
                ]
            }
        ];
    }

    /**
     * Submit answer for offline storage
     * @param {number} questionId - Question identifier
     * @param {Object} answer - User's answer
     */
    async submitAnswer(questionId, answer) {
        if (!this.assessmentState) {
            this.assessmentState = {
                responses: [],
                startedAt: new Date().toISOString()
            };
        }

        const response = {
            questionId,
            answer: answer.text,
            value: answer.value,
            correct: answer.correct,
            timestamp: new Date().toISOString()
        };

        this.assessmentState.responses.push(response);

        // Save state to IndexedDB for persistence
        await this.saveAssessmentState();

        console.log('[OfflineAssessment] Answer submitted:', questionId);
    }

    /**
     * Calculate assessment results using client-side algorithm
     * @returns {Object} Assessment results with scores and recommendations
     */
    async calculateResults() {
        if (!this.assessmentState || !this.assessmentState.responses) {
            throw new Error('No assessment responses found');
        }

        console.log('[OfflineAssessment] Calculating results...');

        const responses = this.assessmentState.responses;
        const questions = this.currentAssessment.questions;

        // Group responses by category
        const responsesByCategory = {};
        Object.values(SKILL_CATEGORIES).forEach(category => {
            responsesByCategory[category] = [];
        });

        responses.forEach(response => {
            const question = questions.find(q => q.id === response.questionId);
            if (question) {
                responsesByCategory[question.category].push({
                    ...response,
                    difficulty: question.difficulty
                });
            }
        });

        // Calculate skill levels for each category
        const skillLevels = {};
        Object.entries(responsesByCategory).forEach(([category, categoryResponses]) => {
            if (categoryResponses.length > 0) {
                skillLevels[category] = this.calculateSkillLevel(categoryResponses);
            }
        });

        // Calculate overall score
        const totalScore = responses.reduce((sum, r) => sum + r.value, 0);
        const maxScore = responses.length * 4;
        const overallScore = Math.round((totalScore / maxScore) * 100);

        // Determine overall competency level
        const overallLevel = this.determineOverallLevel(skillLevels);

        // Generate recommendations
        const recommendations = this.generateRecommendations(skillLevels);

        const results = {
            overallScore,
            overallLevel,
            skillLevels,
            recommendations,
            totalQuestions: responses.length,
            correctAnswers: responses.filter(r => r.correct).length,
            completedAt: new Date().toISOString(),
            startedAt: this.assessmentState.startedAt,
            syncStatus: 'pending'
        };

        console.log('[OfflineAssessment] Results calculated:', results);

        // Save results to IndexedDB
        const assessmentRecord = {
            id: this.currentAssessment.id,
            userId: this.getUserId(),
            type: 'initial',
            responses,
            results,
            completedAt: results.completedAt,
            syncStatus: 'pending'
        };

        await offlineStorageManager.saveAssessment(assessmentRecord);

        // Queue for sync when online
        await this.markForSync(assessmentRecord);

        return results;
    }

    /**
     * Calculate skill level for a category
     * @param {Array} responses - Category responses
     * @returns {number} Competency level (1-4)
     */
    calculateSkillLevel(responses) {
        // Calculate weighted score based on difficulty
        let weightedScore = 0;
        let totalWeight = 0;

        responses.forEach(response => {
            const weight = response.difficulty || 1;
            weightedScore += response.value * weight;
            totalWeight += 4 * weight; // Max value is 4
        });

        // Normalize to 0-100 scale
        const normalizedScore = (weightedScore / totalWeight) * 100;

        // Map to competency levels
        if (normalizedScore >= 90) return COMPETENCY_LEVELS.EXPERT;
        if (normalizedScore >= 70) return COMPETENCY_LEVELS.ADVANCED;
        if (normalizedScore >= 50) return COMPETENCY_LEVELS.INTERMEDIATE;
        return COMPETENCY_LEVELS.BEGINNER;
    }

    /**
     * Determine overall competency level
     * @param {Object} skillLevels - Skill levels by category
     * @returns {number} Overall competency level
     */
    determineOverallLevel(skillLevels) {
        const levels = Object.values(skillLevels);
        if (levels.length === 0) return COMPETENCY_LEVELS.BEGINNER;

        // Calculate average level
        const avgLevel = levels.reduce((sum, level) => sum + level, 0) / levels.length;
        return Math.round(avgLevel);
    }

    /**
     * Generate personalized recommendations
     * @param {Object} skillLevels - Skill levels by category
     * @returns {Array} Array of recommendation strings
     */
    generateRecommendations(skillLevels) {
        const recommendations = [];

        Object.entries(skillLevels).forEach(([category, level]) => {
            if (level === COMPETENCY_LEVELS.BEGINNER) {
                recommendations.push(
                    `Focus on building foundational skills in ${this.getCategoryName(category)}`
                );
            } else if (level === COMPETENCY_LEVELS.INTERMEDIATE) {
                recommendations.push(
                    `Continue developing your ${this.getCategoryName(category)} skills with practical exercises`
                );
            } else if (level === COMPETENCY_LEVELS.ADVANCED) {
                recommendations.push(
                    `You're ready for advanced ${this.getCategoryName(category)} topics`
                );
            }
        });

        // Add general recommendations
        if (recommendations.length === 0) {
            recommendations.push('Start with basic digital skills to build a strong foundation');
        }

        return recommendations;
    }

    /**
     * Generate personalized learning path using locally stored course metadata
     * @param {Object} results - Assessment results
     * @returns {Array} Ordered array of recommended courses
     */
    async generateLearningPath(results) {
        console.log('[OfflineAssessment] Generating learning path...');

        const skillLevels = results.skillLevels;
        const recommendedCourses = [];

        // Score each course based on user's skill levels
        COURSE_METADATA.forEach(course => {
            const userLevel = skillLevels[course.category] || COMPETENCY_LEVELS.BEGINNER;

            // Calculate relevance score
            let relevanceScore = 0;

            // Prioritize courses slightly above user's current level
            if (course.requiredLevel === userLevel) {
                relevanceScore = 10; // Perfect match
            } else if (course.requiredLevel === userLevel + 1) {
                relevanceScore = 8; // Next level up
            } else if (course.requiredLevel === userLevel - 1) {
                relevanceScore = 5; // Review/reinforcement
            } else if (course.requiredLevel < userLevel) {
                relevanceScore = 2; // Too easy
            } else {
                relevanceScore = 1; // Too advanced
            }

            // Boost priority for weak areas
            if (userLevel === COMPETENCY_LEVELS.BEGINNER) {
                relevanceScore += 3;
            }

            recommendedCourses.push({
                ...course,
                relevanceScore,
                userCurrentLevel: userLevel
            });
        });

        // Sort by relevance score (descending) and priority (ascending)
        recommendedCourses.sort((a, b) => {
            if (b.relevanceScore !== a.relevanceScore) {
                return b.relevanceScore - a.relevanceScore;
            }
            return a.priority - b.priority;
        });

        console.log('[OfflineAssessment] Learning path generated:', recommendedCourses.length, 'courses');

        return recommendedCourses;
    }

    /**
     * Save assessment state for persistence across sessions
     */
    async saveAssessmentState() {
        if (!this.assessmentState) return;

        try {
            localStorage.setItem('assessmentState', JSON.stringify(this.assessmentState));
            console.log('[OfflineAssessment] State saved');
        } catch (error) {
            console.error('[OfflineAssessment] Failed to save state:', error);
        }
    }

    /**
     * Load assessment state from storage
     * @returns {Object|null} Assessment state or null
     */
    async loadAssessmentState() {
        try {
            const stateJson = localStorage.getItem('assessmentState');
            if (stateJson) {
                this.assessmentState = JSON.parse(stateJson);
                console.log('[OfflineAssessment] State loaded');
                return this.assessmentState;
            }
        } catch (error) {
            console.error('[OfflineAssessment] Failed to load state:', error);
        }
        return null;
    }

    /**
     * Clear assessment state
     */
    async clearAssessmentState() {
        this.assessmentState = null;
        localStorage.removeItem('assessmentState');
        console.log('[OfflineAssessment] State cleared');
    }

    /**
     * Mark assessment for sync when connectivity returns
     * @param {Object} assessment - Assessment record to sync
     */
    async markForSync(assessment) {
        await syncQueueManager.enqueue({
            type: 'assessment',
            data: {
                assessmentId: assessment.id,
                userId: assessment.userId,
                type: assessment.type,
                responses: assessment.responses,
                results: assessment.results,
                completedAt: assessment.completedAt
            }
        });

        console.log('[OfflineAssessment] Marked for sync');
    }

    /**
     * Get user ID from context or localStorage
     * @returns {string} User ID
     */
    getUserId() {
        // Try to get from localStorage (set during login)
        const userJson = localStorage.getItem('user');
        if (userJson) {
            try {
                const user = JSON.parse(userJson);
                return user._id || user.id || 'offline-user';
            } catch (error) {
                console.error('[OfflineAssessment] Failed to parse user:', error);
            }
        }
        return 'offline-user';
    }

    /**
     * Get category display name
     * @param {string} category - Category key
     * @returns {string} Display name
     */
    getCategoryName(category) {
        const names = {
            [SKILL_CATEGORIES.BASIC_DIGITAL]: 'Basic Digital Skills',
            [SKILL_CATEGORIES.BUSINESS_AUTOMATION]: 'Business Automation',
            [SKILL_CATEGORIES.E_COMMERCE]: 'E-Commerce',
            [SKILL_CATEGORIES.DIGITAL_MARKETING]: 'Digital Marketing',
            [SKILL_CATEGORIES.FINANCIAL_MANAGEMENT]: 'Financial Management',
            [SKILL_CATEGORIES.COMMUNICATION]: 'Communication'
        };
        return names[category] || category;
    }
}

// Export singleton instance
const offlineAssessmentEngine = new OfflineAssessmentEngine();

// Export constants for use in components
export { SKILL_CATEGORIES, COMPETENCY_LEVELS };
export default offlineAssessmentEngine;
