const certificateController = require('../../controllers/certificateController');
const certificateService = require('../../services/certificateService');
const path = require('path');

// Mock services
jest.mock('../../services/certificateService');

describe('Certificate Controller', () => {
    let mockReq, mockRes;

    beforeEach(() => {
        mockReq = {
            params: {},
            body: {},
            user: { id: 'user123' }
        };
        mockRes = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis(),
            download: jest.fn()
        };
        jest.clearAllMocks();
    });

    describe('generateCertificate', () => {
        it('should generate certificate successfully', async () => {
            mockReq.body.moduleId = 'mod123';
            const mockResult = {
                success: true,
                certificate: { _id: 'cert123', certificateNumber: 'CERT-001' }
            };
            certificateService.generateCertificate.mockResolvedValue(mockResult);

            await certificateController.generateCertificate(mockReq, mockRes);

            expect(certificateService.generateCertificate).toHaveBeenCalledWith('user123', 'mod123');
            expect(certificateService.generatePDF).toHaveBeenCalledWith('cert123');
            expect(mockRes.status).toHaveBeenCalledWith(201);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                message: 'Certificate generated successfully',
                data: mockResult.certificate
            });
        });

        it('should handle generation failure', async () => {
            mockReq.body.moduleId = 'mod123';
            const mockResult = { success: false, message: 'Module not completed' };
            certificateService.generateCertificate.mockResolvedValue(mockResult);

            await certificateController.generateCertificate(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith(mockResult);
        });
    });

    describe('getMyCertificates', () => {
        it('should return user certificates', async () => {
            const mockResult = {
                certificates: [
                    { id: 'cert1', certificateNumber: 'CERT-001' },
                    { id: 'cert2', certificateNumber: 'CERT-002' }
                ]
            };
            certificateService.getUserCertificates.mockResolvedValue(mockResult);

            await certificateController.getMyCertificates(mockReq, mockRes);

            expect(certificateService.getUserCertificates).toHaveBeenCalledWith('user123');
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                data: mockResult.certificates
            });
        });
    });

    describe('getCertificate', () => {
        it('should return certificate by number', async () => {
            mockReq.params.id = 'CERT-001';
            const mockResult = {
                success: true,
                certificate: { id: 'cert123', certificateNumber: 'CERT-001' }
            };
            certificateService.getCertificateByNumber.mockResolvedValue(mockResult);

            await certificateController.getCertificate(mockReq, mockRes);

            expect(certificateService.getCertificateByNumber).toHaveBeenCalledWith('CERT-001');
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                data: mockResult.certificate
            });
        });

        it('should return 404 for non-existent certificate', async () => {
            mockReq.params.id = 'INVALID';
            const mockResult = { success: false, message: 'Certificate not found' };
            certificateService.getCertificateByNumber.mockResolvedValue(mockResult);

            await certificateController.getCertificate(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.json).toHaveBeenCalledWith(mockResult);
        });
    });

    describe('verifyCertificate', () => {
        it('should verify certificate successfully', async () => {
            mockReq.params.code = 'VERIFY123';
            const mockResult = {
                success: true,
                certificate: { id: 'cert123', certificateNumber: 'CERT-001', isValid: true }
            };
            certificateService.verifyCertificate.mockResolvedValue(mockResult);

            await certificateController.verifyCertificate(mockReq, mockRes);

            expect(certificateService.verifyCertificate).toHaveBeenCalledWith('VERIFY123');
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                data: mockResult.certificate
            });
        });

        it('should return 404 for invalid verification code', async () => {
            mockReq.params.code = 'INVALID';
            const mockResult = { success: false, message: 'Invalid verification code' };
            certificateService.verifyCertificate.mockResolvedValue(mockResult);

            await certificateController.verifyCertificate(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.json).toHaveBeenCalledWith(mockResult);
        });
    });

    describe('downloadCertificate', () => {
        it('should download certificate PDF', async () => {
            mockReq.params.id = 'CERT-001';
            const mockResult = {
                success: true,
                certificate: { id: 'cert123', pdfUrl: 'certificates/cert123.pdf' }
            };
            certificateService.getCertificateByNumber.mockResolvedValue(mockResult);

            await certificateController.downloadCertificate(mockReq, mockRes);

            expect(certificateService.getCertificateByNumber).toHaveBeenCalledWith('CERT-001');
            expect(mockRes.download).toHaveBeenCalledWith(
                path.join(__dirname, '../../../public', 'certificates/cert123.pdf')
            );
        });

        it('should return 404 if PDF not found', async () => {
            mockReq.params.id = 'CERT-001';
            const mockResult = {
                success: true,
                certificate: { id: 'cert123' } // no pdfUrl
            };
            certificateService.getCertificateByNumber.mockResolvedValue(mockResult);

            await certificateController.downloadCertificate(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                message: 'Certificate PDF not found'
            });
        });
    });

    describe('getCertificateStats', () => {
        it('should return certificate statistics', async () => {
            const mockResult = {
                stats: { totalCertificates: 100, issuedThisMonth: 25 }
            };
            certificateService.getCertificateStats.mockResolvedValue(mockResult);

            await certificateController.getCertificateStats(mockReq, mockRes);

            expect(certificateService.getCertificateStats).toHaveBeenCalled();
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                data: mockResult.stats
            });
        });
    });

    describe('revokeCertificate', () => {
        it('should revoke certificate successfully', async () => {
            mockReq.params.id = 'cert123';
            mockReq.body.reason = 'Fraudulent activity';
            const mockResult = { message: 'Certificate revoked successfully' };
            certificateService.revokeCertificate.mockResolvedValue(mockResult);

            await certificateController.revokeCertificate(mockReq, mockRes);

            expect(certificateService.revokeCertificate).toHaveBeenCalledWith('cert123', 'Fraudulent activity');
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                message: mockResult.message
            });
        });
    });
});
