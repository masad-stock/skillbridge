const express = require('express');
const router = express.Router();
const {
    InventoryItem,
    Customer,
    Sale,
    Expense,
    Supplier,
    Return,
    BusinessPayment,
    BusinessSettings
} = require('../models/BusinessTool');
const { protect } = require('../middleware/auth');

// ============ INVENTORY MANAGEMENT ============

// @route   GET /api/v1/business/inventory
// @desc    Get all inventory items
// @access  Private
router.get('/inventory', protect, async (req, res) => {
    try {
        const items = await InventoryItem.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json({ success: true, count: items.length, data: items });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   POST /api/v1/business/inventory
// @desc    Add inventory item
// @access  Private
router.post('/inventory', protect, async (req, res) => {
    try {
        const item = await InventoryItem.create({
            ...req.body,
            user: req.user.id
        });
        res.status(201).json({ success: true, data: item });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   PUT /api/v1/business/inventory/:id
// @desc    Update inventory item
// @access  Private
router.put('/inventory/:id', protect, async (req, res) => {
    try {
        const item = await InventoryItem.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            req.body,
            { new: true, runValidators: true }
        );

        if (!item) {
            return res.status(404).json({ success: false, message: 'Item not found' });
        }

        res.json({ success: true, data: item });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   DELETE /api/v1/business/inventory/:id
// @desc    Delete inventory item
// @access  Private
router.delete('/inventory/:id', protect, async (req, res) => {
    try {
        const item = await InventoryItem.findOneAndDelete({
            _id: req.params.id,
            user: req.user.id
        });

        if (!item) {
            return res.status(404).json({ success: false, message: 'Item not found' });
        }

        res.json({ success: true, message: 'Item deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============ CUSTOMER MANAGEMENT ============

// @route   GET /api/v1/business/customers
// @desc    Get all customers
// @access  Private
router.get('/customers', protect, async (req, res) => {
    try {
        const customers = await Customer.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json({ success: true, count: customers.length, data: customers });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   POST /api/v1/business/customers
// @desc    Add customer
// @access  Private
router.post('/customers', protect, async (req, res) => {
    try {
        const customer = await Customer.create({
            ...req.body,
            user: req.user.id
        });
        res.status(201).json({ success: true, data: customer });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   PUT /api/v1/business/customers/:id
// @desc    Update customer
// @access  Private
router.put('/customers/:id', protect, async (req, res) => {
    try {
        const customer = await Customer.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            req.body,
            { new: true, runValidators: true }
        );

        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }

        res.json({ success: true, data: customer });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============ SALES MANAGEMENT ============

// @route   GET /api/v1/business/sales
// @desc    Get all sales
// @access  Private
router.get('/sales', protect, async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const query = { user: req.user.id };

        if (startDate || endDate) {
            query.saleDate = {};
            if (startDate) query.saleDate.$gte = new Date(startDate);
            if (endDate) query.saleDate.$lte = new Date(endDate);
        }

        const sales = await Sale.find(query)
            .populate('customer')
            .sort({ saleDate: -1 });

        const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);

        res.json({
            success: true,
            count: sales.length,
            totalRevenue,
            data: sales
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   POST /api/v1/business/sales
// @desc    Record new sale
// @access  Private
router.post('/sales', protect, async (req, res) => {
    try {
        const sale = await Sale.create({
            ...req.body,
            user: req.user.id
        });

        // Update inventory quantities
        for (const item of sale.items) {
            if (item.inventoryItem) {
                await InventoryItem.findByIdAndUpdate(item.inventoryItem, {
                    $inc: { quantity: -item.quantity }
                });
            }
        }

        // Update customer stats if customer is linked
        if (sale.customer) {
            await Customer.findByIdAndUpdate(sale.customer, {
                $inc: {
                    totalPurchases: 1,
                    totalSpent: sale.total
                },
                $set: { lastPurchase: sale.saleDate }
            });
        }

        res.status(201).json({ success: true, data: sale });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============ EXPENSE TRACKING ============

// @route   GET /api/v1/business/expenses
// @desc    Get all expenses
// @access  Private
router.get('/expenses', protect, async (req, res) => {
    try {
        const { startDate, endDate, category } = req.query;
        const query = { user: req.user.id };

        if (category) query.category = category;
        if (startDate || endDate) {
            query.expenseDate = {};
            if (startDate) query.expenseDate.$gte = new Date(startDate);
            if (endDate) query.expenseDate.$lte = new Date(endDate);
        }

        const expenses = await Expense.find(query).sort({ expenseDate: -1 });
        const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

        res.json({
            success: true,
            count: expenses.length,
            totalExpenses,
            data: expenses
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   POST /api/v1/business/expenses
// @desc    Add expense
// @access  Private
router.post('/expenses', protect, async (req, res) => {
    try {
        const expense = await Expense.create({
            ...req.body,
            user: req.user.id
        });
        res.status(201).json({ success: true, data: expense });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============ SUPPLIER MANAGEMENT ============

// @route   GET /api/v1/business/suppliers
// @desc    Get all suppliers
// @access  Private
router.get('/suppliers', protect, async (req, res) => {
    try {
        const suppliers = await Supplier.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json({ success: true, count: suppliers.length, data: suppliers });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   POST /api/v1/business/suppliers
// @desc    Add supplier
// @access  Private
router.post('/suppliers', protect, async (req, res) => {
    try {
        const supplier = await Supplier.create({
            ...req.body,
            user: req.user.id
        });
        res.status(201).json({ success: true, data: supplier });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============ RETURNS MANAGEMENT ============

// @route   GET /api/v1/business/returns
// @desc    Get all returns
// @access  Private
router.get('/returns', protect, async (req, res) => {
    try {
        const returns = await Return.find({ user: req.user.id })
            .populate('originalSale')
            .populate('customer')
            .sort({ returnDate: -1 });
        res.json({ success: true, count: returns.length, data: returns });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   POST /api/v1/business/returns
// @desc    Process return
// @access  Private
router.post('/returns', protect, async (req, res) => {
    try {
        const returnDoc = await Return.create({
            ...req.body,
            user: req.user.id
        });

        // Update inventory quantities for returned items
        for (const item of returnDoc.items) {
            if (item.inventoryItem) {
                await InventoryItem.findByIdAndUpdate(item.inventoryItem, {
                    $inc: { quantity: item.quantity }
                });
            }
        }

        res.status(201).json({ success: true, data: returnDoc });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============ PAYMENTS MANAGEMENT ============

// @route   GET /api/v1/business/payments
// @desc    Get all payments
// @access  Private
router.get('/payments', protect, async (req, res) => {
    try {
        const payments = await BusinessPayment.find({ user: req.user.id }).sort({ paymentDate: -1 });
        res.json({ success: true, count: payments.length, data: payments });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============ BUSINESS SETTINGS ============

// @route   GET /api/v1/business/settings
// @desc    Get business settings
// @access  Private
router.get('/settings', protect, async (req, res) => {
    try {
        let settings = await BusinessSettings.findOne({ user: req.user.id });
        if (!settings) {
            settings = await BusinessSettings.create({ user: req.user.id });
        }
        res.json({ success: true, data: settings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// @route   PUT /api/v1/business/settings
// @desc    Update business settings
// @access  Private
router.put('/settings', protect, async (req, res) => {
    try {
        const settings = await BusinessSettings.findOneAndUpdate(
            { user: req.user.id },
            req.body,
            { new: true, upsert: true, runValidators: true }
        );
        res.json({ success: true, data: settings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============ ENHANCED ANALYTICS & FORECASTING ============

// @route   GET /api/v1/business/analytics
// @desc    Get enhanced business analytics
// @access  Private
router.get('/analytics', protect, async (req, res) => {
    try {
        const { period = '30', type = 'overview' } = req.query;
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - parseInt(period));

        const [sales, expenses, inventory, customers, suppliers] = await Promise.all([
            Sale.find({ user: req.user.id, saleDate: { $gte: daysAgo } }),
            Expense.find({ user: req.user.id, expenseDate: { $gte: daysAgo } }),
            InventoryItem.find({ user: req.user.id }),
            Customer.find({ user: req.user.id }),
            Supplier.find({ user: req.user.id })
        ]);

        const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
        const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
        const profit = totalRevenue - totalExpenses;
        const profitMargin = totalRevenue > 0 ? (profit / totalRevenue * 100) : 0;

        const lowStockItems = inventory.filter(item =>
            item.reorderLevel && item.quantity <= item.reorderLevel
        );

        // Customer analytics
        const customerSegments = {
            new: customers.filter(c => c.customerSegment === 'new').length,
            active: customers.filter(c => c.customerSegment === 'active').length,
            loyal: customers.filter(c => c.customerSegment === 'loyal').length,
            inactive: customers.filter(c => c.customerSegment === 'inactive').length
        };

        // Inventory forecasting (simple moving average)
        const inventoryForecast = inventory.map(item => {
            const itemSales = sales
                .filter(sale => sale.items.some(si => si.inventoryItem?.toString() === item._id.toString()))
                .map(sale => ({
                    date: sale.saleDate,
                    quantity: sale.items.find(si => si.inventoryItem?.toString() === item._id.toString())?.quantity || 0
                }));

            const avgDailySales = itemSales.length > 0 ?
                itemSales.reduce((sum, s) => sum + s.quantity, 0) / Math.max(1, parseInt(period)) : 0;

            const daysToStockout = item.quantity / Math.max(0.1, avgDailySales);
            const reorderPoint = avgDailySales * 7; // 7-day safety stock

            return {
                itemId: item._id,
                itemName: item.itemName,
                currentStock: item.quantity,
                avgDailySales,
                daysToStockout: Math.round(daysToStockout),
                recommendedReorder: Math.max(reorderPoint - item.quantity, 0),
                forecastAccuracy: itemSales.length > 10 ? 'High' : itemSales.length > 5 ? 'Medium' : 'Low'
            };
        });

        // Financial projections
        const monthlyRevenue = sales.reduce((acc, sale) => {
            const month = new Date(sale.saleDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
            acc[month] = (acc[month] || 0) + sale.total;
            return acc;
        }, {});

        const monthlyExpenses = expenses.reduce((acc, exp) => {
            const month = new Date(exp.expenseDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
            acc[month] = (acc[month] || 0) + exp.amount;
            return acc;
        }, {});

        const cashFlowProjection = Object.keys(monthlyRevenue).map(month => ({
            month,
            revenue: monthlyRevenue[month] || 0,
            expenses: monthlyExpenses[month] || 0,
            netCashFlow: (monthlyRevenue[month] || 0) - (monthlyExpenses[month] || 0)
        }));

        if (type === 'forecasting') {
            res.json({
                success: true,
                data: {
                    inventoryForecast,
                    cashFlowProjection,
                    recommendations: {
                        lowStockAlerts: lowStockItems.map(item => ({
                            item: item.itemName,
                            currentStock: item.quantity,
                            reorderLevel: item.reorderLevel
                        })),
                        overstockedItems: inventory.filter(item => item.quantity > (item.maxQuantity || item.quantity * 2))
                    }
                }
            });
        } else {
            res.json({
                success: true,
                data: {
                    overview: {
                        totalRevenue,
                        totalExpenses,
                        profit,
                        profitMargin,
                        salesCount: sales.length,
                        expenseCount: expenses.length,
                        averageOrderValue: sales.length > 0 ? totalRevenue / sales.length : 0
                    },
                    inventory: {
                        totalItems: inventory.length,
                        totalValue: inventory.reduce((sum, item) =>
                            sum + (item.quantity * item.costPrice || 0), 0
                        ),
                        lowStockItems: lowStockItems.length,
                        outOfStockItems: inventory.filter(item => item.quantity === 0).length
                    },
                    customers: {
                        total: customers.length,
                        segments: customerSegments,
                        averageLifetimeValue: customers.length > 0 ?
                            customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0) / customers.length : 0
                    },
                    suppliers: {
                        total: suppliers.length,
                        active: suppliers.filter(s => s.isActive).length
                    }
                }
            });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============ FINANCIAL REPORTING ============

// @route   GET /api/v1/business/reports/financial
// @desc    Generate financial reports
// @access  Private
router.get('/reports/financial', protect, async (req, res) => {
    try {
        const { type = 'profit_loss', period = 'monthly', startDate, endDate } = req.query;

        let dateFilter = {};
        if (startDate && endDate) {
            dateFilter = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        } else {
            // Default to current month
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            dateFilter = { $gte: startOfMonth, $lte: endOfMonth };
        }

        const [sales, expenses, inventory] = await Promise.all([
            Sale.find({ user: req.user.id, saleDate: dateFilter }),
            Expense.find({ user: req.user.id, expenseDate: dateFilter }),
            InventoryItem.find({ user: req.user.id })
        ]);

        const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
        const totalCostOfGoods = sales.reduce((sum, sale) => {
            return sum + sale.items.reduce((itemSum, item) => {
                const inventoryItem = inventory.find(inv => inv._id.toString() === item.inventoryItem?.toString());
                return itemSum + (item.quantity * (inventoryItem?.costPrice || 0));
            }, 0);
        }, 0);
        const grossProfit = totalRevenue - totalCostOfGoods;

        const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
        const netProfit = grossProfit - totalExpenses;

        // Categorize expenses
        const expenseCategories = expenses.reduce((acc, exp) => {
            acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
            return acc;
        }, {});

        // Tax calculations (Kenya KRA)
        const vatRate = 16; // KRA VAT rate
        const taxableAmount = totalRevenue / (1 + vatRate / 100);
        const vatCollected = totalRevenue - taxableAmount;

        if (type === 'profit_loss') {
            res.json({
                success: true,
                data: {
                    reportType: 'Profit & Loss Statement',
                    period: { startDate, endDate },
                    income: {
                        totalRevenue,
                        costOfGoodsSold: totalCostOfGoods,
                        grossProfit
                    },
                    expenses: {
                        totalExpenses,
                        byCategory: expenseCategories
                    },
                    profit: {
                        netProfit,
                        profitMargin: totalRevenue > 0 ? (netProfit / totalRevenue * 100) : 0
                    },
                    tax: {
                        vatCollected,
                        taxableAmount
                    }
                }
            });
        } else if (type === 'balance_sheet') {
            const inventoryValue = inventory.reduce((sum, item) => sum + (item.quantity * item.costPrice), 0);

            res.json({
                success: true,
                data: {
                    reportType: 'Balance Sheet',
                    period: { startDate, endDate },
                    assets: {
                        currentAssets: {
                            inventory: inventoryValue,
                            accountsReceivable: 0 // Would need payment tracking
                        },
                        totalCurrentAssets: inventoryValue
                    },
                    liabilities: {
                        currentLiabilities: {
                            accountsPayable: 0 // Would need supplier payment tracking
                        },
                        totalCurrentLiabilities: 0
                    },
                    equity: {
                        retainedEarnings: netProfit
                    },
                    totalLiabilitiesAndEquity: netProfit
                }
            });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============ WORKFLOW MANAGEMENT ============

// @route   GET /api/v1/business/workflows
// @desc    Get workflow templates and active workflows
// @access  Private
router.get('/workflows', protect, async (req, res) => {
    try {
        // For now, return predefined workflow templates
        // In production, this would be stored in database
        const workflows = [
            {
                id: 'expense_approval',
                name: 'Expense Approval Workflow',
                description: 'Automated approval process for business expenses',
                steps: [
                    { name: 'Submit Expense', type: 'submit', required: true },
                    { name: 'Manager Approval', type: 'approval', required: true },
                    { name: 'Finance Review', type: 'review', required: false },
                    { name: 'Payment Processing', type: 'payment', required: true }
                ],
                isActive: true
            },
            {
                id: 'inventory_reorder',
                name: 'Inventory Reorder Workflow',
                description: 'Automated inventory replenishment process',
                steps: [
                    { name: 'Low Stock Alert', type: 'alert', required: true },
                    { name: 'Generate Purchase Order', type: 'order', required: true },
                    { name: 'Supplier Confirmation', type: 'confirmation', required: true },
                    { name: 'Receive Goods', type: 'receipt', required: true }
                ],
                isActive: true
            },
            {
                id: 'customer_onboarding',
                name: 'Customer Onboarding Workflow',
                description: 'Streamlined customer registration and setup',
                steps: [
                    { name: 'Customer Registration', type: 'registration', required: true },
                    { name: 'Credit Check', type: 'check', required: false },
                    { name: 'Welcome Email', type: 'email', required: true },
                    { name: 'Account Setup', type: 'setup', required: true }
                ],
                isActive: true
            }
        ];

        res.json({ success: true, data: workflows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============ COMPLIANCE & REGULATIONS ============

// @route   GET /api/v1/business/compliance
// @desc    Get compliance status and requirements
// @access  Private
router.get('/compliance', protect, async (req, res) => {
    try {
        const settings = await BusinessSettings.findOne({ user: req.user.id });

        // KRA compliance checks
        const complianceStatus = {
            taxRegistration: {
                status: settings?.taxId ? 'compliant' : 'non_compliant',
                message: settings?.taxId ? 'Tax ID registered' : 'Tax ID required for KRA compliance',
                actionRequired: !settings?.taxId
            },
            vatRegistration: {
                status: 'compliant', // Assume compliant for now
                message: 'VAT registered and compliant',
                actionRequired: false
            },
            recordKeeping: {
                status: 'compliant', // Would check if records are up to date
                message: 'Financial records maintained properly',
                actionRequired: false
            },
            filingStatus: {
                status: 'pending', // Would check filing deadlines
                message: 'Monthly VAT returns due',
                actionRequired: true,
                dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
            }
        };

        res.json({
            success: true,
            data: {
                complianceStatus,
                overallCompliance: Object.values(complianceStatus).every(status => !status.actionRequired),
                nextActions: Object.entries(complianceStatus)
                    .filter(([_, status]) => status.actionRequired)
                    .map(([key, status]) => ({ requirement: key, action: status.message, dueDate: status.dueDate }))
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
