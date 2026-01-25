const mongoose = require('mongoose');

// Supplier Management
const supplierSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    contactPerson: String,
    phone: { type: String, required: true },
    email: String,
    address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: { type: String, default: 'Kenya' }
    },
    paymentTerms: { type: String, enum: ['cash', 'net_15', 'net_30', 'net_60'], default: 'net_30' },
    taxId: String,
    notes: String,
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Enhanced Inventory Management
const inventoryItemSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    itemName: { type: String, required: true },
    description: String,
    category: { type: String, required: true },
    subcategory: String,
    sku: { type: String, unique: true, sparse: true },
    barcode: String,
    unit: { type: String, default: 'pieces' },
    quantity: { type: Number, required: true, default: 0 },
    minQuantity: { type: Number, default: 0 },
    maxQuantity: Number,
    reorderLevel: { type: Number, default: 5 },
    costPrice: { type: Number, required: true },
    sellingPrice: { type: Number, required: true },
    wholesalePrice: Number,
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
    location: String,
    expiryDate: Date,
    batchNumber: String,
    weight: Number,
    dimensions: {
        length: Number,
        width: Number,
        height: Number
    },
    tags: [String],
    images: [String],
    isActive: { type: Boolean, default: true },
    lastRestocked: Date,
    notes: String
}, { timestamps: true });

// Enhanced Customer Management
const customerSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: String,
    secondaryPhone: String,
    address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: { type: String, default: 'Kenya' }
    },
    customerType: { type: String, enum: ['regular', 'wholesale', 'retail', 'vip'], default: 'retail' },
    customerSegment: { type: String, enum: ['new', 'active', 'loyal', 'inactive'], default: 'new' },
    creditLimit: { type: Number, default: 0 },
    currentCredit: { type: Number, default: 0 },
    totalPurchases: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    totalPaid: { type: Number, default: 0 },
    outstandingBalance: { type: Number, default: 0 },
    lastPurchase: Date,
    loyaltyPoints: { type: Number, default: 0 },
    preferredPaymentMethod: { type: String, enum: ['cash', 'mpesa', 'bank', 'credit'], default: 'cash' },
    tags: [String],
    notes: String,
    dateOfBirth: Date,
    gender: { type: String, enum: ['male', 'female', 'other'] },
    isActive: { type: Boolean, default: true },
    marketingConsent: { type: Boolean, default: false },
    referralSource: String
}, { timestamps: true });

// Enhanced Sales Transaction
const saleSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    invoiceNumber: { type: String, unique: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    customerName: String,
    customerPhone: String,
    items: [{
        inventoryItem: { type: mongoose.Schema.Types.ObjectId, ref: 'InventoryItem' },
        itemName: String,
        sku: String,
        quantity: { type: Number, required: true },
        unitPrice: { type: Number, required: true },
        discount: { type: Number, default: 0 },
        taxRate: { type: Number, default: 0 },
        taxAmount: { type: Number, default: 0 },
        total: { type: Number, required: true }
    }],
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    discountType: { type: String, enum: ['percentage', 'fixed'], default: 'fixed' },
    tax: { type: Number, default: 0 },
    shipping: { type: Number, default: 0 },
    total: { type: Number, required: true },
    currency: { type: String, default: 'KES' },
    paymentMethod: { type: String, enum: ['cash', 'mpesa', 'bank', 'credit', 'cheque'], required: true },
    paymentStatus: { type: String, enum: ['paid', 'pending', 'partial', 'overdue'], default: 'paid' },
    paymentReference: String,
    dueDate: Date,
    paidAmount: { type: Number, default: 0 },
    balanceDue: { type: Number, default: 0 },
    saleDate: { type: Date, default: Date.now },
    deliveryDate: Date,
    deliveryStatus: { type: String, enum: ['pending', 'shipped', 'delivered', 'returned'], default: 'delivered' },
    notes: String,
    salesperson: String,
    isReturn: { type: Boolean, default: false },
    returnReason: String,
    tags: [String]
}, { timestamps: true });

// Sales Returns
const returnSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    originalSale: { type: mongoose.Schema.Types.ObjectId, ref: 'Sale', required: true },
    returnNumber: { type: String, unique: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    items: [{
        inventoryItem: { type: mongoose.Schema.Types.ObjectId, ref: 'InventoryItem' },
        itemName: String,
        quantity: { type: Number, required: true },
        unitPrice: { type: Number, required: true },
        reason: { type: String, enum: ['defective', 'wrong_item', 'customer_dissatisfaction', 'other'], required: true },
        condition: { type: String, enum: ['new', 'used', 'damaged'], default: 'new' }
    }],
    totalRefund: { type: Number, required: true },
    refundMethod: { type: String, enum: ['cash', 'mpesa', 'bank', 'credit'], required: true },
    refundStatus: { type: String, enum: ['pending', 'processed', 'rejected'], default: 'pending' },
    returnDate: { type: Date, default: Date.now },
    processedDate: Date,
    notes: String,
    processedBy: String
}, { timestamps: true });

// Enhanced Expense Tracking
const expenseSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    expenseNumber: { type: String, unique: true },
    category: { type: String, required: true },
    subcategory: String,
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'KES' },
    paymentMethod: { type: String, enum: ['cash', 'mpesa', 'bank', 'credit', 'cheque'], required: true },
    paymentReference: String,
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier' },
    vendorName: String,
    receipt: String,
    receiptImage: String,
    taxAmount: { type: Number, default: 0 },
    taxRate: { type: Number, default: 0 },
    isTaxDeductible: { type: Boolean, default: false },
    expenseDate: { type: Date, default: Date.now },
    dueDate: Date,
    recurring: {
        isRecurring: { type: Boolean, default: false },
        frequency: { type: String, enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'] },
        nextDue: Date
    },
    project: String,
    department: String,
    approvedBy: String,
    approvalStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'approved' },
    notes: String,
    tags: [String]
}, { timestamps: true });

// Payment Records
const paymentSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    paymentNumber: { type: String, unique: true },
    type: { type: String, enum: ['sale_payment', 'expense_payment', 'customer_payment', 'supplier_payment'], required: true },
    reference: { type: mongoose.Schema.Types.ObjectId, required: true }, // Sale, Expense, or Customer ID
    amount: { type: Number, required: true },
    currency: { type: String, default: 'KES' },
    paymentMethod: { type: String, enum: ['cash', 'mpesa', 'bank', 'credit', 'cheque'], required: true },
    paymentReference: String,
    paymentDate: { type: Date, default: Date.now },
    receivedBy: String,
    notes: String,
    reconciled: { type: Boolean, default: false },
    reconciliationDate: Date
}, { timestamps: true });

// Business Settings
const businessSettingsSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    businessName: String,
    businessType: String,
    address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: { type: String, default: 'Kenya' }
    },
    phone: String,
    email: String,
    website: String,
    taxId: String,
    currency: { type: String, default: 'KES' },
    taxRate: { type: Number, default: 16 }, // KRA VAT rate
    invoicePrefix: { type: String, default: 'INV' },
    invoiceNumber: { type: Number, default: 1 },
    expensePrefix: { type: String, default: 'EXP' },
    expenseNumber: { type: Number, default: 1 },
    paymentTerms: {
        default: { type: String, default: 'net_30' },
        custom: [{
            name: String,
            days: Number
        }]
    },
    notifications: {
        lowStock: { type: Boolean, default: true },
        paymentDue: { type: Boolean, default: true },
        expenseApproval: { type: Boolean, default: false }
    },
    integrations: {
        mpesa: { enabled: { type: Boolean, default: false }, config: {} },
        email: { enabled: { type: Boolean, default: false }, config: {} },
        sms: { enabled: { type: Boolean, default: false }, config: {} }
    }
}, { timestamps: true });

// Activity Log
const activityLogSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true },
    entityType: { type: String, required: true },
    entityId: mongoose.Schema.Types.ObjectId,
    description: String,
    oldValues: {},
    newValues: {},
    ipAddress: String,
    userAgent: String,
    timestamp: { type: Date, default: Date.now }
});

module.exports = {
    Supplier: mongoose.model('Supplier', supplierSchema),
    InventoryItem: mongoose.model('InventoryItem', inventoryItemSchema),
    Customer: mongoose.model('Customer', customerSchema),
    Sale: mongoose.model('Sale', saleSchema),
    Return: mongoose.model('Return', returnSchema),
    Expense: mongoose.model('Expense', expenseSchema),
    BusinessPayment: mongoose.model('BusinessPayment', paymentSchema),
    BusinessSettings: mongoose.model('BusinessSettings', businessSettingsSchema),
    ActivityLog: mongoose.model('ActivityLog', activityLogSchema)
};
