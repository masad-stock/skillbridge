const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    transactionId: {
        type: String,
        required: true
    },
    idempotencyKey: {
        type: String
    },
    provider: {
        type: String,
        enum: ['stripe', 'paypal', 'mpesa', 'manual', 'free'],
        required: true
    },
    providerTransactionId: {
        type: String,
        sparse: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    currency: {
        type: String,
        default: 'USD',
        uppercase: true
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded', 'cancelled'],
        default: 'pending'
    },
    paymentMethod: {
        type: String
    },
    item: {
        type: {
            type: String,
            enum: ['module', 'certificate', 'subscription', 'donation'],
            required: true
        },
        id: mongoose.Schema.Types.ObjectId,
        name: String,
        description: String
    },
    metadata: {
        ipAddress: String,
        userAgent: String,
        customerEmail: String,
        customerPhone: String,
        notes: String
    },
    receipt: {
        url: String,
        number: String
    },
    refund: {
        amount: Number,
        reason: String,
        refundedAt: Date,
        refundTransactionId: String
    },
    webhookData: mongoose.Schema.Types.Mixed,
    completedAt: Date,
    failedAt: Date,
    failureReason: String
}, {
    timestamps: true
});

// Generate transaction ID
paymentSchema.pre('save', async function (next) {
    if (!this.transactionId) {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substring(2, 8);
        this.transactionId = `TXN-${timestamp}-${random}`.toUpperCase();
    }
    next();
});

// Generate receipt number
paymentSchema.pre('save', function (next) {
    if (this.status === 'completed' && !this.receipt.number) {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const count = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
        this.receipt.number = `RCP-${year}${month}-${count}`;
    }
    next();
});

// Indexes
paymentSchema.index({ user: 1, createdAt: -1 });
paymentSchema.index({ transactionId: 1 });
paymentSchema.index({ providerTransactionId: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ idempotencyKey: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Payment', paymentSchema);
