const Queue = require('bull');
const emailService = require('./emailService');
const logger = require('../utils/logger');

// Create email queue
const emailQueue = new Queue('email', {
    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT) || 6379,
        password: process.env.REDIS_PASSWORD || undefined
    },
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 2000
        },
        removeOnComplete: true,
        removeOnFail: false
    }
});

// Process email jobs
emailQueue.process(async (job) => {
    const { type, data } = job.data;

    logger.info(`Processing email job: ${type}`, { jobId: job.id });

    try {
        let result;

        switch (type) {
            case 'welcome':
                result = await emailService.sendWelcomeEmail(data.user);
                break;

            case 'assessment-completion':
                result = await emailService.sendAssessmentCompletionEmail(
                    data.user,
                    data.assessment
                );
                break;

            case 'module-completion':
                result = await emailService.sendModuleCompletionEmail(
                    data.user,
                    data.module,
                    data.progress
                );
                break;

            case 'certificate-issued':
                result = await emailService.sendCertificateEmail(
                    data.user,
                    data.certificate,
                    data.module
                );
                break;

            case 'password-reset':
                result = await emailService.sendPasswordResetEmail(
                    data.user,
                    data.resetToken
                );
                break;

            case 'weekly-progress':
                result = await emailService.sendWeeklyProgressEmail(
                    data.user,
                    data.stats
                );
                break;

            case 'email-verification':
                result = await emailService.sendVerificationEmail(
                    data.user,
                    data.verificationToken
                );
                break;

            case 'admin-notification':
                result = await emailService.sendAdminNotification(
                    data.subject,
                    data.message,
                    data.data
                );
                break;

            default:
                throw new Error(`Unknown email type: ${type}`);
        }

        if (!result.success) {
            throw new Error(result.error || 'Email sending failed');
        }

        logger.info(`Email job completed: ${type}`, { jobId: job.id });
        return result;
    } catch (error) {
        logger.error(`Email job failed: ${type}`, { jobId: job.id, error: error.message });
        throw error;
    }
});

// Queue event handlers
emailQueue.on('completed', (job, result) => {
    logger.info(`Email job ${job.id} completed successfully`);
});

emailQueue.on('failed', (job, err) => {
    logger.error(`Email job ${job.id} failed:`, err.message);
});

emailQueue.on('stalled', (job) => {
    logger.warn(`Email job ${job.id} stalled`);
});

// Helper functions to add jobs to queue
class EmailQueueService {
    /**
     * Add email to queue
     */
    async queueEmail(type, data, options = {}) {
        try {
            const job = await emailQueue.add(
                { type, data },
                {
                    priority: options.priority || 10,
                    delay: options.delay || 0,
                    ...options
                }
            );

            logger.info(`Email queued: ${type}`, { jobId: job.id });
            return { success: true, jobId: job.id };
        } catch (error) {
            logger.error(`Failed to queue email: ${type}`, error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Queue welcome email
     */
    async queueWelcomeEmail(user) {
        return this.queueEmail('welcome', { user }, { priority: 5 });
    }

    /**
     * Queue assessment completion email
     */
    async queueAssessmentCompletionEmail(user, assessment) {
        return this.queueEmail('assessment-completion', { user, assessment });
    }

    /**
     * Queue module completion email
     */
    async queueModuleCompletionEmail(user, module, progress) {
        return this.queueEmail('module-completion', { user, module, progress });
    }

    /**
     * Queue certificate email
     */
    async queueCertificateEmail(user, certificate, module) {
        return this.queueEmail('certificate-issued', { user, certificate, module }, { priority: 5 });
    }

    /**
     * Queue password reset email
     */
    async queuePasswordResetEmail(user, resetToken) {
        return this.queueEmail('password-reset', { user, resetToken }, { priority: 1 });
    }

    /**
     * Queue weekly progress email
     */
    async queueWeeklyProgressEmail(user, stats) {
        return this.queueEmail('weekly-progress', { user, stats }, { priority: 15 });
    }

    /**
     * Queue email verification
     */
    async queueVerificationEmail(user, verificationToken) {
        return this.queueEmail('email-verification', { user, verificationToken }, { priority: 3 });
    }

    /**
     * Queue admin notification
     */
    async queueAdminNotification(subject, message, data) {
        return this.queueEmail('admin-notification', { subject, message, data }, { priority: 8 });
    }

    /**
     * Get queue stats
     */
    async getQueueStats() {
        const [waiting, active, completed, failed, delayed] = await Promise.all([
            emailQueue.getWaitingCount(),
            emailQueue.getActiveCount(),
            emailQueue.getCompletedCount(),
            emailQueue.getFailedCount(),
            emailQueue.getDelayedCount()
        ]);

        return {
            waiting,
            active,
            completed,
            failed,
            delayed,
            total: waiting + active + completed + failed + delayed
        };
    }

    /**
     * Get failed jobs
     */
    async getFailedJobs(limit = 10) {
        return await emailQueue.getFailed(0, limit);
    }

    /**
     * Retry failed job
     */
    async retryFailedJob(jobId) {
        const job = await emailQueue.getJob(jobId);
        if (job) {
            await job.retry();
            return { success: true };
        }
        return { success: false, error: 'Job not found' };
    }

    /**
     * Clean old jobs
     */
    async cleanOldJobs(grace = 24 * 60 * 60 * 1000) {
        await emailQueue.clean(grace, 'completed');
        await emailQueue.clean(grace * 7, 'failed'); // Keep failed jobs for 7 days
        return { success: true };
    }

    /**
     * Pause queue
     */
    async pauseQueue() {
        await emailQueue.pause();
        return { success: true };
    }

    /**
     * Resume queue
     */
    async resumeQueue() {
        await emailQueue.resume();
        return { success: true };
    }
}

module.exports = new EmailQueueService();
