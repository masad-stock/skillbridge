const Payment = require('../models/Payment');
const User = require('../models/User');
const emailQueueService = require('./emailQueueService');
const logger = require('../utils/logger');

class PaymentService {
    /**
     * Create payment intent
     */
    async createPayment(userId, paymentData) {
        try {
            const { provider, amount, currency, item, metadata, idempotencyKey } = paymentData;

            // Validate amount
            if (amount <= 0) {
                throw new Error('Invalid payment amount');
            }

            // Idempotency: reuse existing successful or pending payment for same key
            if (idempotencyKey) {
                const existing = await Payment.findOne({ idempotencyKey });
                if (existing) {
                    return {
                        success: true,
                        payment: existing,
                        providerResponse: { reused: true }
                    };
                }
            }

            // Create payment record
            const payment = await Payment.create({
                user: userId,
                provider,
                amount,
                currency: currency || 'USD',
                item,
                metadata,
                idempotencyKey,
                status: 'pending'
            });

            // Get user
            const user = await User.findById(userId);

            // Initialize payment with provider
            let providerResponse;
            switch (provider) {
                case 'stripe':
                    providerResponse = await this._initializeStripe(payment, user);
                    break;
                case 'paypal':
                    providerResponse = await this._initializePayPal(payment, user);
                    break;
                case 'mpesa':
                    providerResponse = await this._initializeMPesa(payment, user);
                    break;
                case 'free':
                    // Auto-complete for free items
                    payment.status = 'completed';
                    payment.completedAt = new Date();
                    await payment.save();
                    await this._handlePaymentSuccess(payment);
                    providerResponse = { success: true };
                    break;
                default:
                    throw new Error('Unsupported payment provider');
            }

            return {
                success: true,
                payment,
                providerResponse
            };
        } catch (error) {
            logger.error('Payment creation failed:', error);
            throw new Error(`Payment creation failed: ${error.message}`);
        }
    }

    /**
     * Initialize Stripe payment
     */
    async _initializeStripe(payment, user) {
        // Placeholder for Stripe integration
        // In production, use Stripe SDK
        logger.info('Stripe payment initialized:', payment.transactionId);

        return {
            clientSecret: 'stripe_client_secret_placeholder',
            publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
            paymentIntentId: 'pi_' + payment.transactionId
        };
    }

    /**
     * Initialize PayPal payment
     */
    async _initializePayPal(payment, user) {
        // Placeholder for PayPal integration
        logger.info('PayPal payment initialized:', payment.transactionId);

        return {
            orderId: 'paypal_order_' + payment.transactionId,
            approvalUrl: `${process.env.FRONTEND_URL}/payment/paypal/approve?orderId=${payment.transactionId}`
        };
    }

    /**
     * Initialize M-Pesa payment
     */
    async _initializeMPesa(payment, user) {
        // Placeholder for M-Pesa Daraja API integration
        logger.info('M-Pesa payment initialized:', payment.transactionId);

        return {
            checkoutRequestId: 'mpesa_' + payment.transactionId,
            merchantRequestId: 'merchant_' + payment.transactionId,
            responseCode: '0',
            responseDescription: 'Success. Request accepted for processing'
        };
    }

    /**
     * Confirm payment
     */
    async confirmPayment(transactionId, confirmationData) {
        try {
            const payment = await Payment.findOne({ transactionId });

            if (!payment) {
                throw new Error('Payment not found');
            }

            if (payment.status === 'completed') {
                return { success: true, message: 'Payment already completed', payment };
            }

            // Update payment
            payment.providerTransactionId = confirmationData.providerTransactionId;
            payment.status = 'completed';
            payment.completedAt = new Date();
            payment.webhookData = confirmationData.webhookData;

            await payment.save();

            // Handle successful payment
            await this._handlePaymentSuccess(payment);

            return { success: true, payment };
        } catch (error) {
            logger.error('Payment confirmation failed:', error);
            throw new Error(`Payment confirmation failed: ${error.message}`);
        }
    }

    /**
     * Handle successful payment
     */
    async _handlePaymentSuccess(payment) {
        try {
            // Populate payment
            await payment.populate('user', 'email profile');

            // Grant access to purchased item
            await this._grantAccess(payment);

            // Send receipt email
            await this._sendReceiptEmail(payment);

            // Log success
            logger.info('Payment successful:', payment.transactionId);
        } catch (error) {
            logger.error('Post-payment processing failed:', error);
        }
    }

    /**
     * Grant access to purchased item
     */
    async _grantAccess(payment) {
        const { user, item } = payment;

        switch (item.type) {
            case 'module':
                // Enroll user in module
                await User.findByIdAndUpdate(user._id, {
                    $addToSet: { 'learningProgress.enrolledModules': item.id }
                });
                break;

            case 'subscription':
                // Update user subscription
                await User.findByIdAndUpdate(user._id, {
                    'subscription.active': true,
                    'subscription.plan': item.name,
                    'subscription.expiresAt': new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                });
                break;

            case 'certificate':
                // Certificate access already granted
                break;

            default:
                logger.warn('Unknown item type:', item.type);
        }
    }

    /**
     * Send receipt email
     */
    async _sendReceiptEmail(payment) {
        try {
            // Queue receipt email
            await emailQueueService.queueEmail('payment-receipt', {
                user: payment.user,
                payment: {
                    transactionId: payment.transactionId,
                    amount: payment.amount,
                    currency: payment.currency,
                    item: payment.item,
                    receiptNumber: payment.receipt.number,
                    date: payment.completedAt
                }
            });
        } catch (error) {
            logger.error('Failed to send receipt email:', error);
        }
    }

    /**
     * Fail payment
     */
    async failPayment(transactionId, reason) {
        try {
            const payment = await Payment.findOne({ transactionId });

            if (!payment) {
                throw new Error('Payment not found');
            }

            payment.status = 'failed';
            payment.failedAt = new Date();
            payment.failureReason = reason;

            await payment.save();

            return { success: true, payment };
        } catch (error) {
            throw new Error(`Payment failure update failed: ${error.message}`);
        }
    }

    /**
     * Refund payment
     */
    async refundPayment(transactionId, refundData) {
        try {
            const payment = await Payment.findOne({ transactionId });

            if (!payment) {
                throw new Error('Payment not found');
            }

            if (payment.status !== 'completed') {
                throw new Error('Only completed payments can be refunded');
            }

            const { amount, reason } = refundData;
            const refundAmount = amount || payment.amount;

            if (refundAmount > payment.amount) {
                throw new Error('Refund amount exceeds payment amount');
            }

            // Process refund with provider
            let refundTransactionId;
            switch (payment.provider) {
                case 'stripe':
                    refundTransactionId = await this._refundStripe(payment, refundAmount);
                    break;
                case 'paypal':
                    refundTransactionId = await this._refundPayPal(payment, refundAmount);
                    break;
                case 'mpesa':
                    refundTransactionId = await this._refundMPesa(payment, refundAmount);
                    break;
                default:
                    refundTransactionId = 'manual_refund_' + Date.now();
            }

            // Update payment
            payment.status = 'refunded';
            payment.refund = {
                amount: refundAmount,
                reason,
                refundedAt: new Date(),
                refundTransactionId
            };

            await payment.save();

            // Revoke access if full refund
            if (refundAmount === payment.amount) {
                await this._revokeAccess(payment);
            }

            return { success: true, payment };
        } catch (error) {
            throw new Error(`Refund failed: ${error.message}`);
        }
    }

    /**
     * Refund via Stripe
     */
    async _refundStripe(payment, amount) {
        logger.info('Stripe refund:', payment.transactionId, amount);
        return 'stripe_refund_' + Date.now();
    }

    /**
     * Refund via PayPal
     */
    async _refundPayPal(payment, amount) {
        logger.info('PayPal refund:', payment.transactionId, amount);
        return 'paypal_refund_' + Date.now();
    }

    /**
     * Refund via M-Pesa
     */
    async _refundMPesa(payment, amount) {
        logger.info('M-Pesa refund:', payment.transactionId, amount);
        return 'mpesa_refund_' + Date.now();
    }

    /**
     * Revoke access to purchased item
     */
    async _revokeAccess(payment) {
        const { user, item } = payment;

        switch (item.type) {
            case 'module':
                await User.findByIdAndUpdate(user, {
                    $pull: { 'learningProgress.enrolledModules': item.id }
                });
                break;

            case 'subscription':
                await User.findByIdAndUpdate(user, {
                    'subscription.active': false
                });
                break;

            default:
                break;
        }
    }

    /**
     * Get user payments
     */
    async getUserPayments(userId, options = {}) {
        try {
            const { page = 1, limit = 10, status } = options;

            const query = { user: userId };
            if (status) query.status = status;

            const skip = (page - 1) * limit;
            const payments = await Payment.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean();

            const total = await Payment.countDocuments(query);

            return {
                success: true,
                data: payments,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            throw new Error(`Failed to fetch payments: ${error.message}`);
        }
    }

    /**
     * Get payment by transaction ID
     */
    async getPayment(transactionId) {
        try {
            const payment = await Payment.findOne({ transactionId })
                .populate('user', 'email profile')
                .lean();

            if (!payment) {
                return { success: false, message: 'Payment not found' };
            }

            return { success: true, data: payment };
        } catch (error) {
            throw new Error(`Failed to fetch payment: ${error.message}`);
        }
    }

    /**
     * Get payment statistics
     */
    async getPaymentStats(filters = {}) {
        try {
            const { startDate, endDate, provider, status } = filters;

            const query = {};
            if (startDate || endDate) {
                query.createdAt = {};
                if (startDate) query.createdAt.$gte = new Date(startDate);
                if (endDate) query.createdAt.$lte = new Date(endDate);
            }
            if (provider) query.provider = provider;
            if (status) query.status = status;

            const [stats, byProvider, byStatus] = await Promise.all([
                Payment.aggregate([
                    { $match: query },
                    {
                        $group: {
                            _id: null,
                            totalAmount: { $sum: '$amount' },
                            count: { $sum: 1 },
                            avgAmount: { $avg: '$amount' }
                        }
                    }
                ]),
                Payment.aggregate([
                    { $match: query },
                    {
                        $group: {
                            _id: '$provider',
                            count: { $sum: 1 },
                            totalAmount: { $sum: '$amount' }
                        }
                    }
                ]),
                Payment.aggregate([
                    { $match: query },
                    {
                        $group: {
                            _id: '$status',
                            count: { $sum: 1 }
                        }
                    }
                ])
            ]);

            return {
                success: true,
                data: {
                    overview: stats[0] || { totalAmount: 0, count: 0, avgAmount: 0 },
                    byProvider,
                    byStatus
                }
            };
        } catch (error) {
            throw new Error(`Failed to fetch stats: ${error.message}`);
        }
    }
}

module.exports = new PaymentService();
