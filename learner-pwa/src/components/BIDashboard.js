import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Badge, Alert, ProgressBar, Table, Form, Modal, Tabs, Tab } from 'react-bootstrap';
import { Line, Bar, Pie, Doughnut, Radar } from 'react-chartjs-2';
import businessApi from '../services/businessApi';

function BIDashboard() {
    const [analyticsData, setAnalyticsData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [timeRange, setTimeRange] = useState('30');
    const [selectedMetric, setSelectedMetric] = useState('revenue');
    const [showInsightsModal, setShowInsightsModal] = useState(false);

    useEffect(() => {
        loadAnalyticsData();
    }, [timeRange]);

    const loadAnalyticsData = async () => {
        try {
            setLoading(true);
            const response = await businessApi.getBusinessIntelligence(timeRange);
            setAnalyticsData(response.data);
        } catch (err) {
            setError('Failed to load analytics data');
            console.error('Analytics error:', err);
        } finally {
            setLoading(false);
        }
    };

    const getKPIs = () => {
        if (!analyticsData) return [];

        return [
            {
                title: 'Revenue Growth',
                value: `${analyticsData.revenueGrowth || 0}%`,
                trend: analyticsData.revenueGrowth >= 0 ? 'up' : 'down',
                icon: '📈',
                color: analyticsData.revenueGrowth >= 0 ? 'success' : 'danger'
            },
            {
                title: 'Customer Retention',
                value: `${analyticsData.customerRetention || 0}%`,
                trend: analyticsData.customerRetention >= 70 ? 'up' : 'down',
                icon: '👥',
                color: analyticsData.customerRetention >= 70 ? 'success' : 'warning'
            },
            {
                title: 'Inventory Turnover',
                value: `${analyticsData.inventoryTurnover || 0}x`,
                trend: analyticsData.inventoryTurnover >= 4 ? 'up' : 'down',
                icon: '🔄',
                color: analyticsData.inventoryTurnover >= 4 ? 'success' : 'warning'
            },
            {
                title: 'Profit Margin',
                value: `${analyticsData.profitMargin || 0}%`,
                trend: analyticsData.profitMargin >= 20 ? 'up' : 'down',
                icon: '💰',
                color: analyticsData.profitMargin >= 20 ? 'success' : 'danger'
            }
        ];
    };

    const getInsights = () => {
        if (!analyticsData) return [];

        return analyticsData.insights || [
            {
                type: 'opportunity',
                title: 'High-Performing Product',
                description: 'Product X has 40% higher margins than average',
                impact: 'high',
                action: 'Increase marketing for this product'
            },
            {
                type: 'warning',
                title: 'Seasonal Trend Detected',
                description: 'Sales typically drop 25% in December',
                impact: 'medium',
                action: 'Prepare inventory reduction strategy'
            },
            {
                type: 'insight',
                title: 'Customer Behavior Pattern',
                description: '80% of customers return within 30 days',
                impact: 'high',
                action: 'Implement loyalty program'
            }
        ];
    };

    if (loading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading business intelligence...</span>
                </div>
                <p className="mt-2">Analyzing business performance...</p>
            </div>
        );
    }

    if (error) {
        return (
            <Alert variant="danger">
                <Alert.Heading>Analytics Error</Alert.Heading>
                <p>{error}</p>
                <Button variant="outline-danger" onClick={loadAnalyticsData}>
                    Retry
                </Button>
            </Alert>
        );
    }

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="fw-bold mb-2">Business Intelligence Dashboard</h4>
                    <p className="text-muted">Advanced analytics and predictive insights</p>
                </div>
                <div className="d-flex gap-2">
                    <Form.Select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                        style={{ width: 'auto' }}
                    >
                        <option value="7">Last 7 days</option>
                        <option value="30">Last 30 days</option>
                        <option value="90">Last 90 days</option>
                        <option value="365">Last year</option>
                    </Form.Select>
                    <Button variant="outline-primary" onClick={loadAnalyticsData}>
                        🔄 Refresh Analytics
                    </Button>
                    <Button variant="outline-info" onClick={() => setShowInsightsModal(true)}>
                        💡 AI Insights
                    </Button>
                </div>
            </div>

            {/* Key Performance Indicators */}
            <Row className="mb-4">
                {getKPIs().map((kpi, index) => (
                    <Col lg={3} md={6} key={index} className="mb-3">
                        <Card className="border-0 shadow-sm h-100">
                            <Card.Body>
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                    <div>
                                        <p className="text-muted small mb-1">{kpi.title}</p>
                                        <h3 className={`fw-bold mb-0 text-${kpi.color}`}>
                                            {kpi.value}
                                        </h3>
                                    </div>
                                    <div className="fs-2">{kpi.icon}</div>
                                </div>
                                <small className="text-muted">
                                    {kpi.trend === 'up' ? '↗️ Trending up' : '↘️ Trending down'}
                                </small>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Analytics Charts */}
            <Tabs defaultActiveKey="performance" className="mb-4">
                <Tab eventKey="performance" title="Performance Analysis">
                    <Row className="mb-4">
                        <Col lg={8} className="mb-4">
                            <Card className="border-0 shadow-sm">
                                <Card.Header className="bg-white border-0 pt-3">
                                    <h6 className="fw-bold mb-0">Revenue vs Expenses Trend</h6>
                                </Card.Header>
                                <Card.Body>
                                    {analyticsData?.revenueExpenseChart ? (
                                        <Line data={analyticsData.revenueExpenseChart} />
                                    ) : (
                                        <div className="text-center py-5 text-muted">
                                            <p>No trend data available</p>
                                        </div>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col lg={4} className="mb-4">
                            <Card className="border-0 shadow-sm">
                                <Card.Header className="bg-white border-0 pt-3">
                                    <h6 className="fw-bold mb-0">Profit Distribution</h6>
                                </Card.Header>
                                <Card.Body>
                                    {analyticsData?.profitDistribution ? (
                                        <Doughnut data={analyticsData.profitDistribution} />
                                    ) : (
                                        <div className="text-center py-5 text-muted">
                                            <p>No profit data</p>
                                        </div>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Tab>

                <Tab eventKey="customers" title="Customer Analytics">
                    <Row className="mb-4">
                        <Col lg={6} className="mb-4">
                            <Card className="border-0 shadow-sm">
                                <Card.Header className="bg-white border-0 pt-3">
                                    <h6 className="fw-bold mb-0">Customer Segmentation</h6>
                                </Card.Header>
                                <Card.Body>
                                    {analyticsData?.customerSegments ? (
                                        <Bar data={analyticsData.customerSegments} />
                                    ) : (
                                        <div className="text-center py-5 text-muted">
                                            <p>No customer segment data</p>
                                        </div>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col lg={6} className="mb-4">
                            <Card className="border-0 shadow-sm">
                                <Card.Header className="bg-white border-0 pt-3">
                                    <h6 className="fw-bold mb-0">Customer Lifetime Value</h6>
                                </Card.Header>
                                <Card.Body>
                                    {analyticsData?.customerLifetimeValue ? (
                                        <Line data={analyticsData.customerLifetimeValue} />
                                    ) : (
                                        <div className="text-center py-5 text-muted">
                                            <p>No CLV data available</p>
                                        </div>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Tab>

                <Tab eventKey="products" title="Product Performance">
                    <Card className="border-0 shadow-sm">
                        <Card.Header className="bg-white border-0 pt-3">
                            <h6 className="fw-bold mb-0">Top Performing Products</h6>
                        </Card.Header>
                        <Card.Body>
                            {analyticsData?.topProducts && analyticsData.topProducts.length > 0 ? (
                                <Table responsive hover>
                                    <thead className="bg-light">
                                        <tr>
                                            <th>Product</th>
                                            <th>Revenue</th>
                                            <th>Units Sold</th>
                                            <th>Margin</th>
                                            <th>Growth</th>
                                            <th>Performance</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {analyticsData.topProducts.map((product, index) => (
                                            <tr key={index}>
                                                <td className="fw-bold">{product.name}</td>
                                                <td>KSh {product.revenue.toLocaleString()}</td>
                                                <td>{product.units}</td>
                                                <td>
                                                    <Badge bg={product.margin > 30 ? 'success' : product.margin > 15 ? 'warning' : 'danger'}>
                                                        {product.margin}%
                                                    </Badge>
                                                </td>
                                                <td>
                                                    <span className={product.growth >= 0 ? 'text-success' : 'text-danger'}>
                                                        {product.growth >= 0 ? '+' : ''}{product.growth}%
                                                    </span>
                                                </td>
                                                <td>
                                                    <ProgressBar
                                                        now={product.performance}
                                                        variant={product.performance > 80 ? 'success' : product.performance > 60 ? 'warning' : 'danger'}
                                                        style={{ width: '100px', height: '8px' }}
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            ) : (
                                <div className="text-center py-5 text-muted">
                                    <p>No product performance data available</p>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Tab>
            </Tabs>

            {/* AI Insights Modal */}
            <Modal show={showInsightsModal} onHide={() => setShowInsightsModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>
                        <span className="me-2">💡</span>
                        AI-Powered Business Insights
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="mb-4">
                        <h6 className="fw-bold mb-3">Key Insights & Recommendations</h6>
                        {getInsights().map((insight, index) => (
                            <Alert
                                key={index}
                                variant={
                                    insight.type === 'opportunity' ? 'success' :
                                    insight.type === 'warning' ? 'warning' : 'info'
                                }
                                className="mb-3"
                            >
                                <div className="d-flex justify-content-between align-items-start">
                                    <div className="flex-grow-1">
                                        <div className="d-flex align-items-center mb-2">
                                            <h6 className="mb-0 me-2">{insight.title}</h6>
                                            <Badge bg={
                                                insight.impact === 'high' ? 'danger' :
                                                insight.impact === 'medium' ? 'warning' : 'secondary'
                                            }>
                                                {insight.impact} impact
                                            </Badge>
                                        </div>
                                        <p className="mb-2">{insight.description}</p>
                                        <strong>Recommended Action:</strong> {insight.action}
                                    </div>
                                    <div className="ms-3">
                                        {insight.type === 'opportunity' && '🎯'}
                                        {insight.type === 'warning' && '⚠️'}
                                        {insight.type === 'insight' && '💡'}
                                    </div>
                                </div>
                            </Alert>
                        ))}
                    </div>

                    <Alert variant="light">
                        <strong>AI Analysis:</strong> These insights are generated based on your business data patterns,
                        historical performance, and industry benchmarks. Regular review of these insights can help
                        optimize your business operations and identify new opportunities.
                    </Alert>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowInsightsModal(false)}>
                        Close
                    </Button>
                    <Button variant="primary">
                        Export Insights Report
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default BIDashboard;
