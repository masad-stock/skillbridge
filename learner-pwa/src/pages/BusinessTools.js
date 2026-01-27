import React, { useState, useEffect, useMemo } from 'react';
import { Container, Row, Col, Card, Button, Form, Table, Modal, Alert, Badge, Tabs, Tab, ProgressBar, Dropdown, InputGroup, ButtonGroup } from 'react-bootstrap';
import { useUser } from '../context/UserContext';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import InventoryForecast from '../components/InventoryForecast';
import FinancialReports from '../components/FinancialReports';
import WorkflowManager from '../components/WorkflowManager';
import BIDashboard from '../components/BIDashboard';
import ComplianceManager from '../components/ComplianceManager';
import './BusinessTools.css';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

function BusinessTools() {
    const { isOnline } = useUser();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showSaleModal, setShowSaleModal] = useState(false);
    const [showExpenseModal, setShowExpenseModal] = useState(false);
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [dateRange, setDateRange] = useState('30');
    const [inventory, setInventory] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [sales, setSales] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [newItem, setNewItem] = useState({
        name: '',
        quantity: 0,
        costPrice: 0,
        sellingPrice: 0,
        category: '',
        reorderLevel: 5,
        sku: '',
        barcode: '',
        unit: 'pieces',
        supplier: '',
        expiryDate: '',
        description: ''
    });
    const [newCustomer, setNewCustomer] = useState({
        name: '',
        phone: '',
        email: '',
        location: '',
        customerType: 'retail',
        address: '',
        taxId: '',
        creditLimit: 0,
        notes: ''
    });
    const [newSale, setNewSale] = useState({
        customer: '',
        items: [],
        paymentMethod: 'cash',
        discount: 0,
        discountType: 'fixed',
        tax: 0,
        notes: '',
        paymentStatus: 'paid'
    });
    const [newExpense, setNewExpense] = useState({
        category: '',
        description: '',
        amount: 0,
        paymentMethod: 'cash',
        vendor: '',
        receipt: '',
        taxAmount: 0,
        recurring: false
    });
    const [saleItems, setSaleItems] = useState([{ itemId: '', quantity: 1, price: 0 }]);

    // Load data from localStorage on component mount
    useEffect(() => {
        const savedInventory = localStorage.getItem('businessInventory');
        const savedCustomers = localStorage.getItem('businessCustomers');
        const savedSales = localStorage.getItem('businessSales');
        const savedExpenses = localStorage.getItem('businessExpenses');

        if (savedInventory) setInventory(JSON.parse(savedInventory));
        if (savedCustomers) setCustomers(JSON.parse(savedCustomers));
        if (savedSales) setSales(JSON.parse(savedSales));
        if (savedExpenses) setExpenses(JSON.parse(savedExpenses));
    }, []);

    // Advanced Analytics - Memoized calculations
    const analytics = useMemo(() => {
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - parseInt(dateRange));

        const filteredSales = sales.filter(s => new Date(s.saleDate) >= daysAgo);
        const filteredExpenses = expenses.filter(e => new Date(e.expenseDate) >= daysAgo);

        const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
        const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
        const profit = totalRevenue - totalExpenses;
        const profitMargin = totalRevenue > 0 ? (profit / totalRevenue * 100) : 0;

        // Sales by day for chart
        const salesByDay = {};
        filteredSales.forEach(sale => {
            const date = new Date(sale.saleDate).toLocaleDateString();
            salesByDay[date] = (salesByDay[date] || 0) + sale.total;
        });

        // Top selling products
        const productSales = {};
        filteredSales.forEach(sale => {
            sale.items.forEach(item => {
                if (!productSales[item.itemName]) {
                    productSales[item.itemName] = { quantity: 0, revenue: 0 };
                }
                productSales[item.itemName].quantity += item.quantity;
                productSales[item.itemName].revenue += item.total;
            });
        });

        const topProducts = Object.entries(productSales)
            .sort((a, b) => b[1].revenue - a[1].revenue)
            .slice(0, 5);

        // Customer segments
        const customerSegments = {
            new: customers.filter(c => c.totalPurchases === 0).length,
            active: customers.filter(c => c.totalPurchases > 0 && c.totalPurchases < 5).length,
            loyal: customers.filter(c => c.totalPurchases >= 5).length
        };

        // Expense categories
        const expenseByCategory = {};
        filteredExpenses.forEach(exp => {
            expenseByCategory[exp.category] = (expenseByCategory[exp.category] || 0) + exp.amount;
        });

        // Inventory health
        const lowStockItems = inventory.filter(item => item.quantity <= item.reorderLevel);
        const outOfStockItems = inventory.filter(item => item.quantity === 0);
        const inventoryValue = inventory.reduce((sum, item) => sum + (item.quantity * item.costPrice), 0);
        const potentialRevenue = inventory.reduce((sum, item) => sum + (item.quantity * item.sellingPrice), 0);

        return {
            totalRevenue,
            totalExpenses,
            profit,
            profitMargin,
            salesByDay,
            topProducts,
            customerSegments,
            expenseByCategory,
            lowStockItems,
            outOfStockItems,
            inventoryValue,
            potentialRevenue,
            averageOrderValue: filteredSales.length > 0 ? totalRevenue / filteredSales.length : 0,
            salesCount: filteredSales.length,
            expenseCount: filteredExpenses.length
        };
    }, [sales, expenses, inventory, customers, dateRange]);

    // Save data to localStorage whenever state changes
    useEffect(() => {
        localStorage.setItem('businessInventory', JSON.stringify(inventory));
    }, [inventory]);

    useEffect(() => {
        localStorage.setItem('businessCustomers', JSON.stringify(customers));
    }, [customers]);

    useEffect(() => {
        localStorage.setItem('businessSales', JSON.stringify(sales));
    }, [sales]);

    useEffect(() => {
        localStorage.setItem('businessExpenses', JSON.stringify(expenses));
    }, [expenses]);

    const addInventoryItem = () => {
        if (newItem.name && newItem.quantity >= 0 && newItem.sellingPrice >= 0) {
            const item = {
                id: Date.now(),
                ...newItem,
                dateAdded: new Date().toISOString(),
                lastUpdated: new Date().toISOString()
            };
            setInventory([...inventory, item]);
            setNewItem({ name: '', quantity: 0, costPrice: 0, sellingPrice: 0, category: '', reorderLevel: 5 });
            setShowAddModal(false);
        }
    };

    const addCustomer = () => {
        if (newCustomer.name && newCustomer.phone) {
            const customer = {
                id: Date.now(),
                ...newCustomer,
                dateAdded: new Date().toISOString(),
                totalPurchases: 0,
                totalSpent: 0,
                lastPurchase: null
            };
            setCustomers([...customers, customer]);
            setNewCustomer({ name: '', phone: '', email: '', location: '', customerType: 'retail' });
            setShowAddModal(false);
        }
    };

    const addSale = () => {
        const items = saleItems.filter(item => item.itemId && item.quantity > 0);
        if (items.length === 0) return;

        const saleDetails = items.map(item => {
            const inventoryItem = inventory.find(inv => inv.id === parseInt(item.itemId));
            return {
                itemId: item.itemId,
                itemName: inventoryItem?.name || 'Unknown',
                quantity: item.quantity,
                unitPrice: item.price || inventoryItem?.sellingPrice || 0,
                total: item.quantity * (item.price || inventoryItem?.sellingPrice || 0)
            };
        });

        const subtotal = saleDetails.reduce((sum, item) => sum + item.total, 0);
        const total = subtotal - (newSale.discount || 0);

        const sale = {
            id: Date.now(),
            customer: newSale.customer,
            customerName: customers.find(c => c.id === parseInt(newSale.customer))?.name || 'Walk-in Customer',
            items: saleDetails,
            subtotal,
            discount: newSale.discount || 0,
            total,
            paymentMethod: newSale.paymentMethod,
            saleDate: new Date().toISOString()
        };

        // Update inventory
        items.forEach(item => {
            updateInventoryQuantity(parseInt(item.itemId),
                inventory.find(inv => inv.id === parseInt(item.itemId))?.quantity - item.quantity
            );
        });

        // Update customer stats
        if (newSale.customer) {
            const customer = customers.find(c => c.id === parseInt(newSale.customer));
            if (customer) {
                setCustomers(customers.map(c =>
                    c.id === parseInt(newSale.customer)
                        ? { ...c, totalPurchases: c.totalPurchases + 1, totalSpent: c.totalSpent + total, lastPurchase: new Date().toISOString() }
                        : c
                ));
            }
        }

        setSales([sale, ...sales]);
        setNewSale({ customer: '', items: [], paymentMethod: 'cash', discount: 0 });
        setSaleItems([{ itemId: '', quantity: 1, price: 0 }]);
        setShowSaleModal(false);
    };

    const addExpense = () => {
        if (newExpense.category && newExpense.description && newExpense.amount > 0) {
            const expense = {
                id: Date.now(),
                ...newExpense,
                expenseDate: new Date().toISOString()
            };
            setExpenses([expense, ...expenses]);
            setNewExpense({ category: '', description: '', amount: 0, paymentMethod: 'cash', vendor: '' });
            setShowExpenseModal(false);
        }
    };

    const updateInventoryQuantity = (id, newQuantity) => {
        setInventory(inventory.map(item =>
            item.id === id
                ? { ...item, quantity: newQuantity, lastUpdated: new Date().toISOString() }
                : item
        ));
    };

    const deleteInventoryItem = (id) => {
        setInventory(inventory.filter(item => item.id !== id));
    };

    const deleteCustomer = (id) => {
        setCustomers(customers.filter(customer => customer.id !== id));
    };

    const calculateTotalValue = () => {
        return inventory.reduce((total, item) => total + (item.quantity * (item.costPrice || 0)), 0);
    };

    const calculateTotalRevenue = () => {
        return sales.reduce((total, sale) => total + sale.total, 0);
    };

    const calculateTotalExpenses = () => {
        return expenses.reduce((total, expense) => total + expense.amount, 0);
    };

    const calculateProfit = () => {
        return calculateTotalRevenue() - calculateTotalExpenses();
    };

    const getLowStockItems = () => {
        return inventory.filter(item => item.quantity <= (item.reorderLevel || 5));
    };

    const getTopCategories = () => {
        const categories = {};
        inventory.forEach(item => {
            if (item.category) {
                categories[item.category] = (categories[item.category] || 0) + item.quantity;
            }
        });
        return Object.entries(categories).sort((a, b) => b[1] - a[1]).slice(0, 5);
    };

    // Export data to CSV
    const exportToCSV = (data, filename) => {
        if (data.length === 0) {
            alert('No data to export');
            return;
        }

        const headers = Object.keys(data[0]).join(',');
        const rows = data.map(row =>
            Object.values(row).map(val =>
                typeof val === 'string' && val.includes(',') ? `"${val}"` : val
            ).join(',')
        );

        const csv = [headers, ...rows].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    // Generate invoice PDF (simplified - would use jsPDF in production)
    const generateInvoice = (sale) => {
        const invoiceWindow = window.open('', '_blank');
        const customer = customers.find(c => c.id === parseInt(sale.customer));

        invoiceWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Invoice #${sale.id}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 40px; }
                    .header { text-align: center; margin-bottom: 30px; }
                    .invoice-details { margin-bottom: 20px; }
                    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
                    th { background-color: #f8f9fa; font-weight: bold; }
                    .total-row { font-weight: bold; font-size: 1.2em; }
                    .footer { margin-top: 40px; text-align: center; color: #666; }
                    @media print { button { display: none; } }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>INVOICE</h1>
                    <p>Invoice #${sale.id}</p>
                    <p>Date: ${new Date(sale.saleDate).toLocaleDateString()}</p>
                </div>
                <div class="invoice-details">
                    <h3>Customer Information</h3>
                    <p><strong>Name:</strong> ${sale.customerName}</p>
                    ${customer ? `
                        <p><strong>Phone:</strong> ${customer.phone}</p>
                        <p><strong>Email:</strong> ${customer.email || 'N/A'}</p>
                        <p><strong>Location:</strong> ${customer.location || 'N/A'}</p>
                    ` : ''}
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th>Quantity</th>
                            <th>Unit Price</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${sale.items.map(item => `
                            <tr>
                                <td>${item.itemName}</td>
                                <td>${item.quantity}</td>
                                <td>KSh ${item.unitPrice.toLocaleString()}</td>
                                <td>KSh ${item.total.toLocaleString()}</td>
                            </tr>
                        `).join('')}
                        <tr>
                            <td colspan="3" style="text-align: right;"><strong>Subtotal:</strong></td>
                            <td><strong>KSh ${sale.subtotal.toLocaleString()}</strong></td>
                        </tr>
                        ${sale.discount > 0 ? `
                            <tr>
                                <td colspan="3" style="text-align: right;">Discount:</td>
                                <td>- KSh ${sale.discount.toLocaleString()}</td>
                            </tr>
                        ` : ''}
                        <tr class="total-row">
                            <td colspan="3" style="text-align: right;">TOTAL:</td>
                            <td>KSh ${sale.total.toLocaleString()}</td>
                        </tr>
                    </tbody>
                </table>
                <div class="footer">
                    <p>Payment Method: ${sale.paymentMethod.toUpperCase()}</p>
                    <p>Thank you for your business!</p>
                    <button onclick="window.print()" style="padding: 10px 20px; margin-top: 20px; cursor: pointer;">Print Invoice</button>
                </div>
            </body>
            </html>
        `);
        invoiceWindow.document.close();
    };

    // Backup all data
    const backupData = () => {
        const backup = {
            inventory,
            customers,
            sales,
            expenses,
            timestamp: new Date().toISOString()
        };
        const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `business_backup_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    // Restore data from backup
    const restoreData = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const backup = JSON.parse(e.target.result);
                if (window.confirm('This will replace all current data. Continue?')) {
                    setInventory(backup.inventory || []);
                    setCustomers(backup.customers || []);
                    setSales(backup.sales || []);
                    setExpenses(backup.expenses || []);
                    alert('Data restored successfully!');
                }
            } catch (error) {
                alert('Invalid backup file');
            }
        };
        reader.readAsText(file);
    };

    const tools = [
        {
            id: 'dashboard',
            title: 'Dashboard',
            icon: '📊',
            description: 'Overview of your business performance',
            color: 'primary'
        },
        {
            id: 'inventory',
            title: 'Inventory Management',
            icon: '📦',
            description: 'Track your products, prices, and quantities',
            color: 'success'
        },
        {
            id: 'forecasting',
            title: 'Inventory Forecasting',
            icon: '🔮',
            description: 'AI-powered demand prediction and stock optimization',
            color: 'info'
        },
        {
            id: 'customers',
            title: 'Customer Management',
            icon: '👥',
            description: 'Store and manage customer information',
            color: 'primary'
        },
        {
            id: 'sales',
            title: 'Sales & Invoicing',
            icon: '💰',
            description: 'Record sales and generate invoices',
            color: 'warning'
        },
        {
            id: 'expenses',
            title: 'Expense Tracking',
            icon: '💸',
            description: 'Track business expenses and costs',
            color: 'danger'
        },
        {
            id: 'reports',
            title: 'Financial Reports',
            icon: '📊',
            description: 'Comprehensive financial statements',
            color: 'success'
        },
        {
            id: 'workflows',
            title: 'Workflow Automation',
            icon: '🔄',
            description: 'Streamline business processes',
            color: 'secondary'
        },
        {
            id: 'analytics',
            title: 'Business Intelligence',
            icon: '📈',
            description: 'Advanced analytics and predictive insights',
            color: 'info'
        },
        {
            id: 'compliance',
            title: 'Compliance & Regulations',
            icon: '⚖️',
            description: 'KRA tax compliance and business regulations',
            color: 'warning'
        }
    ];

    // Dashboard render function
    const renderDashboard = () => {
        // Chart data
        const salesChartData = {
            labels: Object.keys(analytics.salesByDay).slice(-7),
            datasets: [{
                label: 'Daily Revenue (KSh)',
                data: Object.values(analytics.salesByDay).slice(-7),
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                fill: true,
                tension: 0.4
            }]
        };

        const expenseCategoryData = {
            labels: Object.keys(analytics.expenseByCategory),
            datasets: [{
                label: 'Expenses by Category',
                data: Object.values(analytics.expenseByCategory),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.8)',
                    'rgba(54, 162, 235, 0.8)',
                    'rgba(255, 206, 86, 0.8)',
                    'rgba(75, 192, 192, 0.8)',
                    'rgba(153, 102, 255, 0.8)',
                ],
            }]
        };

        const customerSegmentData = {
            labels: ['New', 'Active', 'Loyal'],
            datasets: [{
                data: [
                    analytics.customerSegments.new,
                    analytics.customerSegments.active,
                    analytics.customerSegments.loyal
                ],
                backgroundColor: [
                    'rgba(255, 206, 86, 0.8)',
                    'rgba(54, 162, 235, 0.8)',
                    'rgba(75, 192, 192, 0.8)',
                ],
            }]
        };

        return (
            <div>
                {/* Header with date range selector */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h4 className="fw-bold mb-2">Business Dashboard</h4>
                        <p className="text-muted">Real-time overview of your business performance</p>
                    </div>
                    <div className="d-flex gap-2">
                        <Form.Select
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value)}
                            style={{ width: 'auto' }}
                        >
                            <option value="7">Last 7 days</option>
                            <option value="30">Last 30 days</option>
                            <option value="90">Last 90 days</option>
                            <option value="365">Last year</option>
                        </Form.Select>
                        <Dropdown>
                            <Dropdown.Toggle variant="outline-primary">
                                Actions
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                                <Dropdown.Item onClick={backupData}>
                                    💾 Backup Data
                                </Dropdown.Item>
                                <Dropdown.Item onClick={() => document.getElementById('restore-input').click()}>
                                    📥 Restore Data
                                </Dropdown.Item>
                                <Dropdown.Divider />
                                <Dropdown.Item onClick={() => exportToCSV(inventory, 'inventory')}>
                                    📦 Export Inventory
                                </Dropdown.Item>
                                <Dropdown.Item onClick={() => exportToCSV(sales, 'sales')}>
                                    💰 Export Sales
                                </Dropdown.Item>
                                <Dropdown.Item onClick={() => exportToCSV(expenses, 'expenses')}>
                                    💸 Export Expenses
                                </Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                        <input
                            type="file"
                            id="restore-input"
                            accept=".json"
                            onChange={restoreData}
                            style={{ display: 'none' }}
                        />
                    </div>
                </div>

                {/* Key Metrics */}
                <Row className="mb-4">
                    <Col lg={3} md={6} className="mb-3">
                        <Card className="border-0 shadow-sm h-100">
                            <Card.Body>
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                    <div>
                                        <p className="text-muted small mb-1">Total Revenue</p>
                                        <h3 className="fw-bold text-success mb-0">
                                            KSh {analytics.totalRevenue.toLocaleString()}
                                        </h3>
                                    </div>
                                    <div className="fs-2">💰</div>
                                </div>
                                <small className="text-muted">
                                    {analytics.salesCount} sales • Avg: KSh {analytics.averageOrderValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                </small>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col lg={3} md={6} className="mb-3">
                        <Card className="border-0 shadow-sm h-100">
                            <Card.Body>
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                    <div>
                                        <p className="text-muted small mb-1">Total Expenses</p>
                                        <h3 className="fw-bold text-danger mb-0">
                                            KSh {analytics.totalExpenses.toLocaleString()}
                                        </h3>
                                    </div>
                                    <div className="fs-2">💸</div>
                                </div>
                                <small className="text-muted">
                                    {analytics.expenseCount} transactions
                                </small>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col lg={3} md={6} className="mb-3">
                        <Card className="border-0 shadow-sm h-100">
                            <Card.Body>
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                    <div>
                                        <p className="text-muted small mb-1">Net Profit</p>
                                        <h3 className={`fw-bold mb-0 ${analytics.profit >= 0 ? 'text-success' : 'text-danger'}`}>
                                            KSh {analytics.profit.toLocaleString()}
                                        </h3>
                                    </div>
                                    <div className="fs-2">{analytics.profit >= 0 ? '📈' : '📉'}</div>
                                </div>
                                <small className="text-muted">
                                    Margin: {analytics.profitMargin.toFixed(1)}%
                                </small>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col lg={3} md={6} className="mb-3">
                        <Card className="border-0 shadow-sm h-100">
                            <Card.Body>
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                    <div>
                                        <p className="text-muted small mb-1">Inventory Value</p>
                                        <h3 className="fw-bold text-primary mb-0">
                                            KSh {analytics.inventoryValue.toLocaleString()}
                                        </h3>
                                    </div>
                                    <div className="fs-2">📦</div>
                                </div>
                                <small className="text-muted">
                                    {inventory.length} products
                                </small>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                {/* Alerts */}
                {analytics.lowStockItems.length > 0 && (
                    <Alert variant="warning" className="mb-4">
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <strong>⚠️ Low Stock Alert:</strong> {analytics.lowStockItems.length} items need restocking
                            </div>
                            <Button variant="warning" size="sm" onClick={() => setActiveTab('inventory')}>
                                View Items
                            </Button>
                        </div>
                    </Alert>
                )}

                {analytics.outOfStockItems.length > 0 && (
                    <Alert variant="danger" className="mb-4">
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <strong>🚨 Out of Stock:</strong> {analytics.outOfStockItems.length} items are completely out of stock
                            </div>
                            <Button variant="danger" size="sm" onClick={() => setActiveTab('inventory')}>
                                Restock Now
                            </Button>
                        </div>
                    </Alert>
                )}

                {/* Charts */}
                <Row className="mb-4">
                    <Col lg={8} className="mb-4">
                        <Card className="border-0 shadow-sm h-100">
                            <Card.Header className="bg-white border-0 pt-3">
                                <h6 className="fw-bold mb-0">Revenue Trend</h6>
                            </Card.Header>
                            <Card.Body>
                                {Object.keys(analytics.salesByDay).length > 0 ? (
                                    <Line data={salesChartData} options={{ responsive: true, maintainAspectRatio: true }} />
                                ) : (
                                    <div className="text-center py-5 text-muted">
                                        <p>No sales data available</p>
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col lg={4} className="mb-4">
                        <Card className="border-0 shadow-sm h-100">
                            <Card.Header className="bg-white border-0 pt-3">
                                <h6 className="fw-bold mb-0">Customer Segments</h6>
                            </Card.Header>
                            <Card.Body>
                                {customers.length > 0 ? (
                                    <Doughnut data={customerSegmentData} options={{ responsive: true, maintainAspectRatio: true }} />
                                ) : (
                                    <div className="text-center py-5 text-muted">
                                        <p>No customer data</p>
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                <Row>
                    <Col lg={6} className="mb-4">
                        <Card className="border-0 shadow-sm">
                            <Card.Header className="bg-white border-0 pt-3">
                                <h6 className="fw-bold mb-0">Top Selling Products</h6>
                            </Card.Header>
                            <Card.Body>
                                {analytics.topProducts.length > 0 ? (
                                    <div>
                                        {analytics.topProducts.map(([name, data], index) => (
                                            <div key={name} className="mb-3">
                                                <div className="d-flex justify-content-between align-items-center mb-1">
                                                    <span className="fw-bold">{index + 1}. {name}</span>
                                                    <Badge bg="success">KSh {data.revenue.toLocaleString()}</Badge>
                                                </div>
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <small className="text-muted">{data.quantity} units sold</small>
                                                    <ProgressBar
                                                        now={(data.revenue / analytics.topProducts[0][1].revenue) * 100}
                                                        style={{ width: '60%', height: '8px' }}
                                                        variant="success"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-4 text-muted">
                                        <p>No sales data available</p>
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col lg={6} className="mb-4">
                        <Card className="border-0 shadow-sm">
                            <Card.Header className="bg-white border-0 pt-3">
                                <h6 className="fw-bold mb-0">Expense Breakdown</h6>
                            </Card.Header>
                            <Card.Body>
                                {Object.keys(analytics.expenseByCategory).length > 0 ? (
                                    <Bar
                                        data={expenseCategoryData}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: true,
                                            plugins: { legend: { display: false } }
                                        }}
                                    />
                                ) : (
                                    <div className="text-center py-5 text-muted">
                                        <p>No expense data available</p>
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                {/* Quick Actions */}
                <Card className="border-0 shadow-sm">
                    <Card.Header className="bg-white border-0 pt-3">
                        <h6 className="fw-bold mb-0">Quick Actions</h6>
                    </Card.Header>
                    <Card.Body>
                        <Row>
                            <Col md={3} className="mb-2">
                                <Button variant="primary" className="w-100" onClick={() => setShowSaleModal(true)}>
                                    💰 New Sale
                                </Button>
                            </Col>
                            <Col md={3} className="mb-2">
                                <Button variant="success" className="w-100" onClick={() => { setActiveTab('inventory'); setShowAddModal(true); }}>
                                    📦 Add Product
                                </Button>
                            </Col>
                            <Col md={3} className="mb-2">
                                <Button variant="info" className="w-100" onClick={() => { setActiveTab('customers'); setShowAddModal(true); }}>
                                    👤 Add Customer
                                </Button>
                            </Col>
                            <Col md={3} className="mb-2">
                                <Button variant="danger" className="w-100" onClick={() => setShowExpenseModal(true)}>
                                    💸 Add Expense
                                </Button>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>
            </div>
        );
    };

    const renderInventoryTab = () => {
        // Filter and search inventory
        const filteredInventory = inventory.filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (item.sku && item.sku.toLowerCase().includes(searchTerm.toLowerCase()));
            const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
            return matchesSearch && matchesCategory;
        });

        const categories = [...new Set(inventory.map(item => item.category).filter(Boolean))];

        return (
            <div>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h4 className="fw-bold mb-2">Inventory Management</h4>
                        <p className="text-muted">Track products, stock levels, and pricing</p>
                    </div>
                    <ButtonGroup>
                        <Button
                            variant="primary"
                            onClick={() => {
                                setNewItem({
                                    name: '', quantity: 0, costPrice: 0, sellingPrice: 0,
                                    category: '', reorderLevel: 5, sku: '', barcode: '',
                                    unit: 'pieces', supplier: '', expiryDate: '', description: ''
                                });
                                setShowAddModal(true);
                            }}
                        >
                            ➕ Add Product
                        </Button>
                        <Button variant="outline-primary" onClick={() => exportToCSV(inventory, 'inventory')}>
                            📥 Export
                        </Button>
                    </ButtonGroup>
                </div>

                {/* Summary Cards */}
                <Row className="mb-4">
                    <Col lg={3} md={6} className="mb-3">
                        <Card className="border-0 shadow-sm">
                            <Card.Body>
                                <div className="d-flex justify-content-between">
                                    <div>
                                        <p className="text-muted small mb-1">Total Products</p>
                                        <h4 className="fw-bold mb-0">{inventory.length}</h4>
                                    </div>
                                    <div className="fs-2">📦</div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col lg={3} md={6} className="mb-3">
                        <Card className="border-0 shadow-sm">
                            <Card.Body>
                                <div className="d-flex justify-content-between">
                                    <div>
                                        <p className="text-muted small mb-1">Inventory Value</p>
                                        <h4 className="fw-bold text-success mb-0">
                                            KSh {calculateTotalValue().toLocaleString()}
                                        </h4>
                                    </div>
                                    <div className="fs-2">💰</div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col lg={3} md={6} className="mb-3">
                        <Card className="border-0 shadow-sm">
                            <Card.Body>
                                <div className="d-flex justify-content-between">
                                    <div>
                                        <p className="text-muted small mb-1">Low Stock</p>
                                        <h4 className="fw-bold text-warning mb-0">{getLowStockItems().length}</h4>
                                    </div>
                                    <div className="fs-2">⚠️</div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col lg={3} md={6} className="mb-3">
                        <Card className="border-0 shadow-sm">
                            <Card.Body>
                                <div className="d-flex justify-content-between">
                                    <div>
                                        <p className="text-muted small mb-1">Potential Revenue</p>
                                        <h4 className="fw-bold text-primary mb-0">
                                            KSh {inventory.reduce((sum, item) => sum + (item.quantity * item.sellingPrice), 0).toLocaleString()}
                                        </h4>
                                    </div>
                                    <div className="fs-2">📈</div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                {/* Search and Filter */}
                <Card className="border-0 shadow-sm mb-4">
                    <Card.Body>
                        <Row>
                            <Col md={6}>
                                <InputGroup>
                                    <InputGroup.Text>🔍</InputGroup.Text>
                                    <Form.Control
                                        placeholder="Search by name or SKU..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </InputGroup>
                            </Col>
                            <Col md={4}>
                                <Form.Select
                                    value={filterCategory}
                                    onChange={(e) => setFilterCategory(e.target.value)}
                                >
                                    <option value="all">All Categories</option>
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </Form.Select>
                            </Col>
                            <Col md={2}>
                                <Button
                                    variant="outline-secondary"
                                    className="w-100"
                                    onClick={() => { setSearchTerm(''); setFilterCategory('all'); }}
                                >
                                    Clear
                                </Button>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>

                {/* Inventory Table */}
                <Card className="border-0 shadow-sm">
                    <Card.Body>
                        {inventory.length === 0 ? (
                            <div className="text-center py-5">
                                <div className="fs-1 mb-3">📦</div>
                                <h5 className="fw-bold mb-2">No Products Yet</h5>
                                <p className="text-muted mb-3">Start by adding your first product to track inventory</p>
                                <Button variant="primary" onClick={() => setShowAddModal(true)}>
                                    Add First Product
                                </Button>
                            </div>
                        ) : filteredInventory.length === 0 ? (
                            <div className="text-center py-5">
                                <div className="fs-1 mb-3">🔍</div>
                                <h5 className="fw-bold mb-2">No Results Found</h5>
                                <p className="text-muted mb-3">Try adjusting your search or filters</p>
                            </div>
                        ) : (
                            <Table responsive hover>
                                <thead className="bg-light">
                                    <tr>
                                        <th>Product</th>
                                        <th>SKU</th>
                                        <th>Category</th>
                                        <th>Stock</th>
                                        <th>Cost Price</th>
                                        <th>Selling Price</th>
                                        <th>Value</th>
                                        <th>Margin</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredInventory.map(item => {
                                        const margin = item.sellingPrice > 0 ?
                                            ((item.sellingPrice - item.costPrice) / item.sellingPrice * 100) : 0;
                                        return (
                                            <tr key={item.id}>
                                                <td>
                                                    <div className="fw-bold">{item.name}</div>
                                                    {item.description && (
                                                        <small className="text-muted">{item.description}</small>
                                                    )}
                                                </td>
                                                <td>
                                                    <small className="text-muted">{item.sku || '-'}</small>
                                                </td>
                                                <td>
                                                    {item.category && (
                                                        <Badge bg="secondary">{item.category}</Badge>
                                                    )}
                                                </td>
                                                <td>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <Form.Control
                                                            type="number"
                                                            size="sm"
                                                            style={{ width: '70px' }}
                                                            value={item.quantity}
                                                            onChange={(e) => updateInventoryQuantity(item.id, parseInt(e.target.value) || 0)}
                                                        />
                                                        {item.quantity === 0 && <Badge bg="danger">Out</Badge>}
                                                        {item.quantity > 0 && item.quantity <= item.reorderLevel && (
                                                            <Badge bg="warning">Low</Badge>
                                                        )}
                                                    </div>
                                                </td>
                                                <td>{item.costPrice.toLocaleString()}</td>
                                                <td className="fw-bold">{item.sellingPrice.toLocaleString()}</td>
                                                <td className="text-success fw-bold">
                                                    {(item.quantity * item.sellingPrice).toLocaleString()}
                                                </td>
                                                <td>
                                                    <Badge bg={margin > 30 ? 'success' : margin > 15 ? 'warning' : 'danger'}>
                                                        {margin.toFixed(0)}%
                                                    </Badge>
                                                </td>
                                                <td>
                                                    <ButtonGroup size="sm">
                                                        <Button
                                                            variant="outline-primary"
                                                            onClick={() => {
                                                                setEditingItem(item);
                                                                setNewItem(item);
                                                                setShowEditModal(true);
                                                            }}
                                                        >
                                                            ✏️
                                                        </Button>
                                                        <Button
                                                            variant="outline-danger"
                                                            onClick={() => {
                                                                if (window.confirm(`Delete ${item.name}?`)) {
                                                                    deleteInventoryItem(item.id);
                                                                }
                                                            }}
                                                        >
                                                            🗑️
                                                        </Button>
                                                    </ButtonGroup>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </Table>
                        )}
                    </Card.Body>
                </Card>
            </div>
        );
    };

    const renderCustomersTab = () => (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="fw-bold mb-2">Customer Management</h4>
                    <p className="text-muted">Store and manage your customer information</p>
                </div>
                <Button
                    variant="success"
                    onClick={() => {
                        setActiveTab('customers');
                        setShowAddModal(true);
                    }}
                >
                    <span className="me-2">➕</span>
                    Add Customer
                </Button>
            </div>

            <Card className="border-0 shadow-sm">
                <Card.Body>
                    {customers.length === 0 ? (
                        <div className="text-center py-5">
                            <div className="fs-1 mb-3">👥</div>
                            <h5 className="fw-bold mb-2">No Customers Yet</h5>
                            <p className="text-muted mb-3">Start by adding your first customer</p>
                            <Button
                                variant="success"
                                onClick={() => {
                                    setActiveTab('customers');
                                    setShowAddModal(true);
                                }}
                            >
                                Add First Customer
                            </Button>
                        </div>
                    ) : (
                        <Table responsive hover>
                            <thead className="bg-light">
                                <tr>
                                    <th>Name</th>
                                    <th>Phone</th>
                                    <th>Email</th>
                                    <th>Location</th>
                                    <th>Date Added</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {customers.map(customer => (
                                    <tr key={customer.id}>
                                        <td className="fw-bold">{customer.name}</td>
                                        <td>{customer.phone}</td>
                                        <td>{customer.email || '-'}</td>
                                        <td>{customer.location || '-'}</td>
                                        <td>{new Date(customer.dateAdded).toLocaleDateString()}</td>
                                        <td>
                                            <Button
                                                variant="outline-danger"
                                                size="sm"
                                                onClick={() => deleteCustomer(customer.id)}
                                            >
                                                🗑️
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>
            </Card>
        </div>
    );

    const renderSalesTab = () => {
        const todaySales = sales.filter(s =>
            new Date(s.saleDate).toDateString() === new Date().toDateString()
        );
        const todayRevenue = todaySales.reduce((sum, s) => sum + s.total, 0);

        return (
            <div>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h4 className="fw-bold mb-2">Sales & Invoicing</h4>
                        <p className="text-muted">Record sales, generate invoices, and track revenue</p>
                    </div>
                    <ButtonGroup>
                        <Button variant="primary" onClick={() => setShowSaleModal(true)}>
                            ➕ New Sale
                        </Button>
                        <Button variant="outline-primary" onClick={() => exportToCSV(sales, 'sales')}>
                            📥 Export
                        </Button>
                    </ButtonGroup>
                </div>

                {/* Sales Summary */}
                <Row className="mb-4">
                    <Col lg={3} md={6} className="mb-3">
                        <Card className="border-0 shadow-sm">
                            <Card.Body>
                                <div className="d-flex justify-content-between">
                                    <div>
                                        <p className="text-muted small mb-1">Today's Sales</p>
                                        <h4 className="fw-bold text-primary mb-0">{todaySales.length}</h4>
                                        <small className="text-success">KSh {todayRevenue.toLocaleString()}</small>
                                    </div>
                                    <div className="fs-2">📅</div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col lg={3} md={6} className="mb-3">
                        <Card className="border-0 shadow-sm">
                            <Card.Body>
                                <div className="d-flex justify-content-between">
                                    <div>
                                        <p className="text-muted small mb-1">Total Sales</p>
                                        <h4 className="fw-bold mb-0">{sales.length}</h4>
                                    </div>
                                    <div className="fs-2">💰</div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col lg={3} md={6} className="mb-3">
                        <Card className="border-0 shadow-sm">
                            <Card.Body>
                                <div className="d-flex justify-content-between">
                                    <div>
                                        <p className="text-muted small mb-1">Total Revenue</p>
                                        <h4 className="fw-bold text-success mb-0">
                                            KSh {calculateTotalRevenue().toLocaleString()}
                                        </h4>
                                    </div>
                                    <div className="fs-2">📈</div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col lg={3} md={6} className="mb-3">
                        <Card className="border-0 shadow-sm">
                            <Card.Body>
                                <div className="d-flex justify-content-between">
                                    <div>
                                        <p className="text-muted small mb-1">Avg Order Value</p>
                                        <h4 className="fw-bold text-info mb-0">
                                            KSh {sales.length > 0 ? (calculateTotalRevenue() / sales.length).toLocaleString(undefined, { maximumFractionDigits: 0 }) : 0}
                                        </h4>
                                    </div>
                                    <div className="fs-2">📊</div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                <Card className="border-0 shadow-sm">
                    <Card.Body>
                        {sales.length === 0 ? (
                            <div className="text-center py-5">
                                <div className="fs-1 mb-3">💰</div>
                                <h5 className="fw-bold mb-2">No Sales Yet</h5>
                                <p className="text-muted mb-3">Start recording your first sale and generate invoices</p>
                                <Button variant="primary" onClick={() => setShowSaleModal(true)}>
                                    Record First Sale
                                </Button>
                            </div>
                        ) : (
                            <Table responsive hover>
                                <thead className="bg-light">
                                    <tr>
                                        <th>Invoice #</th>
                                        <th>Date & Time</th>
                                        <th>Customer</th>
                                        <th>Items</th>
                                        <th>Subtotal</th>
                                        <th>Discount</th>
                                        <th>Total</th>
                                        <th>Payment</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sales.slice().reverse().map(sale => (
                                        <tr key={sale.id}>
                                            <td className="fw-bold">#{sale.id}</td>
                                            <td>
                                                <div>{new Date(sale.saleDate).toLocaleDateString()}</div>
                                                <small className="text-muted">
                                                    {new Date(sale.saleDate).toLocaleTimeString()}
                                                </small>
                                            </td>
                                            <td>
                                                <div className="fw-bold">{sale.customerName}</div>
                                                {sale.customerPhone && (
                                                    <small className="text-muted">{sale.customerPhone}</small>
                                                )}
                                            </td>
                                            <td>
                                                <Badge bg="secondary">{sale.items.length} items</Badge>
                                            </td>
                                            <td>KSh {sale.subtotal.toLocaleString()}</td>
                                            <td>
                                                {sale.discount > 0 ? (
                                                    <span className="text-danger">-KSh {sale.discount.toLocaleString()}</span>
                                                ) : '-'}
                                            </td>
                                            <td className="fw-bold text-success">KSh {sale.total.toLocaleString()}</td>
                                            <td>
                                                <Badge bg={
                                                    sale.paymentMethod === 'cash' ? 'success' :
                                                        sale.paymentMethod === 'mpesa' ? 'primary' : 'info'
                                                }>
                                                    {sale.paymentMethod.toUpperCase()}
                                                </Badge>
                                            </td>
                                            <td>
                                                <ButtonGroup size="sm">
                                                    <Button
                                                        variant="outline-primary"
                                                        onClick={() => generateInvoice(sale)}
                                                        title="Generate Invoice"
                                                    >
                                                        🧾
                                                    </Button>
                                                    <Button
                                                        variant="outline-info"
                                                        onClick={() => {
                                                            alert(`Sale Details:\n\nInvoice: #${sale.id}\nCustomer: ${sale.customerName}\nItems: ${sale.items.length}\nTotal: KSh ${sale.total.toLocaleString()}`);
                                                        }}
                                                        title="View Details"
                                                    >
                                                        👁️
                                                    </Button>
                                                </ButtonGroup>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        )}
                    </Card.Body>
                </Card>
            </div>
        );
    };

    const renderExpensesTab = () => (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="fw-bold mb-2">Expense Tracking</h4>
                    <p className="text-muted">Monitor business costs and expenses</p>
                </div>
                <Button
                    variant="danger"
                    onClick={() => setShowExpenseModal(true)}
                >
                    <span className="me-2">➕</span>
                    Add Expense
                </Button>
            </div>

            {/* Expense Summary */}
            <Row className="mb-4">
                <Col md={4}>
                    <Card className="border-0 bg-danger text-white">
                        <Card.Body className="text-center">
                            <div className="fs-2 mb-2">💸</div>
                            <h5 className="mb-1">KSh {calculateTotalExpenses().toLocaleString()}</h5>
                            <small>Total Expenses</small>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="border-0 bg-warning text-white">
                        <Card.Body className="text-center">
                            <div className="fs-2 mb-2">📋</div>
                            <h5 className="mb-1">{expenses.length}</h5>
                            <small>Total Records</small>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={4}>
                    <Card className="border-0 bg-info text-white">
                        <Card.Body className="text-center">
                            <div className="fs-2 mb-2">📊</div>
                            <h5 className="mb-1">KSh {expenses.length > 0 ? (calculateTotalExpenses() / expenses.length).toLocaleString(undefined, { maximumFractionDigits: 0 }) : 0}</h5>
                            <small>Avg Expense</small>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Card className="border-0 shadow-sm">
                <Card.Body>
                    {expenses.length === 0 ? (
                        <div className="text-center py-5">
                            <div className="fs-1 mb-3">💸</div>
                            <h5 className="fw-bold mb-2">No Expenses Yet</h5>
                            <p className="text-muted mb-3">Start tracking your business expenses</p>
                            <Button variant="danger" onClick={() => setShowExpenseModal(true)}>
                                Add First Expense
                            </Button>
                        </div>
                    ) : (
                        <Table responsive hover>
                            <thead className="bg-light">
                                <tr>
                                    <th>Date</th>
                                    <th>Category</th>
                                    <th>Description</th>
                                    <th>Vendor</th>
                                    <th>Amount</th>
                                    <th>Payment</th>
                                </tr>
                            </thead>
                            <tbody>
                                {expenses.map(expense => (
                                    <tr key={expense.id}>
                                        <td>{new Date(expense.expenseDate).toLocaleDateString()}</td>
                                        <td>
                                            <Badge bg="secondary">{expense.category}</Badge>
                                        </td>
                                        <td className="fw-bold">{expense.description}</td>
                                        <td>{expense.vendor || '-'}</td>
                                        <td className="fw-bold text-danger">KSh {expense.amount.toLocaleString()}</td>
                                        <td>
                                            <Badge bg={expense.paymentMethod === 'cash' ? 'success' : 'info'}>
                                                {expense.paymentMethod.toUpperCase()}
                                            </Badge>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </Card.Body>
            </Card>
        </div>
    );

    const renderReportsTab = () => {
        const profit = calculateProfit();
        const profitMargin = calculateTotalRevenue() > 0 ? (profit / calculateTotalRevenue() * 100) : 0;

        return (
            <div>
                <h4 className="fw-bold mb-4">Business Reports & Analytics</h4>

                {/* Key Metrics */}
                <Row className="mb-4">
                    <Col md={3}>
                        <Card className="border-0 shadow-sm">
                            <Card.Body className="text-center">
                                <div className="text-muted small mb-1">Total Revenue</div>
                                <h4 className="fw-bold text-success mb-0">
                                    KSh {calculateTotalRevenue().toLocaleString()}
                                </h4>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3}>
                        <Card className="border-0 shadow-sm">
                            <Card.Body className="text-center">
                                <div className="text-muted small mb-1">Total Expenses</div>
                                <h4 className="fw-bold text-danger mb-0">
                                    KSh {calculateTotalExpenses().toLocaleString()}
                                </h4>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3}>
                        <Card className="border-0 shadow-sm">
                            <Card.Body className="text-center">
                                <div className="text-muted small mb-1">Net Profit</div>
                                <h4 className={`fw-bold mb-0 ${profit >= 0 ? 'text-success' : 'text-danger'}`}>
                                    KSh {profit.toLocaleString()}
                                </h4>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3}>
                        <Card className="border-0 shadow-sm">
                            <Card.Body className="text-center">
                                <div className="text-muted small mb-1">Profit Margin</div>
                                <h4 className={`fw-bold mb-0 ${profitMargin >= 0 ? 'text-success' : 'text-danger'}`}>
                                    {profitMargin.toFixed(1)}%
                                </h4>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                <Row>
                    <Col md={6} className="mb-4">
                        <Card className="border-0 shadow-sm">
                            <Card.Header className="bg-light">
                                <h6 className="mb-0 fw-bold">
                                    <span className="me-2">📦</span>
                                    Inventory Overview
                                </h6>
                            </Card.Header>
                            <Card.Body>
                                <div className="mb-3">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <span>Total Products:</span>
                                        <span className="fw-bold">{inventory.length}</span>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <span>Total Inventory Value:</span>
                                        <span className="fw-bold text-success">
                                            KSh {calculateTotalValue().toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <span>Low Stock Items:</span>
                                        <span className="fw-bold text-warning">{getLowStockItems().length}</span>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <span>Product Categories:</span>
                                        <span className="fw-bold">{getTopCategories().length}</span>
                                    </div>
                                </div>
                                {getTopCategories().length > 0 && (
                                    <div className="mt-3">
                                        <small className="text-muted fw-bold">Top Categories:</small>
                                        <div className="mt-2">
                                            {getTopCategories().slice(0, 3).map(([category, count]) => (
                                                <div key={category} className="d-flex justify-content-between align-items-center mb-1">
                                                    <small>{category}</small>
                                                    <Badge bg="primary">{count} items</Badge>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col md={6} className="mb-4">
                        <Card className="border-0 shadow-sm">
                            <Card.Header className="bg-light">
                                <h6 className="mb-0 fw-bold">
                                    <span className="me-2">👥</span>
                                    Customer Insights
                                </h6>
                            </Card.Header>
                            <Card.Body>
                                <div className="mb-3">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <span>Total Customers:</span>
                                        <span className="fw-bold">{customers.length}</span>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <span>Active Customers:</span>
                                        <span className="fw-bold text-success">
                                            {customers.filter(c => c.totalPurchases > 0).length}
                                        </span>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <span>Total Customer Spend:</span>
                                        <span className="fw-bold text-success">
                                            KSh {customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0).toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <span>Avg Customer Value:</span>
                                        <span className="fw-bold">
                                            KSh {customers.length > 0 ? (customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0) / customers.length).toLocaleString(undefined, { maximumFractionDigits: 0 }) : 0}
                                        </span>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </div>
        );
    };

    return (
        <Container className="py-5">
            <Row>
                <Col>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <div>
                            <h2 className="fw-bold mb-2">
                                <span className="me-2">💼</span>
                                Business Tools
                            </h2>
                            <p className="text-muted">
                                Modern tools to manage your business operations
                            </p>
                        </div>
                        {!isOnline && (
                            <Alert variant="info" className="mb-0">
                                <small>📱 Working offline</small>
                            </Alert>
                        )}
                    </div>
                </Col>
            </Row>

            {/* Tool Navigation */}
            <Row className="mb-4">
                {tools.map(tool => (
                    <Col lg={3} md={6} key={tool.id} className="mb-3">
                        <Card
                            className={`border-0 shadow-sm cursor-pointer hover-lift ${activeTab === tool.id ? 'border-primary' : ''}`}
                            onClick={() => setActiveTab(tool.id)}
                            style={{ cursor: 'pointer' }}
                        >
                            <Card.Body className="text-center p-4">
                                <div className="fs-2 mb-2">{tool.icon}</div>
                                <h6 className="fw-bold mb-2">{tool.title}</h6>
                                <p className="text-muted small mb-0">{tool.description}</p>
                                {activeTab === tool.id && (
                                    <Badge bg={tool.color} className="mt-2">Active</Badge>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Tool Content */}
            <div>
                {activeTab === 'dashboard' && renderDashboard()}
                {activeTab === 'inventory' && renderInventoryTab()}
                {activeTab === 'forecasting' && <InventoryForecast />}
                {activeTab === 'customers' && renderCustomersTab()}
                {activeTab === 'sales' && renderSalesTab()}
                {activeTab === 'expenses' && renderExpensesTab()}
                {activeTab === 'reports' && <FinancialReports />}
                {activeTab === 'workflows' && <WorkflowManager />}
                {activeTab === 'analytics' && <BIDashboard />}
                {activeTab === 'compliance' && <ComplianceManager />}
            </div>

            {/* Add Item/Customer Modal */}
            <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>
                        {activeTab === 'inventory' ? (
                            <>
                                <span className="me-2">📦</span>
                                Add New Product
                            </>
                        ) : (
                            <>
                                <span className="me-2">👤</span>
                                Add New Customer
                            </>
                        )}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {activeTab === 'inventory' ? (
                        <Form>
                            <Form.Group className="mb-3">
                                <Form.Label>Product Name *</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={newItem.name}
                                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                                    placeholder="e.g., Maize"
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Product Category</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={newItem.category}
                                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                                    placeholder="e.g., Food"
                                />
                            </Form.Group>
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Quantity *</Form.Label>
                                        <Form.Control
                                            type="number"
                                            value={newItem.quantity}
                                            onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 0 })}
                                            min="0"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Cost Price (KSh)</Form.Label>
                                        <Form.Control
                                            type="number"
                                            value={newItem.costPrice}
                                            onChange={(e) => setNewItem({ ...newItem, costPrice: parseFloat(e.target.value) || 0 })}
                                            min="0"
                                            step="0.01"
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Row>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Selling Price (KSh) *</Form.Label>
                                        <Form.Control
                                            type="number"
                                            value={newItem.sellingPrice}
                                            onChange={(e) => setNewItem({ ...newItem, sellingPrice: parseFloat(e.target.value) || 0 })}
                                            min="0"
                                            step="0.01"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Reorder Level</Form.Label>
                                        <Form.Control
                                            type="number"
                                            value={newItem.reorderLevel}
                                            onChange={(e) => setNewItem({ ...newItem, reorderLevel: parseInt(e.target.value) || 5 })}
                                            min="0"
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                        </Form>
                    ) : (
                        <Form>
                            <Form.Group className="mb-3">
                                <Form.Label>Customer Name *</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={newCustomer.name}
                                    onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                                    placeholder="Full customer name"
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Phone Number *</Form.Label>
                                <Form.Control
                                    type="tel"
                                    value={newCustomer.phone}
                                    onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                                    placeholder="0700000000"
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Email Address</Form.Label>
                                <Form.Control
                                    type="email"
                                    value={newCustomer.email}
                                    onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                                    placeholder="customer@example.com"
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Location</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={newCustomer.location}
                                    onChange={(e) => setNewCustomer({ ...newCustomer, location: e.target.value })}
                                    placeholder="e.g., Kiharu, Murang'a"
                                />
                            </Form.Group>
                        </Form>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowAddModal(false)}>
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={activeTab === 'inventory' ? addInventoryItem : addCustomer}
                    >
                        <span className="me-2">💾</span>
                        Save
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* New Sale Modal */}
            <Modal show={showSaleModal} onHide={() => setShowSaleModal(false)} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>
                        <span className="me-2">💰</span>
                        Record New Sale
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Customer</Form.Label>
                            <Form.Select
                                value={newSale.customer}
                                onChange={(e) => setNewSale({ ...newSale, customer: e.target.value })}
                            >
                                <option value="">Walk-in Customer</option>
                                {customers.map(customer => (
                                    <option key={customer.id} value={customer.id}>
                                        {customer.name} - {customer.phone}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>

                        <div className="mb-3">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <Form.Label className="mb-0">Sale Items *</Form.Label>
                                <Button
                                    variant="outline-primary"
                                    size="sm"
                                    onClick={() => setSaleItems([...saleItems, { itemId: '', quantity: 1, price: 0 }])}
                                >
                                    ➕ Add Item
                                </Button>
                            </div>
                            {saleItems.map((item, index) => (
                                <Row key={index} className="mb-2 align-items-end">
                                    <Col md={5}>
                                        <Form.Select
                                            value={item.itemId}
                                            onChange={(e) => {
                                                const updatedItems = [...saleItems];
                                                const selectedItem = inventory.find(inv => inv.id === parseInt(e.target.value));
                                                updatedItems[index] = {
                                                    ...updatedItems[index],
                                                    itemId: e.target.value,
                                                    price: selectedItem?.sellingPrice || 0
                                                };
                                                setSaleItems(updatedItems);
                                            }}
                                        >
                                            <option value="">Select Product</option>
                                            {inventory.filter(inv => inv.quantity > 0).map(inv => (
                                                <option key={inv.id} value={inv.id}>
                                                    {inv.name} (Stock: {inv.quantity}) - KSh {inv.sellingPrice}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Col>
                                    <Col md={3}>
                                        <Form.Control
                                            type="number"
                                            placeholder="Qty"
                                            value={item.quantity}
                                            onChange={(e) => {
                                                const updatedItems = [...saleItems];
                                                updatedItems[index].quantity = parseInt(e.target.value) || 1;
                                                setSaleItems(updatedItems);
                                            }}
                                            min="1"
                                        />
                                    </Col>
                                    <Col md={3}>
                                        <Form.Control
                                            type="number"
                                            placeholder="Price"
                                            value={item.price}
                                            onChange={(e) => {
                                                const updatedItems = [...saleItems];
                                                updatedItems[index].price = parseFloat(e.target.value) || 0;
                                                setSaleItems(updatedItems);
                                            }}
                                            min="0"
                                        />
                                    </Col>
                                    <Col md={1}>
                                        {saleItems.length > 1 && (
                                            <Button
                                                variant="outline-danger"
                                                size="sm"
                                                onClick={() => setSaleItems(saleItems.filter((_, i) => i !== index))}
                                            >
                                                🗑️
                                            </Button>
                                        )}
                                    </Col>
                                </Row>
                            ))}
                        </div>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Payment Method</Form.Label>
                                    <Form.Select
                                        value={newSale.paymentMethod}
                                        onChange={(e) => setNewSale({ ...newSale, paymentMethod: e.target.value })}
                                    >
                                        <option value="cash">Cash</option>
                                        <option value="mpesa">M-Pesa</option>
                                        <option value="card">Card</option>
                                        <option value="credit">Credit</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Discount (KSh)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        value={newSale.discount}
                                        onChange={(e) => setNewSale({ ...newSale, discount: parseFloat(e.target.value) || 0 })}
                                        min="0"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        {/* Sale Summary */}
                        <Card className="bg-light">
                            <Card.Body>
                                <div className="d-flex justify-content-between mb-2">
                                    <span>Subtotal:</span>
                                    <strong>KSh {saleItems.reduce((sum, item) => sum + (item.quantity * item.price), 0).toLocaleString()}</strong>
                                </div>
                                <div className="d-flex justify-content-between mb-2">
                                    <span>Discount:</span>
                                    <span className="text-danger">- KSh {(newSale.discount || 0).toLocaleString()}</span>
                                </div>
                                <hr />
                                <div className="d-flex justify-content-between">
                                    <strong>Total:</strong>
                                    <strong className="text-success fs-5">
                                        KSh {(saleItems.reduce((sum, item) => sum + (item.quantity * item.price), 0) - (newSale.discount || 0)).toLocaleString()}
                                    </strong>
                                </div>
                            </Card.Body>
                        </Card>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowSaleModal(false)}>
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={addSale}
                        disabled={!saleItems.some(item => item.itemId && item.quantity > 0)}
                    >
                        <span className="me-2">💾</span>
                        Record Sale
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Add Expense Modal */}
            <Modal show={showExpenseModal} onHide={() => setShowExpenseModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>
                        <span className="me-2">💸</span>
                        Add Expense
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Category *</Form.Label>
                            <Form.Select
                                value={newExpense.category}
                                onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                            >
                                <option value="">Select Category</option>
                                <option value="Rent">Rent</option>
                                <option value="Utilities">Utilities</option>
                                <option value="Salaries">Salaries</option>
                                <option value="Supplies">Supplies</option>
                                <option value="Transport">Transport</option>
                                <option value="Marketing">Marketing</option>
                                <option value="Maintenance">Maintenance</option>
                                <option value="Insurance">Insurance</option>
                                <option value="Taxes">Taxes</option>
                                <option value="Other">Other</option>
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Description *</Form.Label>
                            <Form.Control
                                type="text"
                                value={newExpense.description}
                                onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                                placeholder="e.g., Monthly electricity bill"
                            />
                        </Form.Group>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Amount (KSh) *</Form.Label>
                                    <Form.Control
                                        type="number"
                                        value={newExpense.amount}
                                        onChange={(e) => setNewExpense({ ...newExpense, amount: parseFloat(e.target.value) || 0 })}
                                        min="0"
                                        step="0.01"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Payment Method</Form.Label>
                                    <Form.Select
                                        value={newExpense.paymentMethod}
                                        onChange={(e) => setNewExpense({ ...newExpense, paymentMethod: e.target.value })}
                                    >
                                        <option value="cash">Cash</option>
                                        <option value="mpesa">M-Pesa</option>
                                        <option value="card">Card</option>
                                        <option value="bank">Bank Transfer</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>
                        <Form.Group className="mb-3">
                            <Form.Label>Vendor/Supplier</Form.Label>
                            <Form.Control
                                type="text"
                                value={newExpense.vendor}
                                onChange={(e) => setNewExpense({ ...newExpense, vendor: e.target.value })}
                                placeholder="e.g., Kenya Power"
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowExpenseModal(false)}>
                        Cancel
                    </Button>
                    <Button
                        variant="danger"
                        onClick={addExpense}
                        disabled={!newExpense.category || !newExpense.description || newExpense.amount <= 0}
                    >
                        <span className="me-2">💾</span>
                        Add Expense
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}

export default BusinessTools;