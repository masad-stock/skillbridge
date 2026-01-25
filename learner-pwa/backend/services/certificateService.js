const Certificate = require('../models/Certificate');
const User = require('../models/User');
const Module = require('../models/Module');
const Progress = require('../models/Progress');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const emailQueueService = require('./emailQueueService');

class CertificateService {
    /**
     * Generate certificate for user upon module completion
     */
    async generateCertificate(userId, moduleId) {
        try {
            // Check if certificate already exists
            const existing = await Certificate.findOne({ user: userId, module: moduleId });
            if (existing) {
                return { success: false, message: 'Certificate already issued', certificate: existing };
            }

            // Get user and module details
            const user = await User.findById(userId);
            const module = await Module.findById(moduleId);

            if (!user || !module) {
                throw new Error('User or Module not found');
            }

            // Get progress data
            const progress = await Progress.findOne({ user: userId, module: moduleId });
            if (!progress || progress.status !== 'completed') {
                throw new Error('Module not completed');
            }

            // Calculate score and metadata
            const score = progress.score || 0;
            const metadata = {
                duration: progress.timeSpent || 0,
                assessmentsPassed: progress.assessmentsPassed || 0,
                modulesCompleted: 1
            };

            // Generate certificate number
            const count = await Certificate.countDocuments();
            const year = new Date().getFullYear();
            const certificateNumber = `SB-${year}-${String(count + 1).padStart(6, '0')}`;

            // Generate verification code
            const verificationCode = require('crypto')
                .randomBytes(16)
                .toString('hex')
                .toUpperCase();

            // Calculate grade
            let grade;
            if (score >= 95) grade = 'A+';
            else if (score >= 90) grade = 'A';
            else if (score >= 85) grade = 'B+';
            else if (score >= 80) grade = 'B';
            else if (score >= 75) grade = 'C+';
            else if (score >= 70) grade = 'C';
            else if (score >= 60) grade = 'D';
            else grade = 'F';

            // Create certificate
            const certificate = await Certificate.create({
                user: userId,
                module: moduleId,
                certificateNumber,
                completionDate: progress.completedAt || new Date(),
                score,
                grade,
                skills: progress.skillsAcquired || [],
                verificationCode,
                metadata
            });

            // Populate references
            await certificate.populate('user', 'profile email');
            await certificate.populate('module', 'title category description');

            return { success: true, certificate };
        } catch (error) {
            throw new Error(`Certificate generation failed: ${error.message}`);
        }
    }

    /**
     * Generate PDF certificate
     */
    async generatePDF(certificateId) {
        try {
            const certificate = await Certificate.findById(certificateId)
                .populate('user', 'profile email')
                .populate('module', 'title category description');

            if (!certificate) {
                throw new Error('Certificate not found');
            }

            // Create PDF directory if it doesn't exist
            const pdfDir = path.join(__dirname, '../../public/certificates');
            if (!fs.existsSync(pdfDir)) {
                fs.mkdirSync(pdfDir, { recursive: true });
            }

            const pdfPath = path.join(pdfDir, `${certificate.certificateNumber}.pdf`);

            // Create PDF
            const doc = new PDFDocument({
                size: 'A4',
                layout: 'landscape',
                margins: { top: 50, bottom: 50, left: 50, right: 50 }
            });

            const stream = fs.createWriteStream(pdfPath);
            doc.pipe(stream);

            // Certificate design
            this._drawCertificateDesign(doc, certificate);

            doc.end();

            // Wait for PDF to be written
            await new Promise((resolve, reject) => {
                stream.on('finish', resolve);
                stream.on('error', reject);
            });

            // Update certificate with PDF URL
            certificate.pdfUrl = `/certificates/${certificate.certificateNumber}.pdf`;
            await certificate.save();

            // Queue certificate email
            try {
                await emailQueueService.queueCertificateEmail(
                    certificate.user,
                    certificate,
                    certificate.module
                );
            } catch (emailError) {
                // Log but don't fail if email fails
                console.error('Failed to queue certificate email:', emailError);
            }

            return { success: true, pdfUrl: certificate.pdfUrl };
        } catch (error) {
            throw new Error(`PDF generation failed: ${error.message}`);
        }
    }

    /**
     * Draw certificate design
     */
    _drawCertificateDesign(doc, certificate) {
        const { user, module } = certificate;
        const userName = `${user.profile.firstName} ${user.profile.lastName}`;

        // Border
        doc.rect(30, 30, doc.page.width - 60, doc.page.height - 60)
            .lineWidth(3)
            .strokeColor('#2C3E50')
            .stroke();

        doc.rect(40, 40, doc.page.width - 80, doc.page.height - 80)
            .lineWidth(1)
            .strokeColor('#3498DB')
            .stroke();

        // Header
        doc.fontSize(40)
            .fillColor('#2C3E50')
            .font('Helvetica-Bold')
            .text('CERTIFICATE OF COMPLETION', 0, 100, { align: 'center' });

        // Decorative line
        doc.moveTo(200, 160)
            .lineTo(doc.page.width - 200, 160)
            .lineWidth(2)
            .strokeColor('#3498DB')
            .stroke();

        // Body text
        doc.fontSize(16)
            .fillColor('#34495E')
            .font('Helvetica')
            .text('This is to certify that', 0, 200, { align: 'center' });

        // User name
        doc.fontSize(32)
            .fillColor('#2C3E50')
            .font('Helvetica-Bold')
            .text(userName, 0, 240, { align: 'center' });

        // Achievement text
        doc.fontSize(16)
            .fillColor('#34495E')
            .font('Helvetica')
            .text('has successfully completed the', 0, 290, { align: 'center' });

        // Module title
        doc.fontSize(24)
            .fillColor('#3498DB')
            .font('Helvetica-Bold')
            .text(module.title, 0, 320, { align: 'center', width: doc.page.width });

        // Category
        doc.fontSize(14)
            .fillColor('#7F8C8D')
            .font('Helvetica')
            .text(`Category: ${module.category}`, 0, 360, { align: 'center' });

        // Score and grade
        doc.fontSize(16)
            .fillColor('#27AE60')
            .font('Helvetica-Bold')
            .text(`Score: ${certificate.score}% | Grade: ${certificate.grade}`, 0, 390, { align: 'center' });

        // Date
        const dateStr = new Date(certificate.issueDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        doc.fontSize(12)
            .fillColor('#34495E')
            .font('Helvetica')
            .text(`Issued on: ${dateStr}`, 0, 430, { align: 'center' });

        // Certificate number and verification
        doc.fontSize(10)
            .fillColor('#7F8C8D')
            .text(`Certificate No: ${certificate.certificateNumber}`, 100, doc.page.height - 100);

        doc.text(`Verification Code: ${certificate.verificationCode}`, 100, doc.page.height - 85);

        // Signature line
        doc.moveTo(doc.page.width - 300, doc.page.height - 120)
            .lineTo(doc.page.width - 100, doc.page.height - 120)
            .lineWidth(1)
            .strokeColor('#2C3E50')
            .stroke();

        doc.fontSize(12)
            .fillColor('#2C3E50')
            .font('Helvetica-Bold')
            .text('Authorized Signature', doc.page.width - 300, doc.page.height - 100, {
                width: 200,
                align: 'center'
            });

        // Footer
        doc.fontSize(10)
            .fillColor('#95A5A6')
            .font('Helvetica')
            .text('SkillBridge - Empowering Digital Skills for Economic Growth', 0, doc.page.height - 50, {
                align: 'center'
            });

        // Verify URL
        doc.fontSize(9)
            .fillColor('#3498DB')
            .text(`Verify at: skillbridge.com/verify/${certificate.verificationCode}`, 0, doc.page.height - 35, {
                align: 'center',
                link: `https://skillbridge.com/verify/${certificate.verificationCode}`
            });
    }

    /**
     * Get user certificates
     */
    async getUserCertificates(userId) {
        try {
            const certificates = await Certificate.find({ user: userId, status: 'issued' })
                .populate('module', 'title category')
                .sort({ issueDate: -1 });

            return { success: true, certificates };
        } catch (error) {
            throw new Error(`Failed to fetch certificates: ${error.message}`);
        }
    }

    /**
     * Verify certificate
     */
    async verifyCertificate(verificationCode) {
        try {
            const certificate = await Certificate.findOne({ verificationCode })
                .populate('user', 'profile email')
                .populate('module', 'title category');

            if (!certificate) {
                return { success: false, message: 'Certificate not found' };
            }

            if (certificate.status !== 'issued') {
                return { success: false, message: `Certificate is ${certificate.status}` };
            }

            return { success: true, certificate };
        } catch (error) {
            throw new Error(`Verification failed: ${error.message}`);
        }
    }

    /**
     * Get certificate by number
     */
    async getCertificateByNumber(certificateNumber) {
        try {
            const certificate = await Certificate.findOne({ certificateNumber })
                .populate('user', 'profile email')
                .populate('module', 'title category description');

            if (!certificate) {
                return { success: false, message: 'Certificate not found' };
            }

            return { success: true, certificate };
        } catch (error) {
            throw new Error(`Failed to fetch certificate: ${error.message}`);
        }
    }

    /**
     * Revoke certificate
     */
    async revokeCertificate(certificateId, reason) {
        try {
            const certificate = await Certificate.findById(certificateId);

            if (!certificate) {
                throw new Error('Certificate not found');
            }

            certificate.status = 'revoked';
            certificate.metadata.revocationReason = reason;
            certificate.metadata.revokedAt = new Date();

            await certificate.save();

            return { success: true, message: 'Certificate revoked successfully' };
        } catch (error) {
            throw new Error(`Revocation failed: ${error.message}`);
        }
    }

    /**
     * Get certificate statistics
     */
    async getCertificateStats() {
        try {
            const total = await Certificate.countDocuments();
            const issued = await Certificate.countDocuments({ status: 'issued' });
            const revoked = await Certificate.countDocuments({ status: 'revoked' });

            const byGrade = await Certificate.aggregate([
                { $match: { status: 'issued' } },
                { $group: { _id: '$grade', count: { $sum: 1 } } },
                { $sort: { _id: 1 } }
            ]);

            const byModule = await Certificate.aggregate([
                { $match: { status: 'issued' } },
                { $group: { _id: '$module', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 10 },
                {
                    $lookup: {
                        from: 'modules',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'moduleInfo'
                    }
                }
            ]);

            return {
                success: true,
                stats: {
                    total,
                    issued,
                    revoked,
                    byGrade,
                    byModule
                }
            };
        } catch (error) {
            throw new Error(`Failed to fetch stats: ${error.message}`);
        }
    }
}

module.exports = new CertificateService();
