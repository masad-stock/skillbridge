const paymentService = require('../services/paymentService');
const Joi = require('joi');

/**
 * Create payment
 */
exports.createPayment = async (req, res) => {
    try {
        const userId = req.user.id;

        // Basic input validation
        const Joi = require('joi');
        const schema = Joi.object({
            provider: Joi.string().valid('stripe', 'paypal', 'mpesa', 'manual', 'free').required(),
            amount: Joi.number().positive().required(),
            currency: Joi.string().length(3).uppercase().default('USD'),
            item: Joi.object({
                type: Joi.string().valid('module', 'certificate', 'subscription', 'donation').required(),
                id: Joi.string().optional(),
                name: Joi.string().optional(),
                description: Joi.string().optional()
            }).required(),
            metadata: Joi.object().unknown(true).default({}),
            idempotencyKey: Joi.string().max(128).optional()
        });
        const { value, error: validationError } = schema.validate(req.body, { abortEarly: false });
        if (validationError) {
            return res.status(400).json({ success: false, message: 'Validation error', details: validationError.details });
        }

        const paymentData = {
            ...value,
            metadata: {
                ...value.metadata,
                ipAddress: req.ip,
                userAgent: req.get('user-agent')
            }
        };

        const result = await paymentService.createPayment(userId, paymentData);

        res.status(201).json({
            success: true,
            message: 'Payment created successfully',
            data: result
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Get user payments
 */
exports.getMyPayments = async (req, res) => {
    try {
        const userId = req.user.id;
        const schema = Joi.object({
            page: Joi.number().integer().min(1).default(1),
            limit: Joi.number().integer().min(1).max(100).default(10),
            status: Joi.string().valid('pending', 'completed', 'failed', 'refunded', 'cancelled').optional()
        });
        const { value, error } = schema.validate(req.query);
        if (error) return res.status(400).json({ success: false, message: 'Validation error', details: error.details });
        const { page, limit, status } = value;

        const result = await paymentService.getUserPayments(userId, {
            page,
            limit,
            status
        });

        res.json({
            success: true,
            data: result.data,
            pagination: result.pagination
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Get payment by transaction ID
 */
exports.getPayment = async (req, res) => {
    try {
        const schema = Joi.object({ transactionId: Joi.string().required() });
        const { value, error } = schema.validate(req.params);
        if (error) return res.status(400).json({ success: false, message: 'Validation error', details: error.details });
        const { transactionId } = value;
        const result = await paymentService.getPayment(transactionId);

        if (!result.success) {
            return res.status(404).json(result);
        }

        // Check if user owns this payment or is admin
        if (result.data.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        res.json({
            success: true,
            data: result.data
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Confirm payment
 */
exports.confirmPayment = async (req, res) => {
    try {
        const paramSchema = Joi.object({ transactionId: Joi.string().required() });
        const bodySchema = Joi.object({
            providerTransactionId: Joi.string().optional(),
            webhookData: Joi.object().unknown(true).optional()
        }).default({});
        const pr = paramSchema.validate(req.params);
        if (pr.error) return res.status(400).json({ success: false, message: 'Validation error', details: pr.error.details });
        const br = bodySchema.validate(req.body);
        if (br.error) return res.status(400).json({ success: false, message: 'Validation error', details: br.error.details });
        const { transactionId } = pr.value;
        const confirmationData = br.value;

        const result = await paymentService.confirmPayment(transactionId, confirmationData);

        res.json({
            success: true,
            message: 'Payment confirmed successfully',
            data: result.payment
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Cancel payment
 */
exports.cancelPayment = async (req, res) => {
    try {
        const schema = Joi.object({ transactionId: Joi.string().required() });
        const { value, error } = schema.validate(req.params);
        if (error) return res.status(400).json({ success: false, message: 'Validation error', details: error.details });
        const { transactionId } = value;
        const result = await paymentService.failPayment(transactionId, 'Cancelled by user');

        res.json({
            success: true,
            message: 'Payment cancelled',
            data: result.payment
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Get all payments (admin)
 */
exports.getAllPayments = async (req, res) => {
    try {
        const schema = Joi.object({
            page: Joi.number().integer().min(1).default(1),
            limit: Joi.number().integer().min(1).max(100).default(10),
            status: Joi.string().valid('pending', 'completed', 'failed', 'refunded', 'cancelled').optional(),
            provider: Joi.string().valid('stripe', 'paypal', 'mpesa', 'manual', 'free').optional()
        });
        const { value, error } = schema.validate(req.query);
        if (error) return res.status(400).json({ success: false, message: 'Validation error', details: error.details });
        const { page, limit } = value;

        // This would need to be implemented in paymentService
        // For now, return empty array
        res.json({
            success: true,
            data: [],
            pagination: { page, limit, total: 0, pages: 0 }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Get payment statistics (admin)
 */
exports.getPaymentStats = async (req, res) => {
    try {
        const schema = Joi.object({
            startDate: Joi.string().isoDate().optional(),
            endDate: Joi.string().isoDate().optional(),
            provider: Joi.string().valid('stripe', 'paypal', 'mpesa', 'manual', 'free').optional(),
            status: Joi.string().valid('pending', 'completed', 'failed', 'refunded', 'cancelled').optional()
        });
        const { value, error } = schema.validate(req.query);
        if (error) return res.status(400).json({ success: false, message: 'Validation error', details: error.details });
        const { startDate, endDate, provider, status } = value;

        const result = await paymentService.getPaymentStats({
            startDate,
            endDate,
            provider,
            status
        });

        res.json({
            success: true,
            data: result.data
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * Refund payment (admin)
 */
exports.refundPayment = async (req, res) => {
    try {
        const paramSchema = Joi.object({ transactionId: Joi.string().required() });
        const bodySchema = Joi.object({
            amount: Joi.number().positive().optional(),
            reason: Joi.string().min(3).optional()
        });
        const pr = paramSchema.validate(req.params);
        if (pr.error) return res.status(400).json({ success: false, message: 'Validation error', details: pr.error.details });
        const br = bodySchema.validate(req.body);
        if (br.error) return res.status(400).json({ success: false, message: 'Validation error', details: br.error.details });
        const { transactionId } = pr.value;
        const { amount, reason } = br.value;

        const result = await paymentService.refundPayment(transactionId, {
            amount,
            reason
        });

        res.json({
            success: true,
            message: 'Payment refunded successfully',
            data: result.payment
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
