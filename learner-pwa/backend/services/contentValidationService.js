const { ContentValidation } = require('../models/EnhancedContent');

/**
 * Content Validation Service
 * Provides comprehensive validation for enhanced module content
 */

class ContentValidationService {

    /**
     * Validate complete enhanced content structure
     */
    static validateEnhancedContent(enhancedContent) {
        const errors = [];
        const warnings = [];

        // Validate sections
        if (!enhancedContent.sections || enhancedContent.sections.length === 0) {
            errors.push('Enhanced content must have at least one section');
        } else {
            enhancedContent.sections.forEach((section, index) => {
                const sectionValidation = ContentValidation.validateSection(section);
                if (!sectionValidation.isValid) {
                    errors.push(`Section ${index + 1}: ${sectionValidation.errors.join(', ')}`);
                }
            });

            // Check for required section types
            const sectionTypes = enhancedContent.sections.map(s => s.type);
            if (!sectionTypes.includes('introduction')) {
                warnings.push('Consider adding an introduction section');
            }
            if (!sectionTypes.includes('summary')) {
                warnings.push('Consider adding a summary section');
            }
        }

        // Validate practical exercises
        if (!enhancedContent.practicalExercises || enhancedContent.practicalExercises.length < 3) {
            errors.push('Enhanced content should have at least 3 practical exercises');
        } else {
            enhancedContent.practicalExercises.forEach((exercise, index) => {
                const exerciseValidation = ContentValidation.validateExercise(exercise);
                if (!exerciseValidation.isValid) {
                    errors.push(`Exercise ${index + 1}: ${exerciseValidation.errors.join(', ')}`);
                }
            });
        }

        // Validate troubleshooting
        if (!enhancedContent.troubleshooting || enhancedContent.troubleshooting.length === 0) {
            warnings.push('Consider adding troubleshooting guides');
        }

        // Validate Kenyan context
        const kenyanContext = enhancedContent.kenyanContext;
        if (!kenyanContext ||
            (!kenyanContext.localExamples || kenyanContext.localExamples.length === 0) &&
            (!kenyanContext.businessCases || kenyanContext.businessCases.length === 0)) {
            warnings.push('Consider adding Kenyan context examples');
        }

        // Validate career pathways
        const careerPathways = enhancedContent.careerPathways;
        if (!careerPathways ||
            (!careerPathways.jobOpportunities || careerPathways.jobOpportunities.length === 0)) {
            warnings.push('Consider adding career pathway information');
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            score: this.calculateContentScore(enhancedContent, errors, warnings)
        };
    }

    /**
     * Calculate content quality score (0-100)
     */
    static calculateContentScore(enhancedContent, errors = [], warnings = []) {
        let score = 100;

        // Deduct points for errors (major issues)
        score -= errors.length * 15;

        // Deduct points for warnings (minor issues)
        score -= warnings.length * 5;

        // Bonus points for completeness
        if (enhancedContent.sections && enhancedContent.sections.length >= 5) {
            score += 5;
        }

        if (enhancedContent.practicalExercises && enhancedContent.practicalExercises.length >= 5) {
            score += 5;
        }

        if (enhancedContent.troubleshooting && enhancedContent.troubleshooting.length >= 3) {
            score += 5;
        }

        // Bonus for Kenyan context
        const kenyanContext = enhancedContent.kenyanContext;
        if (kenyanContext) {
            if (kenyanContext.localExamples && kenyanContext.localExamples.length > 0) score += 3;
            if (kenyanContext.businessCases && kenyanContext.businessCases.length > 0) score += 3;
            if (kenyanContext.localTools && kenyanContext.localTools.length > 0) score += 2;
        }

        // Bonus for career information
        const careerPathways = enhancedContent.careerPathways;
        if (careerPathways) {
            if (careerPathways.jobOpportunities && careerPathways.jobOpportunities.length > 0) score += 3;
            if (careerPathways.nextSteps && careerPathways.nextSteps.length > 0) score += 2;
        }

        return Math.max(0, Math.min(100, score));
    }

    /**
     * Validate content accessibility
     */
    static validateAccessibility(enhancedContent) {
        const issues = [];

        // Check for alt text in images
        enhancedContent.sections?.forEach((section, sIndex) => {
            if (section.content && section.content.includes('<img')) {
                if (!section.content.includes('alt=')) {
                    issues.push(`Section ${sIndex + 1}: Images should have alt text for accessibility`);
                }
            }

            // Check interactive elements
            section.interactiveElements?.forEach((element, eIndex) => {
                if (element.type === 'quiz') {
                    element.data.questions?.forEach((question, qIndex) => {
                        if (!question.explanation) {
                            issues.push(`Section ${sIndex + 1}, Quiz ${eIndex + 1}, Question ${qIndex + 1}: Consider adding explanation for accessibility`);
                        }
                    });
                }
            });
        });

        return {
            isAccessible: issues.length === 0,
            issues
        };
    }

    /**
     * Validate content for mobile compatibility
     */
    static validateMobileCompatibility(enhancedContent) {
        const issues = [];

        // Check for mobile-friendly tools
        enhancedContent.practicalExercises?.forEach((exercise, index) => {
            const hasMobileTools = exercise.tools?.some(tool =>
                tool.type === 'mobile' || tool.type === 'web'
            );

            if (!hasMobileTools) {
                issues.push(`Exercise ${index + 1}: Consider adding mobile-friendly tool alternatives`);
            }
        });

        // Check for large file sizes
        enhancedContent.sections?.forEach((section, sIndex) => {
            section.resources?.forEach((resource, rIndex) => {
                if (resource.size && resource.size > 10) { // > 10MB
                    issues.push(`Section ${sIndex + 1}, Resource ${rIndex + 1}: Large file size (${resource.size}MB) may not be mobile-friendly`);
                }
            });
        });

        return {
            isMobileFriendly: issues.length === 0,
            issues
        };
    }

    /**
     * Validate Kenyan context relevance
     */
    static validateKenyanRelevance(enhancedContent) {
        const issues = [];
        let relevanceScore = 0;

        const kenyanContext = enhancedContent.kenyanContext;
        if (!kenyanContext) {
            issues.push('No Kenyan context information provided');
            return { isRelevant: false, issues, score: 0 };
        }

        // Check local examples
        if (kenyanContext.localExamples && kenyanContext.localExamples.length > 0) {
            relevanceScore += 25;
        } else {
            issues.push('No local Kenyan examples provided');
        }

        // Check business cases
        if (kenyanContext.businessCases && kenyanContext.businessCases.length > 0) {
            relevanceScore += 25;
        } else {
            issues.push('No Kenyan business cases provided');
        }

        // Check local tools
        if (kenyanContext.localTools && kenyanContext.localTools.length > 0) {
            relevanceScore += 25;
        } else {
            issues.push('No local tools information provided');
        }

        // Check regulations
        if (kenyanContext.regulations && kenyanContext.regulations.length > 0) {
            relevanceScore += 25;
        } else {
            issues.push('No relevant Kenyan regulations mentioned');
        }

        // Check exercises for Kenyan context
        enhancedContent.practicalExercises?.forEach((exercise, index) => {
            if (!exercise.kenyanContext || !exercise.kenyanContext.businessScenario) {
                issues.push(`Exercise ${index + 1}: Missing Kenyan business context`);
            }
        });

        return {
            isRelevant: relevanceScore >= 50,
            issues,
            score: relevanceScore
        };
    }

    /**
     * Generate comprehensive content report
     */
    static generateContentReport(enhancedContent) {
        const validation = this.validateEnhancedContent(enhancedContent);
        const accessibility = this.validateAccessibility(enhancedContent);
        const mobileCompatibility = this.validateMobileCompatibility(enhancedContent);
        const kenyanRelevance = this.validateKenyanRelevance(enhancedContent);

        return {
            overall: {
                isValid: validation.isValid,
                score: validation.score,
                grade: this.getGrade(validation.score)
            },
            validation,
            accessibility,
            mobileCompatibility,
            kenyanRelevance,
            recommendations: this.generateRecommendations(validation, accessibility, mobileCompatibility, kenyanRelevance),
            timestamp: new Date()
        };
    }

    /**
     * Get letter grade based on score
     */
    static getGrade(score) {
        if (score >= 90) return 'A';
        if (score >= 80) return 'B';
        if (score >= 70) return 'C';
        if (score >= 60) return 'D';
        return 'F';
    }

    /**
     * Generate improvement recommendations
     */
    static generateRecommendations(validation, accessibility, mobileCompatibility, kenyanRelevance) {
        const recommendations = [];

        // High priority recommendations
        if (validation.errors.length > 0) {
            recommendations.push({
                priority: 'high',
                category: 'content',
                message: 'Fix content validation errors before publishing',
                actions: validation.errors
            });
        }

        if (!accessibility.isAccessible) {
            recommendations.push({
                priority: 'high',
                category: 'accessibility',
                message: 'Improve content accessibility',
                actions: accessibility.issues
            });
        }

        // Medium priority recommendations
        if (!mobileCompatibility.isMobileFriendly) {
            recommendations.push({
                priority: 'medium',
                category: 'mobile',
                message: 'Optimize content for mobile devices',
                actions: mobileCompatibility.issues
            });
        }

        if (kenyanRelevance.score < 75) {
            recommendations.push({
                priority: 'medium',
                category: 'localization',
                message: 'Enhance Kenyan context and relevance',
                actions: kenyanRelevance.issues
            });
        }

        // Low priority recommendations
        if (validation.warnings.length > 0) {
            recommendations.push({
                priority: 'low',
                category: 'enhancement',
                message: 'Consider these content improvements',
                actions: validation.warnings
            });
        }

        return recommendations;
    }
}

module.exports = ContentValidationService;