import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Form, Table, Alert, Badge, Modal } from 'react-bootstrap';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import businessApi from '../services/businessApi';

function FinancialReports() {
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [reportType, setReportType] = useState('profit_loss');
    const [period, setPeriod] = useState('monthly');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [showExportModal, setShowExportModal] = useState(false);
    const [useLocalData, setUseLocalData] = useState(false);

    useEffect(() => {
        generateReport();
    }, [reportType, period]);

    const generateReport = async () => {
        try {
            setLoading(true);
            setError(null);
            setUseLocalData(false);

            const params = {
                type: reportType,
                period,
                startDate: startDate || undefined,
                endDate: endDate || undefined
            };

            const response = await businessApi.getFinancialReports(params);
            setReportData(response);
        } catch (err) {
            console.error('Financial report API error:', err);
            // Fallback to localStorage data
            generateLocalReport();
        } finally {
            setLoading(false);
        }
    };

    const generateLocalReport = () => {
        try {
            const savedSales = localStorage.getItem('businessSales');
            const savedExpenses = localStorage.getItem('businessExpenses');
            const savedInventory = localStorage.getItem('businessInventory');

            const sales = savedSales ? JSON.parse(savedSales) : [];
            const expenses = savedExpenses ? JSON.parse(savedExpenses) : [];
            const inventory = savedInventory ? JSON.parse(savedInventory) : [];

            // Calculate date range
            const now = new Date();
            let filterStartDate, filterEndDate;

            if (startDate && endDate) {
                filterStartDate = new Date(startDate);
                filterEndDate = new Date(endDate);
            } else {
                filterStartDate = new Date(now.getFullYear(), now.getMonth(), 1);
                filterEndDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            }

            // Filter data by date
            const filteredSales = sales.filter(s => {
                const saleDate = new Date(s.saleDate);
                return saleDate >= filterStartDate && saleDate <= filterEndDate;
            });

            const filteredExpenses = expenses.filter(e => {
                const expDate = new Date(e.expenseDate);
                return expDate >= filterStartDate && expDate <= filterEndDate;
            });

            const totalRevenue = filteredSales.reduce((sum, sale) => sum + (sale.total || 0), 0);
            const totalCostOfGoods = filteredSales.reduce((sum, sale) => {
                return sum + (sale.items || []).reduce((itemSum, item) => {
                    const invItem = inventory.find(inv => inv.id?.toString() === item.itemId?.toString());
                    return itemSum + ((item.quantity || 0) * (invItem?.costPrice || 0));
                }, 0);
            }, 0);
            const grossProfit = totalRevenue - totalCostOfGoods;
            const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
            const netProfit = grossProfit - totalExpenses;

            // Categorize expenses
            const expenseCategories = filteredExpenses.reduce((acc, exp) => {
                acc[exp.category || 'Other'] = (acc[exp.category || 'Other'] || 0) + (exp.amount || 0);
                return acc;
            }, {});

            // Tax calculations (Kenya KRA)
            const vatRate = 16;
            const taxableAmount = totalRevenue / (1 + vatRate / 100);
            const vatCollected = totalRevenue - taxableAmount;

            const inventoryValue = inventory.reduce((sum, item) =>
                sum + ((item.quantity || 0) * (item.costPrice || 0)), 0);

            setReportData({
                data: {
                    reportType: reportType === 'profit_loss' ? 'Profit & Loss Statement' :
                        reportType === 'balance_sheet' ? 'Balance Sheet' :
                            reportType === 'cash_flow' ? 'Cash Flow Statement' : 'Tax Summary',
                    period: {
                        startDate: filterStartDate.toISOString().split('T')[0],
                        endDate: filterEndDate.toISOString().split('T')[0]
                    },
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
                    },
                    assets: {
                        currentAssets: {
                            inventory: inventoryValue,
                            accountsReceivable: 0
                        },
                        totalCurrentAssets: inventoryValue
                    },
                    liabilities: {
                        currentLiabilities: {
                            accountsPayable: 0
                        },
                        totalCurrentLiabilities: 0
                    },
                    equity: {
                        retainedEarnings: netProfit
                    },
                    totalLiabilitiesAndEquity: netProfit
                }
            });
            setUseLocalData(true);
        } catch (err) {
            setError('Failed to generate financial report from local data');
            console.error('Local report error:', err);
        }
    };

    const handleCustomDateRange = () => {
        if (startDate && endDate) {
            generateReport();
        }
    };

    const exportReport = async (format = 'pdf') => {
        try {
            // This would call an export endpoint
            alert(`Exporting ${reportType} report as ${format.toUpperCase()}`);
            setShowExportModal(false);
        } catch (err) {
            console.error('Export error:', err);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-KE', {
            style: 'currency',
            currency: 'KES'
        }).format(amount);
    };

    if (loading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Generating report...</span>
                </div>
                <p className="mt-2">Generating financial report...</p>
            </div>
        );
    }

    if (error && !reportData) {
        return (
            <Alert variant="danger">
                <Alert.Heading>Report Generation Error</Alert.Heading>
                <p>{error}</p>
                <Button variant="outline-danger" onClick={generateReport}>
                    Retry
                </Button>
            </Alert>
        );
    }

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="fw-bold mb-2">Financial Reports</h4>
                    <p className="text-muted">Comprehensive financial statements and analysis</p>
                </div>
                <div className="d-flex gap-2">
                    <Button variant="outline-primary" onClick={() => setShowExportModal(true)}>
                        📥 Export Report
                    </Button>
                    <Button variant="primary" onClick={generateReport}>
                        🔄 Generate Report
                    </Button>
                </div>
            </div>

            {useLocalData && (
                <Alert variant="info" className="mb-4">
                    <small>📱 Using offline data for reports. Connect to server for complete financial data.</small>
                </Alert>
            )}

            {/* Report Controls */}
            <Card className="border-0 shadow-sm mb-4">
                <Card.Body>
                    <Row>
                        <Col md={3}>
                            <Form.Group>
                                <Form.Label>Report Type</Form.Label>
                                <Form.Select
                                    value={reportType}
                                    onChange={(e) => setReportType(e.target.value)}
                                >
                                    <option value="profit_loss">Profit & Loss Statement</option>
                                    <option value="balance_sheet">Balance Sheet</option>
                                    <option value="cash_flow">Cash Flow Statement</option>
                                    <option value="tax_summary">Tax Summary</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={3}>
                            <Form.Group>
                                <Form.Label>Period</Form.Label>
                                <Form.Select
                                    value={period}
                                    onChange={(e) => setPeriod(e.target.value)}
                                >
                                    <option value="monthly">Current Month</option>
                                    <option value="quarterly">Current Quarter</option>
                                    <option value="yearly">Current Year</option>
                                    <option value="custom">Custom Range</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        {period === 'custom' && (
                            <>
                                <Col md={3}>
                                    <Form.Group>
                                        <Form.Label>Start Date</Form.Label>
                                        <Form.Control
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={3}>
                                    <Form.Group>
                                        <Form.Label>End Date</Form.Label>
                                        <Form.Control
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                        />
                                    </Form.Group>
                                </Col>
                            </>
                        )}
                    </Row>
                    {period === 'custom' && (
                        <div className="mt-3">
                            <Button variant="outline-primary" onClick={handleCustomDateRange}>
                                Apply Date Range
                            </Button>
                        </div>
                    )}
                </Card.Body>
            </Card>

            {/* Report Content */}
            {reportData && reportData.data && (
                <div>
                    {reportType === 'profit_loss' && renderProfitLossReport()}
                    {reportType === 'balance_sheet' && renderBalanceSheetReport()}
                    {reportType === 'cash_flow' && renderCashFlowReport()}
                    {reportType === 'tax_summary' && renderTaxSummaryReport()}
                </div>
            )}

            {/* Export Modal */}
            <Modal show={showExportModal} onHide={() => setShowExportModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Export Financial Report</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Choose export format for the {reportType.replace('_', ' ')} report:</p>
                    <div className="d-flex gap-2">
                        <Button variant="outline-primary" onClick={() => exportReport('pdf')}>
                            📄 PDF
                        </Button>
                        <Button variant="outline-success" onClick={() => exportReport('excel')}>
                            📊 Excel
                        </Button>
                        <Button variant="outline-info" onClick={() => exportReport('csv')}>
                            📋 CSV
                        </Button>
                    </div>
                </Modal.Body>
            </Modal>
        </div>
    );

    function renderProfitLossReport() {
        const { income, expenses, profit, tax } = reportData.data;

        return (
            <div>
                <Card className="border-0 shadow-sm mb-4">
                    <Card.Header className="bg-white border-0 pt-3">
                        <h5 className="fw-bold mb-0">Profit & Loss Statement</h5>
                        <small className="text-muted">Period: {reportData.data.period.startDate} to {reportData.data.period.endDate}</small>
                    </Card.Header>
                    <Card.Body>
                        <Row>
                            <Col md={6}>
                                <h6 className="fw-bold text-success mb-3">Income</h6>
                                <div className="mb-2 d-flex justify-content-between">
                                    <span>Total Revenue</span>
                                    <strong>{formatCurrency(income.totalRevenue)}</strong>
                                </div>
                                <div className="mb-2 d-flex justify-content-between">
                                    <span>Cost of Goods Sold</span>
                                    <span className="text-danger">({formatCurrency(income.costOfGoodsSold)})</span>
                                </div>
                                <hr />
                                <div className="d-flex justify-content-between">
                                    <strong>Gross Profit</strong>
                                    <strong className="text-success">{formatCurrency(income.grossProfit)}</strong>
                                </div>
                            </Col>
                            <Col md={6}>
                                <h6 className="fw-bold text-danger mb-3">Expenses</h6>
                                <div className="mb-2 d-flex justify-content-between">
                                    <span>Total Expenses</span>
                                    <strong>{formatCurrency(expenses.totalExpenses)}</strong>
                                </div>
                                {expenses.byCategory && Object.entries(expenses.byCategory).map(([category, amount]) => (
                                    <div key={category} className="mb-1 d-flex justify-content-between small">
                                        <span>{category}</span>
                                        <span>{formatCurrency(amount)}</span>
                                    </div>
                                ))}
                            </Col>
                        </Row>
                        <hr className="my-4" />
                        <Row>
                            <Col md={6}>
                                <div className="d-flex justify-content-between">
                                    <strong>Net Profit</strong>
                                    <strong className={`fs-5 ${profit.netProfit >= 0 ? 'text-success' : 'text-danger'}`}>
                                        {formatCurrency(profit.netProfit)}
                                    </strong>
                                </div>
                                <div className="mt-2">
                                    <small className="text-muted">Profit Margin: {profit.profitMargin.toFixed(1)}%</small>
                                </div>
                            </Col>
                            <Col md={6}>
                                <h6 className="fw-bold mb-2">Tax Information</h6>
                                <div className="mb-1 d-flex justify-content-between">
                                    <span>VAT Collected</span>
                                    <span>{formatCurrency(tax.vatCollected)}</span>
                                </div>
                                <div className="mb-1 d-flex justify-content-between">
                                    <span>Taxable Amount</span>
                                    <span>{formatCurrency(tax.taxableAmount)}</span>
                                </div>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>

                {/* Expense Breakdown Chart */}
                <Card className="border-0 shadow-sm">
                    <Card.Header className="bg-white border-0 pt-3">
                        <h6 className="fw-bold mb-0">Expense Breakdown</h6>
                    </Card.Header>
                    <Card.Body>
                        {expenses.byCategory && (
                            <Bar
                                data={{
                                    labels: Object.keys(expenses.byCategory),
                                    datasets: [{
                                        label: 'Expenses by Category',
                                        data: Object.values(expenses.byCategory),
                                        backgroundColor: [
                                            'rgba(255, 99, 132, 0.8)',
                                            'rgba(54, 162, 235, 0.8)',
                                            'rgba(255, 206, 86, 0.8)',
                                            'rgba(75, 192, 192, 0.8)',
                                            'rgba(153, 102, 255, 0.8)',
                                        ],
                                    }]
                                }}
                                options={{
                                    responsive: true,
                                    plugins: { legend: { display: false } }
                                }}
                            />
                        )}
                    </Card.Body>
                </Card>
            </div>
        );
    }

    function renderBalanceSheetReport() {
        const { assets, liabilities, equity } = reportData.data;

        return (
            <Card className="border-0 shadow-sm">
                <Card.Header className="bg-white border-0 pt-3">
                    <h5 className="fw-bold mb-0">Balance Sheet</h5>
                    <small className="text-muted">Period: {reportData.data.period.startDate} to {reportData.data.period.endDate}</small>
                </Card.Header>
                <Card.Body>
                    <Row>
                        <Col md={6}>
                            <h6 className="fw-bold text-primary mb-3">Assets</h6>
                            <div className="mb-3">
                                <h6 className="text-muted">Current Assets</h6>
                                <div className="ms-3">
                                    <div className="d-flex justify-content-between mb-1">
                                        <span>Inventory</span>
                                        <span>{formatCurrency(assets.currentAssets.inventory)}</span>
                                    </div>
                                    <div className="d-flex justify-content-between mb-1">
                                        <span>Accounts Receivable</span>
                                        <span>{formatCurrency(assets.currentAssets.accountsReceivable)}</span>
                                    </div>
                                </div>
                                <hr />
                                <div className="d-flex justify-content-between fw-bold">
                                    <span>Total Current Assets</span>
                                    <span>{formatCurrency(assets.totalCurrentAssets)}</span>
                                </div>
                            </div>
                        </Col>
                        <Col md={6}>
                            <h6 className="fw-bold text-danger mb-3">Liabilities & Equity</h6>
                            <div className="mb-3">
                                <h6 className="text-muted">Current Liabilities</h6>
                                <div className="ms-3">
                                    <div className="d-flex justify-content-between mb-1">
                                        <span>Accounts Payable</span>
                                        <span>{formatCurrency(liabilities.currentLiabilities.accountsPayable)}</span>
                                    </div>
                                </div>
                                <hr />
                                <div className="d-flex justify-content-between mb-3">
                                    <span>Total Current Liabilities</span>
                                    <span>{formatCurrency(liabilities.totalCurrentLiabilities)}</span>
                                </div>
                            </div>
                            <div>
                                <h6 className="text-muted">Equity</h6>
                                <div className="ms-3">
                                    <div className="d-flex justify-content-between">
                                        <span>Retained Earnings</span>
                                        <span>{formatCurrency(equity.retainedEarnings)}</span>
                                    </div>
                                </div>
                            </div>
                        </Col>
                    </Row>
                    <hr className="my-4" />
                    <div className="text-center">
                        <h5 className="fw-bold">
                            Total Liabilities & Equity: {formatCurrency(reportData.data.totalLiabilitiesAndEquity)}
                        </h5>
                    </div>
                </Card.Body>
            </Card>
        );
    }

    function renderCashFlowReport() {
        return (
            <Card className="border-0 shadow-sm">
                <Card.Header className="bg-white border-0 pt-3">
                    <h5 className="fw-bold mb-0">Cash Flow Statement</h5>
                    <small className="text-muted">Period: {reportData.data.period.startDate} to {reportData.data.period.endDate}</small>
                </Card.Header>
                <Card.Body>
                    <Alert variant="info">
                        <strong>Cash Flow Statement</strong> - Detailed cash flow analysis will be available in the next update.
                        This includes operating, investing, and financing activities.
                    </Alert>
                </Card.Body>
            </Card>
        );
    }

    function renderTaxSummaryReport() {
        const { tax } = reportData.data;

        return (
            <Card className="border-0 shadow-sm">
                <Card.Header className="bg-white border-0 pt-3">
                    <h5 className="fw-bold mb-0">Tax Summary (KRA Compliance)</h5>
                    <small className="text-muted">Period: {reportData.data.period.startDate} to {reportData.data.period.endDate}</small>
                </Card.Header>
                <Card.Body>
                    <Row>
                        <Col md={6}>
                            <h6 className="fw-bold mb-3">VAT Information</h6>
                            <div className="mb-2 d-flex justify-content-between">
                                <span>VAT Rate</span>
                                <strong>16%</strong>
                            </div>
                            <div className="mb-2 d-flex justify-content-between">
                                <span>VAT Collected</span>
                                <strong className="text-success">{formatCurrency(tax.vatCollected)}</strong>
                            </div>
                            <div className="mb-2 d-flex justify-content-between">
                                <span>Taxable Amount</span>
                                <strong>{formatCurrency(tax.taxableAmount)}</strong>
                            </div>
                        </Col>
                        <Col md={6}>
                            <h6 className="fw-bold mb-3">Filing Requirements</h6>
                            <div className="mb-2">
                                <Badge bg="warning" className="me-2">Due</Badge>
                                Monthly VAT Return (VAT 101)
                            </div>
                            <div className="mb-2">
                                <small className="text-muted">Next filing deadline: 20th of next month</small>
                            </div>
                            <Button variant="outline-primary" size="sm">
                                Generate VAT 101 Form
                            </Button>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
        );
    }
}

export default FinancialReports;
