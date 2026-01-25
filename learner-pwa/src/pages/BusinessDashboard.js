import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, ProgressBar, Badge, Alert } from 'react-bootstrap';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { useBusiness } from '../context/BusinessContext';
import { useUser } from '../context/UserContext';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement);

function BusinessDashboard() {
    const { state, actions } = useBusiness();
    const { user } = useUser();
    const [analyticsPeriod, setAnalyticsPeriod] = useState(30);

    useEffect(() => {
        if (user) {
            actions.loadAnalytics(analyticsPeriod);
        }
    }, [user, analyticsPeriod]);

    const analytics = state.analytics?.data || {};

    // Calculate key metrics
    const profit = (analytics.overview?.revenue || 0) - (analytics.overview?.expenses || 0);
    const profitMargin = analytics.overview?.revenue > 0 ?
        (profit / analytics.overview.revenue) * 100 : 0;

    // Chart data
    const revenueChartData = {
        labels: analytics.trends?.monthly?.map(item => item.month) || [],
        datasets: [{
            label: 'Revenue',
            data: analytics.trends?.monthly?.map(item => item.revenue) || [],
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            tension: 0.1
        }, {
            label: 'Expenses',
            data: analytics.trends?.monthly?.map(item => item.expenses) || [],
            borderColor: 'rgb(255, 99, 132)',
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            tension: 0.1
        }]
    };

    const categoryChartData = {
        labels: analytics.trends?.categorySales?.map(item => item.category) || [],
        datasets: [{
            label: 'Sales by Category',
            data: analytics.trends?.categorySales?.map(item => item.amount) || [],
            backgroundColor: [
                'rgba(255, 99, 132, 0.8)',
                'rgba(54, 162, 235, 0.8)',
                'rgba(255, 205, 86, 0.8)',
                'rgba(75, 192, 192, 0.8)',
                'rgba(153, 102, 255, 0.8)',
            ],
        }]
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Business Performance'
            }
        }
    };

    const getHealthStatus = () => {
        const inventoryHealth = analytics.inventory?.lowStockItems === 0 ? 100 :
            Math.max(0, 100 - (analytics.inventory?.lowStockItems * 10));

        const salesHealth = analytics.customers?.total > 0 ?
            Math.min(100, (analytics.customers.active / analytics.customers.total) * 100) : 0;

        const profitHealth = profit >= 0 ? 100 : 50;

        return Math.round((inventoryHealth + salesHealth + profitHealth) / 3);
    };

    const healthStatus = getHealthStatus();
    const healthColor = healthStatus >= 80 ? 'success' : healthStatus >= 60 ? 'warning' : 'danger';

    return (
        <Container fluid>
            <Row className="mb-4">
                <Col>
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h2 className="mb-1">Business Dashboard</h2>
                            <p className="text-muted mb-0">
                                Welcome back, {user?.name}! Here's your business overview.
                            </p>
                        </div>
                        <div className="d-flex gap-2">
                            <Button
                                variant={analyticsPeriod === 7 ? 'primary' : 'outline-primary'}
                                size="sm"
                                onClick={() => setAnalyticsPeriod(7)}
                            >
                                7 Days
                            </Button>
                            <Button
                                variant={analyticsPeriod === 30 ? 'primary' : 'outline-primary'}
                                size="sm"
                                onClick={() => setAnalyticsPeriod(30)}
                            >
                                30 Days
                            </Button>
                            <Button
                                variant={analyticsPeriod === 90 ? 'primary' : 'outline-primary'}
                                size="sm"
                                onClick={() => setAnalyticsPeriod(90)}
                            >
                                90 Days
                            </Button>
                        </div>
                    </div>
                </Col>
            </Row>

            {/* Business Health Overview */}
            <Row className="mb-4">
                <Col md={8}>
                    <Card className="border-0 shadow-sm">
                        <Card.Header className="bg-light">
                            <h5 className="mb-0">
                                <span className="me-2">🏥</span>
                                Business Health
                            </h5>
                        </Card.Header>
                        <Card.Body>
                            <div className="d-flex align-items-center mb-3">
                                <div className="flex-grow-1 me-3">
                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                        <span>Overall Health</span>
                                        <Badge bg={healthColor}>{healthStatus}%</Badge>
                                    </div>
                                    <ProgressBar
                                        now={healthStatus}
                                        variant={healthColor}
                                        className="mb-3"
                                    />
                                </div>
                            </div>

                            <Row>
                                <Col md={4}>
                                    <div className="text-center">
                                        <div className="fs-4 mb-1">
                                            {analytics.inventory?.lowStockItems === 0 ? '✅' : '⚠️'}
                                        </div>
                                        <small className="text-muted">Inventory</small>
                                        <div className="fw-bold">
                                            {analytics.inventory?.lowStockItems || 0} low stock
                                        </div>
                                    </div>
                                </Col>
                                <Col md={4}>
                                    <div className="text-center">
                                        <div className="fs-4 mb-1">
                                            {analytics.customers?.active > 0 ? '📈' : '📉'}
                                        </div>
                                        <small className="text-muted">Customers</small>
                                        <div className="fw-bold">
                                            {analytics.customers?.active || 0} active
                                        </div>
                                    </div>
                                </Col>
                                <Col md={4}>
                                    <div className="text-center">
                                        <div className="fs-4 mb-1">
                                            {profit >= 0 ? '💰' : '💸'}
                                        </div>
                                        <small className="text-muted">Profit</small>
                                        <div className={`fw-bold ${profit >= 0 ? 'text-success' : 'text-danger'}`}>
                                            {profit >= 0 ? '+' : ''}KSh {Math.abs(profit).toLocaleString()}
                                        </div>
                                    </div>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={4}>
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Header className="bg-light">
                            <h6 className="mb-0">Quick Actions</h6>
                        </Card.Header>
                        <Card.Body className="d-grid gap-2">
                            <Button variant="primary" size="sm">
                                <span className="me-1">➕</span>
                                Add Product
                            </Button>
                            <Button variant="success" size="sm">
                                <span className="me-1">👤</span>
                                Add Customer
                            </Button>
                            <Button variant="info" size="sm">
                                <span className="me-1">💰</span>
                                Record Sale
                            </Button>
                            <Button variant="warning" size="sm">
                                <span className="me-1">📊</span>
                                View Reports
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Key Metrics */}
            <Row className="mb-4">
                <Col md={3}>
                    <Card className="border-0 shadow-sm text-center">
                        <Card.Body>
                            <div className="text-muted small mb-1">Total Revenue</div>
                            <h4 className="fw-bold text-success mb-0">
                                KSh {analytics.overview?.revenue?.toLocaleString() || 0}
                            </h4>
                            <small className="text-muted">
                                {analytics.overview?.salesCount || 0} sales
                            </small>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="border-0 shadow-sm text-center">
                        <Card.Body>
                            <div className="text-muted small mb-1">Total Expenses</div>
                            <h4 className="fw-bold text-danger mb-0">
                                KSh {analytics.overview?.expenses?.toLocaleString() || 0}
                            </h4>
                            <small className="text-muted">
                                {analytics.overview?.expenseCount || 0} expenses
                            </small>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="border-0 shadow-sm text-center">
                        <Card.Body>
                            <div className="text-muted small mb-1">Net Profit</div>
                            <h4 className={`fw-bold mb-0 ${profit >= 0 ? 'text-success' : 'text-danger'}`}>
                                KSh {profit.toLocaleString()}
                            </h4>
                            <small className="text-muted">
                                {profitMargin.toFixed(1)}% margin
                            </small>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="border-0 shadow-sm text-center">
                        <Card.Body>
                            <div className="text-muted small mb-1">Avg Order Value</div>
                            <h4 className="fw-bold text-info mb-0">
                                KSh {analytics.overview?.averageOrderValue?.toLocaleString(undefined, { maximumFractionDigits: 0 }) || 0}
                            </h4>
                            <small className="text-muted">
                                per transaction
                            </small>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Charts */}
            <Row className="mb-4">
                <Col md={8}>
                    <Card className="border-0 shadow-sm">
                        <Card.Header className="bg-light">
                            <h6 className="mb-0">Revenue Trends</h6>
                        </Card.Header>
                        <Card.Body>
                            <Line data={revenueChartData} options={chartOptions} />
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={4}>
                    <Card className="border-0 shadow-sm">
                        <Card.Header className="bg-light">
                            <h6 className="mb-0">Sales by Category</h6>
                        </Card.Header>
                        <Card.Body>
                            {analytics.trends?.categorySales?.length > 0 ? (
                                <Doughnut data={categoryChartData} />
                            ) : (
                                <div className="text-center py-4 text-muted">
                                    <div className="fs-1 mb-2">📊</div>
                                    <small>No sales data yet</small>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Recent Activity & Alerts */}
            <Row>
                <Col md={6}>
                    <Card className="border-0 shadow-sm">
                        <Card.Header className="bg-light">
                            <h6 className="mb-0">
                                <span className="me-2">⚡</span>
                                Recent Activity
                            </h6>
                        </Card.Header>
                        <Card.Body>
                            {state.sales.data?.slice(0, 5).map((sale, index) => (
                                <div key={sale._id || index} className="d-flex justify-content-between align-items-center mb-2">
                                    <div>
                                        <small className="text-muted">
                                            Sale #{sale.invoiceNumber}
                                        </small>
                                        <div className="fw-bold small">
                                            {sale.customerName || 'Walk-in Customer'}
                                        </div>
                                    </div>
                                    <Badge bg="success">
                                        KSh {sale.total?.toLocaleString()}
                                    </Badge>
                                </div>
                            ))}
                            {(!state.sales.data || state.sales.data.length === 0) && (
                                <div className="text-center py-3 text-muted">
                                    <small>No recent sales</small>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={6}>
                    <Card className="border-0 shadow-sm">
                        <Card.Header className="bg-light">
                            <h6 className="mb-0">
                                <span className="me-2">🚨</span>
                                Alerts & Notifications
                            </h6>
                        </Card.Header>
                        <Card.Body>
                            {analytics.inventory?.lowStockItems > 0 && (
                                <Alert variant="warning" className="py-2 mb-2">
                                    <small>
                                        <strong>Low Stock Alert:</strong> {analytics.inventory.lowStockItems} items need restocking
                                    </small>
                                </Alert>
                            )}

                            {analytics.customers?.total === 0 && (
                                <Alert variant="info" className="py-2 mb-2">
                                    <small>
                                        <strong>Getting Started:</strong> Add your first customer to begin tracking
                                    </small>
                                </Alert>
                            )}

                            {state.offlineQueue?.length > 0 && (
                                <Alert variant="secondary" className="py-2 mb-2">
                                    <small>
                                        <strong>Offline:</strong> {state.offlineQueue.length} actions pending sync
                                    </small>
                                </Alert>
                            )}

                            {analytics.inventory?.totalItems === 0 && (
                                <Alert variant="primary" className="py-2 mb-2">
                                    <small>
                                        <strong>Setup:</strong> Add your first product to start inventory management
                                    </small>
                                </Alert>
                            )}

                            {(!analytics.inventory?.lowStockItems &&
                              analytics.customers?.total > 0 &&
                              analytics.inventory?.totalItems > 0) && (
                                <Alert variant="success" className="py-2">
                                    <small>
                                        <strong>Great!</strong> Your business is running smoothly
                                    </small>
                                </Alert>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default BusinessDashboard;
