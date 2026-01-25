const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const paymentController = require('../controllers/paymentController');

// All routes require authentication
router.use(protect);

/**
 * Create payment
 * POST /api/v1/payments
 */
router.post('/', paymentController.createPayment);

/**
 * Get user payments
 * GET /api/v1/payments/my-payments
 */
router.get('/my-payments', paymentController.getMyPayments);

/**
 * Get payment by transaction ID
 * GET /api/v1/payments/:transactionId
 */
router.get('/:transactionId', paymentController.getPayment);

/**
 * Confirm payment
 * POST /api/v1/payments/:transactionId/confirm
 */
router.post('/:transactionId/confirm', paymentController.confirmPayment);

/**
 * Cancel payment
 * POST /api/v1/payments/:transactionId/cancel
 */
router.post('/:transactionId/cancel', paymentController.cancelPayment);

// Admin routes
router.use(authorize('admin'));

/**
 * Get all payments (admin)
 * GET /api/v1/payments
 */
router.get('/', paymentController.getAllPayments);

/**
 * Get payment statistics (admin)
 * GET /api/v1/payments/stats
 */
router.get('/stats', paymentController.getPaymentStats);

/**
 * Refund payment (admin)
 * POST /api/v1/payments/:transactionId/refund
 */
router.post('/:transactionId/refund', paymentController.refundPayment);

module.exports = router;
