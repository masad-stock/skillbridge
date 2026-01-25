const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
const handlebars = require('handlebars');
const logger = require('../utils/logger');

class EmailService {
    constructor() {
        this.transporter = null;
        this.initializeTransporter();
    }

    /**
     * Initialize email transporter
     */
    initializeTransporter() {
        const emailConfig = {
            host: process.env.EMAIL_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.EMAIL_PORT) || 587,
            secure: process.env.EMAIL_SECURE === 'true',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        };

        // For development, use ethereal email
        if (process.env.NODE_ENV === 'development' && !process.env.EMAIL_USER) {
            logger.info('Using development email mode (logs only)');
            this.transporter = {
                sendMail: async (mailOptions) => {
                    logger.info('📧 Email would be sent:', {
                        to: mailOptions.to,
                        subject: mailOptions.subject
                    });
                    return { messageId: 'dev-' + Date.now() };
                }
            };
        } else {
            this.transporter = nodemailer.createTransport(emailConfig);

            // Verify connection
            this.transporter.verify((error) => {
                if (error) {
                    logger.error('Email service error:', error);
                } else {
                    logger.info('Email service ready');
                }
            });
        }
    }

    /**
     * Load and compile email template
     */
    loadTemplate(templateName, data) {
        try {
            const templatePath = path.join(__dirname, '../templates/emails', `${templateName}.html`);
            const templateContent = fs.readFileSync(templatePath, 'utf8');
            const template = handlebars.compile(templateContent);
            return template(data);
        } catch (error) {
            logger.error(`Failed to load template ${templateName}:`, error);
            return null;
        }
    }

    /**
     * Send email
     */
    async sendEmail(to, subject, html, text = null) {
        try {
            const mailOptions = {
                from: `"${process.env.EMAIL_FROM_NAME || 'SkillBridge'}" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
                to,
                subject,
                html,
                text: text || html.replace(/<[^>]*>/g, '') // Strip HTML for text version
            };

            const info = await this.transporter.sendMail(mailOptions);
            logger.info(`Email sent: ${info.messageId}`);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            logger.error('Failed to send email:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Send welcome email
     */
    async sendWelcomeEmail(user) {
        const html = this.loadTemplate('welcome', {
            firstName: user.profile.firstName,
            email: user.email,
            dashboardUrl: `${process.env.FRONTEND_URL}/dashboard`,
            assessmentUrl: `${process.env.FRONTEND_URL}/assessment`,
            learningUrl: `${process.env.FRONTEND_URL}/learning`,
            year: new Date().getFullYear()
        });

        if (!html) return { success: false, error: 'Template not found' };

        return await this.sendEmail(
            user.email,
            'Welcome to SkillBridge - Start Your Learning Journey! 🎓',
            html
        );
    }

    /**
     * Send assessment completion email
     */
    async sendAssessmentCompletionEmail(user, assessment) {
        const html = this.loadTemplate('assessment-completion', {
            firstName: user.profile.firstName,
            assessmentTitle: assessment.title || 'Skills Assessment',
            score: assessment.score,
            level: assessment.level,
            recommendations: assessment.recommendations || [],
            dashboardUrl: `${process.env.FRONTEND_URL}/dashboard`,
            learningUrl: `${process.env.FRONTEND_URL}/learning`,
            year: new Date().getFullYear()
        });

        if (!html) return { success: false, error: 'Template not found' };

        return await this.sendEmail(
            user.email,
            `Assessment Complete - Your Score: ${assessment.score}% 📊`,
            html
        );
    }

    /**
     * Send module completion email
     */
    async sendModuleCompletionEmail(user, module, progress) {
        const html = this.loadTemplate('module-completion', {
            firstName: user.profile.firstName,
            moduleTitle: module.title,
            category: module.category,
            score: progress.score,
            timeSpent: Math.round(progress.timeSpent / 60), // Convert to hours
            certificateUrl: `${process.env.FRONTEND_URL}/certificates`,
            nextModulesUrl: `${process.env.FRONTEND_URL}/learning`,
            year: new Date().getFullYear()
        });

        if (!html) return { success: false, error: 'Template not found' };

        return await this.sendEmail(
            user.email,
            `🎉 Congratulations! You completed ${module.title}`,
            html
        );
    }

    /**
     * Send certificate issued email
     */
    async sendCertificateEmail(user, certificate, module) {
        const html = this.loadTemplate('certificate-issued', {
            firstName: user.profile.firstName,
            moduleTitle: module.title,
            certificateNumber: certificate.certificateNumber,
            grade: certificate.grade,
            score: certificate.score,
            issueDate: new Date(certificate.issueDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }),
            certificateUrl: `${process.env.FRONTEND_URL}/certificates`,
            downloadUrl: `${process.env.API_URL}/api/v1/certificates/${certificate.certificateNumber}/download`,
            verifyUrl: `${process.env.FRONTEND_URL}/verify/${certificate.verificationCode}`,
            year: new Date().getFullYear()
        });

        if (!html) return { success: false, error: 'Template not found' };

        return await this.sendEmail(
            user.email,
            `🏆 Your Certificate is Ready - ${module.title}`,
            html
        );
    }

    /**
     * Send password reset email
     */
    async sendPasswordResetEmail(user, resetToken) {
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

        const html = this.loadTemplate('password-reset', {
            firstName: user.profile.firstName,
            resetUrl,
            expiryHours: 1,
            year: new Date().getFullYear()
        });

        if (!html) return { success: false, error: 'Template not found' };

        return await this.sendEmail(
            user.email,
            'Reset Your Password - SkillBridge 🔐',
            html
        );
    }

    /**
     * Send weekly progress report
     */
    async sendWeeklyProgressEmail(user, stats) {
        const html = this.loadTemplate('weekly-progress', {
            firstName: user.profile.firstName,
            modulesCompleted: stats.modulesCompleted || 0,
            assessmentsTaken: stats.assessmentsTaken || 0,
            hoursSpent: stats.hoursSpent || 0,
            certificatesEarned: stats.certificatesEarned || 0,
            currentStreak: stats.currentStreak || 0,
            topSkills: stats.topSkills || [],
            upcomingModules: stats.upcomingModules || [],
            dashboardUrl: `${process.env.FRONTEND_URL}/dashboard`,
            year: new Date().getFullYear()
        });

        if (!html) return { success: false, error: 'Template not found' };

        return await this.sendEmail(
            user.email,
            '📈 Your Weekly Learning Progress Report',
            html
        );
    }

    /**
     * Send account verification email
     */
    async sendVerificationEmail(user, verificationToken) {
        const verifyUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;

        const html = this.loadTemplate('email-verification', {
            firstName: user.profile.firstName,
            verifyUrl,
            year: new Date().getFullYear()
        });

        if (!html) return { success: false, error: 'Template not found' };

        return await this.sendEmail(
            user.email,
            'Verify Your Email - SkillBridge ✉️',
            html
        );
    }

    /**
     * Send admin notification
     */
    async sendAdminNotification(subject, message, data = {}) {
        const adminEmail = process.env.ADMIN_EMAIL;
        if (!adminEmail) {
            logger.warn('Admin email not configured');
            return { success: false, error: 'Admin email not configured' };
        }

        const html = `
      <h2>${subject}</h2>
      <p>${message}</p>
      ${data ? `<pre>${JSON.stringify(data, null, 2)}</pre>` : ''}
    `;

        return await this.sendEmail(adminEmail, subject, html);
    }

    /**
     * Send bulk emails (with rate limiting)
     */
    async sendBulkEmails(recipients, subject, htmlTemplate, dataMapper) {
        const results = [];
        const delay = 1000; // 1 second between emails

        for (const recipient of recipients) {
            const data = dataMapper ? dataMapper(recipient) : {};
            const html = typeof htmlTemplate === 'function'
                ? htmlTemplate(data)
                : htmlTemplate;

            const result = await this.sendEmail(recipient.email, subject, html);
            results.push({ email: recipient.email, ...result });

            // Rate limiting delay
            if (recipients.indexOf(recipient) < recipients.length - 1) {
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }

        return results;
    }
}

module.exports = new EmailService();
