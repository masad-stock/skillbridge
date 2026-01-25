/**
 * Offline Certificate Generator
 * Generates PDF certificates entirely offline using jsPDF
 * 
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6
 */

import { jsPDF } from 'jspdf';
import offlineStorageManager from './OfflineStorageManager';
import syncQueueManager from './SyncQueueManager';

class OfflineCertificateGenerator {
    constructor() {
        this.certificates = [];
    }

    /**
     * Generate a certificate PDF offline
     * @param {Object} certificateData - Certificate information
     * @returns {Object} Generated certificate with PDF blob
     */
    async generateCertificate(certificateData) {
        console.log('[OfflineCertificate] Generating certificate...');

        const {
            userName,
            courseName,
            completionDate,
            skillsAcquired = [],
            courseId,
            userId
        } = certificateData;

        // Generate unique verification code
        const verificationCode = this.generateVerificationCode();

        // Create PDF document (A4 landscape)
        const doc = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4'
        });

        // Get page dimensions
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        // Draw certificate border
        this.drawBorder(doc, pageWidth, pageHeight);

        // Add SkillBridge branding
        this.addBranding(doc, pageWidth);

        // Add certificate title
        doc.setFontSize(32);
        doc.setFont('helvetica', 'bold');
        doc.text('Certificate of Completion', pageWidth / 2, 50, { align: 'center' });

        // Add "This is to certify that"
        doc.setFontSize(14);
        doc.setFont('helvetica', 'normal');
        doc.text('This is to certify that', pageWidth / 2, 70, { align: 'center' });

        // Add user name
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text(userName, pageWidth / 2, 85, { align: 'center' });

        // Add "has successfully completed"
        doc.setFontSize(14);
        doc.setFont('helvetica', 'normal');
        doc.text('has successfully completed', pageWidth / 2, 100, { align: 'center' });

        // Add course name
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text(courseName, pageWidth / 2, 115, { align: 'center' });

        // Add skills acquired section
        if (skillsAcquired.length > 0) {
            doc.setFontSize(12);
            doc.setFont('helvetica', 'normal');
            doc.text('Skills Acquired:', pageWidth / 2, 130, { align: 'center' });

            doc.setFontSize(10);
            const skillsText = skillsAcquired.slice(0, 5).join(' • ');
            doc.text(skillsText, pageWidth / 2, 138, { align: 'center' });
        }

        // Add completion date
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        const formattedDate = new Date(completionDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        doc.text(`Completed on: ${formattedDate}`, pageWidth / 2, 155, { align: 'center' });

        // Add verification code
        doc.setFontSize(10);
        doc.setFont('helvetica', 'italic');
        doc.text(`Verification Code: ${verificationCode}`, pageWidth / 2, 170, { align: 'center' });

        // Add footer
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text('SkillBridge - Empowering Rural Entrepreneurs', pageWidth / 2, 185, { align: 'center' });
        doc.text('Verify this certificate at: skillbridge.app/verify', pageWidth / 2, 190, { align: 'center' });

        // Generate PDF blob
        const pdfBlob = doc.output('blob');

        // Create certificate record
        const certificate = {
            id: `cert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            userId,
            userName,
            courseId,
            courseName,
            completionDate,
            skillsAcquired,
            verificationCode,
            pdfBlob,
            generatedAt: new Date().toISOString(),
            syncStatus: 'pending',
            verified: false
        };

        // Save certificate locally
        await this.saveCertificate(certificate);

        // Queue for sync
        await this.markForSync(certificate);

        console.log('[OfflineCertificate] Certificate generated:', certificate.id);

        return certificate;
    }

    /**
     * Draw decorative border on certificate
     * @param {jsPDF} doc - PDF document
     * @param {number} width - Page width
     * @param {number} height - Page height
     */
    drawBorder(doc, width, height) {
        // Outer border
        doc.setLineWidth(2);
        doc.setDrawColor(41, 128, 185); // SkillBridge blue
        doc.rect(10, 10, width - 20, height - 20);

        // Inner border
        doc.setLineWidth(0.5);
        doc.setDrawColor(52, 152, 219); // Lighter blue
        doc.rect(15, 15, width - 30, height - 30);
    }

    /**
     * Add SkillBridge branding to certificate
     * @param {jsPDF} doc - PDF document
     * @param {number} width - Page width
     */
    addBranding(doc, width) {
        // Add logo placeholder (text-based for now)
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(41, 128, 185); // SkillBridge blue
        doc.text('SkillBridge', width / 2, 30, { align: 'center' });

        // Reset text color
        doc.setTextColor(0, 0, 0);
    }

    /**
     * Generate unique verification code
     * @returns {string} Verification code
     */
    generateVerificationCode() {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substr(2, 9);
        return `SB-${timestamp}-${random}`.toUpperCase();
    }

    /**
     * Save certificate to local storage
     * @param {Object} certificate - Certificate record
     */
    async saveCertificate(certificate) {
        try {
            // Store in IndexedDB via OfflineStorageManager
            await offlineStorageManager.saveCertificate(certificate);

            // Add to in-memory cache
            this.certificates.push(certificate);

            console.log('[OfflineCertificate] Certificate saved locally');
        } catch (error) {
            console.error('[OfflineCertificate] Failed to save certificate:', error);
            throw error;
        }
    }

    /**
     * Get all certificates for a user
     * @param {string} userId - User ID
     * @returns {Array} Array of certificates
     */
    async getCertificates(userId) {
        try {
            const certificates = await offlineStorageManager.getCertificates(userId);
            console.log('[OfflineCertificate] Retrieved certificates:', certificates.length);
            return certificates;
        } catch (error) {
            console.error('[OfflineCertificate] Failed to get certificates:', error);
            return [];
        }
    }

    /**
     * Get a specific certificate by ID
     * @param {string} certificateId - Certificate ID
     * @returns {Object|null} Certificate or null
     */
    async getCertificate(certificateId) {
        try {
            const certificate = await offlineStorageManager.getCertificate(certificateId);
            return certificate;
        } catch (error) {
            console.error('[OfflineCertificate] Failed to get certificate:', error);
            return null;
        }
    }

    /**
     * Mark certificate for sync when connectivity returns
     * @param {Object} certificate - Certificate record
     */
    async markForSync(certificate) {
        try {
            // Convert blob to base64 for sync
            const pdfBase64 = await this.blobToBase64(certificate.pdfBlob);

            await syncQueueManager.enqueue({
                type: 'certificate',
                priority: 9, // High priority (second only to assessments)
                data: {
                    certificateId: certificate.id,
                    userId: certificate.userId,
                    userName: certificate.userName,
                    courseId: certificate.courseId,
                    courseName: certificate.courseName,
                    completionDate: certificate.completionDate,
                    skillsAcquired: certificate.skillsAcquired,
                    verificationCode: certificate.verificationCode,
                    pdfData: pdfBase64,
                    generatedAt: certificate.generatedAt
                }
            });

            console.log('[OfflineCertificate] Marked for sync');
        } catch (error) {
            console.error('[OfflineCertificate] Failed to mark for sync:', error);
        }
    }

    /**
     * Convert blob to base64 string
     * @param {Blob} blob - Blob to convert
     * @returns {Promise<string>} Base64 string
     */
    blobToBase64(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    /**
     * Download certificate PDF
     * @param {Object} certificate - Certificate record
     */
    downloadCertificate(certificate) {
        try {
            const url = URL.createObjectURL(certificate.pdfBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${certificate.courseName.replace(/\s+/g, '_')}_Certificate.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            console.log('[OfflineCertificate] Certificate downloaded');
        } catch (error) {
            console.error('[OfflineCertificate] Failed to download certificate:', error);
        }
    }

    /**
     * Get user ID from context or localStorage
     * @returns {string} User ID
     */
    getUserId() {
        const userJson = localStorage.getItem('user');
        if (userJson) {
            try {
                const user = JSON.parse(userJson);
                return user._id || user.id || 'offline-user';
            } catch (error) {
                console.error('[OfflineCertificate] Failed to parse user:', error);
            }
        }
        return 'offline-user';
    }
}

// Export singleton instance
const offlineCertificateGenerator = new OfflineCertificateGenerator();
export default offlineCertificateGenerator;
