const paymentController = require('../../controllers/paymentController');
const paymentService = require('../../services/paymentService');

// Mock services
jest.mock('../../services/paymentService');

describe('Payment Controller', () => {
    let mockReq, mockRes;

    beforeEach(() => {
        mockReq = {
            params: {},
            body: {},
            query: {},
            user: { id: 'user123', role: 'user' },
            ip: '127.0.0.1',
            get: jest.fn()
        };
        mockRes = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis()
        };
        jest.clearAllMocks();
        mockReq.get.mockReturnValue('Mozilla/5.0');
    });

    describe('createPayment', () => {
        it('should create payment successfully', async () => {
            mockReq.body = {
                amount: 100,
                currency: 'USD',
                provider: 'stripe',
                metadata: { courseId: 'course123' }
            };
            const mockResult = { transactionId: 'txn_123', status: 'pending' };
            paymentService.createPayment.mockResolvedValue(mockResult);

            await paymentController.createPayment(mockReq, mockRes);

            expect(paymentService.createPayment).toHaveBeenCalledWith('user123', {
                amount: 100,
                currency: 'USD',
                provider: 'stripe',
                metadata: {
                    courseId: 'course123',
                    ipAddress: '127.0.0.1',
                    userAgent: 'Mozilla/5.0'
                }
            });
            expect(mockRes.status).toHaveBeenCalledWith(201);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                message: 'Payment created successfully',
                data: mockResult
            });
        });
    });

    describe('getMyPayments', () => {
        it('should return user payments with pagination', async () => {
            mockReq.query = { page: '2', limit: '5', status: 'completed' };
            const mockResult = {
                data: [{ transactionId: 'txn1', amount: 100 }],
                pagination: { page: 2, limit: 5, total: 20 }
            };
            paymentService.getUserPayments.mockResolvedValue(mockResult);

            await paymentController.getMyPayments(mockReq, mockRes);

            expect(paymentService.getUserPayments).toHaveBeenCalledWith('user123', {
                page: 2,
                limit: 5,
                status: 'completed'
            });
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                data: mockResult.data,
                pagination: mockResult.pagination
            });
        });

        it('should use default pagination values', async () => {
            const mockResult = {
                data: [],
                pagination: { page: 1, limit: 10, total: 0 }
            };
            paymentService.getUserPayments.mockResolvedValue(mockResult);

            await paymentController.getMyPayments(mockReq, mockRes);

            expect(paymentService.getUserPayments).toHaveBeenCalledWith('user123', {
                page: 1,
                limit: 10,
                status: undefined
            });
        });
    });

    describe('getPayment', () => {
        it('should return payment for owner', async () => {
            mockReq.params.transactionId = 'txn123';
            const mockResult = {
                success: true,
                data: {
                    transactionId: 'txn123',
                    user: { _id: 'user123' },
                    amount: 100
                }
            };
            paymentService.getPayment.mockResolvedValue(mockResult);

            await paymentController.getPayment(mockReq, mockRes);

            expect(paymentService.getPayment).toHaveBeenCalledWith('txn123');
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                data: mockResult.data
            });
        });

        it('should return payment for admin', async () => {
            mockReq.user.role = 'admin';
            mockReq.params.transactionId = 'txn123';
            const mockResult = {
                success: true,
                data: {
                    transactionId: 'txn123',
                    user: { _id: 'user456' },
                    amount: 100
                }
            };
            paymentService.getPayment.mockResolvedValue(mockResult);

            await paymentController.getPayment(mockReq, mockRes);

            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                data: mockResult.data
            });
        });

        it('should deny access for non-owner non-admin', async () => {
            mockReq.params.transactionId = 'txn123';
            const mockResult = {
                success: true,
                data: {
                    transactionId: 'txn123',
                    user: { _id: 'user456' },
                    amount: 100
                }
            };
            paymentService.getPayment.mockResolvedValue(mockResult);

            await paymentController.getPayment(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(403);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                message: 'Access denied'
            });
        });

        it('should return 404 for non-existent payment', async () => {
            mockReq.params.transactionId = 'invalid';
            const mockResult = { success: false, message: 'Payment not found' };
            paymentService.getPayment.mockResolvedValue(mockResult);

            await paymentController.getPayment(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.json).toHaveBeenCalledWith(mockResult);
        });
    });

    describe('confirmPayment', () => {
        it('should confirm payment successfully', async () => {
            mockReq.params.transactionId = 'txn123';
            mockReq.body = { confirmationCode: 'CONF123' };
            const mockResult = {
                payment: { transactionId: 'txn123', status: 'completed' }
            };
            paymentService.confirmPayment.mockResolvedValue(mockResult);

            await paymentController.confirmPayment(mockReq, mockRes);

            expect(paymentService.confirmPayment).toHaveBeenCalledWith('txn123', { confirmationCode: 'CONF123' });
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                message: 'Payment confirmed successfully',
                data: mockResult.payment
            });
        });
    });

    describe('cancelPayment', () => {
        it('should cancel payment successfully', async () => {
            mockReq.params.transactionId = 'txn123';
            const mockResult = {
                payment: { transactionId: 'txn123', status: 'cancelled' }
            };
            paymentService.failPayment.mockResolvedValue(mockResult);

            await paymentController.cancelPayment(mockReq, mockRes);

            expect(paymentService.failPayment).toHaveBeenCalledWith('txn123', 'Cancelled by user');
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                message: 'Payment cancelled',
                data: mockResult.payment
            });
        });
    });

    describe('getAllPayments', () => {
        it('should return empty array for admin payments', async () => {
            mockReq.query = { page: '1', limit: '10' };

            await paymentController.getAllPayments(mockReq, mockRes);

            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                data: [],
                pagination: { page: 1, limit: 10, total: 0, pages: 0 }
            });
        });
    });

    describe('getPaymentStats', () => {
        it('should return payment statistics', async () => {
            mockReq.query = {
                startDate: '2023-01-01',
                endDate: '2023-12-31',
                provider: 'stripe'
            };
            const mockResult = {
                data: { totalRevenue: 10000, totalTransactions: 100 }
            };
            paymentService.getPaymentStats.mockResolvedValue(mockResult);

            await paymentController.getPaymentStats(mockReq, mockRes);

            expect(paymentService.getPaymentStats).toHaveBeenCalledWith({
                startDate: '2023-01-01',
                endDate: '2023-12-31',
                provider: 'stripe',
                status: undefined
            });
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                data: mockResult.data
            });
        });
    });

    describe('refundPayment', () => {
        it('should refund payment successfully', async () => {
            mockReq.params.transactionId = 'txn123';
            mockReq.body = { amount: 50, reason: 'Customer request' };
            const mockResult = {
                payment: { transactionId: 'txn123', status: 'refunded' }
            };
            paymentService.refundPayment.mockResolvedValue(mockResult);

            await paymentController.refundPayment(mockReq, mockRes);

            expect(paymentService.refundPayment).toHaveBeenCalledWith('txn123', {
                amount: 50,
                reason: 'Customer request'
            });
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                message: 'Payment refunded successfully',
                data: mockResult.payment
            });
        });
    });
});
