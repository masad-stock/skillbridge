/**
 * Data Export Service
 * Generates publication-ready research data exports
 */

const ResearchEvent = require('../../models/ResearchEvent');
const User = require('../../models/User');
const Consent = require('../../models/Consent');
const Experiment = require('../../models/Experiment');
const EconomicSurvey = require('../../models/EconomicSurvey');
const Progress = require('../../models/Progress');
const logger = require('../../utils/logger');

class DataExportService {
    /**
     * Export research events
     * @param {Object} options - Export options
     */
    async exportEvents(options = {}) {
        const { startDate, endDate, eventTypes, anonymize = true } = options;

        const query = {};

        if (startDate || endDate) {
            query.timestamp = {};
            if (startDate) query.timestamp.$gte = new Date(startDate);
            if (endDate) query.timestamp.$lte = new Date(endDate);
        }

        if (eventTypes && eventTypes.length > 0) {
            query.eventType = { $in: eventTypes };
        }

        const events = await ResearchEvent.find(query).lean();

        if (anonymize) {
            return events.map(e => this.anonymizeEvent(e));
        }

        return events;
    }

    /**
     * Export user data
     * @param {Object} options - Export options
     */
    async exportUsers(options = {}) {
        const { anonymize = true, includeInactive = false } = options;

        const query = includeInactive ? {} : { isActive: true };
        const users = await User.find(query)
            .select('-password -resetPasswordToken -resetPasswordExpires')
            .lean();

        if (anonymize) {
            return users.map(u => this.anonymizeUser(u));
        }

        return users;
    }

    /**
     * Export experiment data
     * @param {string} experimentId - Optional specific experiment
     */
    async exportExperiments(experimentId = null) {
        const query = experimentId ? { _id: experimentId } : {};
        const experiments = await Experiment.find(query).lean();

        return experiments.map(exp => ({
            ...exp,
            assignments: exp.assignments.map(a => ({
                participantId: this.hashId(a.userId.toString()),
                group: a.group,
                assignedAt: a.assignedAt
            }))
        }));
    }

    /**
     * Export economic survey data
     * @param {Object} options - Export options
     */
    async exportEconomicSurveys(options = {}) {
        const { surveyType, anonymize = true } = options;

        const query = surveyType ? { surveyType } : {};
        const surveys = await EconomicSurvey.find(query).lean();

        if (anonymize) {
            return surveys.map(s => this.anonymizeSurvey(s));
        }

        return surveys;
    }

    /**
     * Export learning progress data
     * @param {Object} options - Export options
     */
    async exportProgress(options = {}) {
        const { anonymize = true } = options;

        const progress = await Progress.find({})
            .populate('moduleId', 'title category')
            .lean();

        if (anonymize) {
            return progress.map(p => ({
                participantId: this.hashId(p.userId.toString()),
                moduleId: p.moduleId?._id,
                moduleTitle: p.moduleId?.title,
                moduleCategory: p.moduleId?.category,
                progress: p.progress,
                completed: p.completed,
                completedAt: p.completedAt,
                timeSpent: p.timeSpent
            }));
        }

        return progress;
    }

    /**
     * Generate comprehensive research dataset
     */
    async generateResearchDataset() {
        const [events, users, experiments, surveys, progress] = await Promise.all([
            this.exportEvents({ anonymize: true }),
            this.exportUsers({ anonymize: true }),
            this.exportExperiments(),
            this.exportEconomicSurveys({ anonymize: true }),
            this.exportProgress({ anonymize: true })
        ]);

        return {
            exportDate: new Date().toISOString(),
            dataVersion: '1.0',
            summary: {
                totalParticipants: users.length,
                totalEvents: events.length,
                totalExperiments: experiments.length,
                totalSurveys: surveys.length,
                totalProgressRecords: progress.length
            },
            data: {
                participants: users,
                events,
                experiments,
                economicSurveys: surveys,
                learningProgress: progress
            },
            dataDictionary: this.generateDataDictionary()
        };
    }

    /**
     * Generate summary statistics
     */
    async generateSummaryStatistics() {
        const [
            eventStats,
            userStats,
            progressStats,
            surveyStats
        ] = await Promise.all([
            this.getEventStatistics(),
            this.getUserStatistics(),
            this.getProgressStatistics(),
            this.getSurveyStatistics()
        ]);

        return {
            generatedAt: new Date().toISOString(),
            events: eventStats,
            users: userStats,
            progress: progressStats,
            surveys: surveyStats
        };
    }

    /**
     * Get event statistics
     */
    async getEventStatistics() {
        const stats = await ResearchEvent.aggregate([
            {
                $group: {
                    _id: '$eventType',
                    count: { $sum: 1 },
                    uniqueUsers: { $addToSet: '$userId' }
                }
            },
            {
                $project: {
                    eventType: '$_id',
                    count: 1,
                    uniqueUsers: { $size: '$uniqueUsers' }
                }
            }
        ]);

        const totalEvents = await ResearchEvent.countDocuments();
        const dateRange = await ResearchEvent.aggregate([
            {
                $group: {
                    _id: null,
                    minDate: { $min: '$timestamp' },
                    maxDate: { $max: '$timestamp' }
                }
            }
        ]);

        return {
            total: totalEvents,
            byType: stats,
            dateRange: dateRange[0] || { minDate: null, maxDate: null }
        };
    }

    /**
     * Get user statistics
     */
    async getUserStatistics() {
        const total = await User.countDocuments();
        const active = await User.countDocuments({ isActive: true });

        const byRole = await User.aggregate([
            { $group: { _id: '$role', count: { $sum: 1 } } }
        ]);

        const withConsent = await Consent.countDocuments({ isActive: true });

        return {
            total,
            active,
            inactive: total - active,
            byRole,
            withActiveConsent: withConsent,
            consentRate: total > 0 ? (withConsent / total * 100).toFixed(2) : 0
        };
    }

    /**
     * Get progress statistics
     */
    async getProgressStatistics() {
        const stats = await Progress.aggregate([
            {
                $group: {
                    _id: null,
                    totalRecords: { $sum: 1 },
                    avgProgress: { $avg: '$progress' },
                    completed: { $sum: { $cond: ['$completed', 1, 0] } },
                    avgTimeSpent: { $avg: '$timeSpent' }
                }
            }
        ]);

        const moduleStats = await Progress.aggregate([
            {
                $group: {
                    _id: '$moduleId',
                    enrollments: { $sum: 1 },
                    completions: { $sum: { $cond: ['$completed', 1, 0] } },
                    avgProgress: { $avg: '$progress' }
                }
            },
            {
                $lookup: {
                    from: 'modules',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'module'
                }
            },
            {
                $project: {
                    moduleTitle: { $arrayElemAt: ['$module.title', 0] },
                    enrollments: 1,
                    completions: 1,
                    avgProgress: 1,
                    completionRate: {
                        $multiply: [{ $divide: ['$completions', '$enrollments'] }, 100]
                    }
                }
            }
        ]);

        return {
            overall: stats[0] || {},
            byModule: moduleStats
        };
    }

    /**
     * Get survey statistics
     */
    async getSurveyStatistics() {
        const byType = await EconomicSurvey.aggregate([
            { $group: { _id: '$surveyType', count: { $sum: 1 } } }
        ]);

        const impact = await EconomicSurvey.getAggregateImpact();

        return {
            byType,
            impact
        };
    }

    /**
     * Anonymize event data
     */
    anonymizeEvent(event) {
        return {
            participantId: this.hashId(event.userId?.toString()),
            sessionId: this.hashId(event.sessionId),
            timestamp: event.timestamp,
            eventType: event.eventType,
            eventCategory: event.eventCategory,
            eventData: this.sanitizeEventData(event.eventData),
            context: {
                deviceType: event.context?.deviceType,
                networkType: event.context?.networkType,
                offlineMode: event.context?.offlineMode,
                accessibilityMode: event.context?.accessibilityMode
            },
            experimentData: event.experimentData
        };
    }

    /**
     * Anonymize user data
     */
    anonymizeUser(user) {
        return {
            participantId: this.hashId(user._id.toString()),
            createdAt: user.createdAt,
            role: user.role,
            ageRange: this.getAgeRange(user.dateOfBirth),
            gender: user.gender,
            location: this.generalizeLocation(user.location),
            educationLevel: user.educationLevel,
            accessibilityPreferences: user.accessibilityPreferences,
            researchParticipant: {
                experimentGroup: user.researchParticipant?.experimentGroup,
                enrolledAt: user.researchParticipant?.enrolledAt
            }
        };
    }

    /**
     * Anonymize survey data
     */
    anonymizeSurvey(survey) {
        return {
            participantId: this.hashId(survey.userId?.toString()),
            surveyType: survey.surveyType,
            employment: survey.employment,
            income: {
                range: survey.income?.range,
                currency: survey.income?.currency
            },
            business: {
                hasBusiness: survey.business?.hasBusiness,
                type: survey.business?.type,
                monthlyRevenue: survey.business?.monthlyRevenue,
                employeesCount: survey.business?.employeesCount
            },
            digitalSkillsApplication: survey.digitalSkillsApplication,
            platformImpact: survey.platformImpact,
            completedAt: survey.completedAt
        };
    }

    /**
     * Hash ID for anonymization
     */
    hashId(id) {
        if (!id) return null;
        const crypto = require('crypto');
        return crypto.createHash('sha256').update(id + process.env.ANONYMIZATION_SALT || 'research').digest('hex').substring(0, 16);
    }

    /**
     * Sanitize event data (remove PII)
     */
    sanitizeEventData(data) {
        if (!data) return {};

        const sanitized = { ...data };

        // Remove potential PII fields
        delete sanitized.email;
        delete sanitized.name;
        delete sanitized.phone;
        delete sanitized.address;

        return sanitized;
    }

    /**
     * Get age range from date of birth
     */
    getAgeRange(dateOfBirth) {
        if (!dateOfBirth) return 'unknown';

        const age = Math.floor((Date.now() - new Date(dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000));

        if (age < 18) return 'under_18';
        if (age <= 24) return '18-24';
        if (age <= 34) return '25-34';
        if (age <= 44) return '35-44';
        if (age <= 54) return '45-54';
        return '55+';
    }

    /**
     * Generalize location for k-anonymity
     */
    generalizeLocation(location) {
        // Return only constituency level, not specific area
        if (!location) return 'unknown';
        return 'Kiharu Constituency';
    }

    /**
     * Generate data dictionary
     */
    generateDataDictionary() {
        return {
            participants: {
                participantId: 'Anonymized unique identifier',
                createdAt: 'Account creation date',
                role: 'User role (learner/admin)',
                ageRange: 'Age range category',
                gender: 'Gender',
                location: 'Generalized location',
                educationLevel: 'Highest education level',
                experimentGroup: 'Assigned experiment group'
            },
            events: {
                participantId: 'Anonymized user identifier',
                sessionId: 'Anonymized session identifier',
                timestamp: 'Event timestamp (ISO 8601)',
                eventType: 'Type of event (page_view, module_start, etc.)',
                eventCategory: 'Event category (learning, assessment, etc.)',
                eventData: 'Event-specific data',
                context: 'Device and environment context'
            },
            economicSurveys: {
                participantId: 'Anonymized user identifier',
                surveyType: 'Survey type (baseline, followup_3m, etc.)',
                employment: 'Employment status and details',
                income: 'Income range (KES)',
                business: 'Business ownership details',
                digitalSkillsApplication: 'Digital skills usage',
                platformImpact: 'Self-reported platform impact'
            }
        };
    }

    /**
     * Convert data to CSV format
     */
    toCSV(data, headers) {
        if (!data || data.length === 0) return '';

        const keys = headers || Object.keys(data[0]);
        const csvRows = [keys.join(',')];

        for (const row of data) {
            const values = keys.map(key => {
                const val = row[key];
                if (val === null || val === undefined) return '';
                if (typeof val === 'object') return JSON.stringify(val).replace(/,/g, ';');
                return String(val).replace(/,/g, ';');
            });
            csvRows.push(values.join(','));
        }

        return csvRows.join('\n');
    }
}

module.exports = new DataExportService();
