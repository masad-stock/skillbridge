/**
 * Content Delivery Monitoring Dashboard
 * 
 * Admin dashboard for content delivery monitoring and diagnostics
 * Displays real-time metrics, error reports, and system health
 * Provides tools for content validation and troubleshooting
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
    Card,
    Row,
    Col,
    Alert,
    Badge,
    Button,
    Table,
    ProgressBar,
    Dropdown,
    Modal,
    Form,
    Spinner,
    Tabs,
    Tab
} from 'react-bootstrap';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    BarElement
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    BarElement
);

const ContentDeliveryDashboard = () => {
    // State management
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedError, setSelectedError] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');

    // Fetch dashboard data
    const fetchDashboardData = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/content-diagnostics/dashboard?timeRange=${selectedTimeRange}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setDashboardData(data);
            setError(null);
        } catch (err) {
            setError(err.message);
            console.error('Failed to fetch dashboard data:', err);
        } finally {
            setLoading(false);
        }
    }, [selectedTimeRange]);

    // Auto-refresh effect
    useEffect(() => {
        fetchDashboardData();

        if (autoRefresh) {
            const interval = setInterval(fetchDashboardData, 30000); // Refresh every 30 seconds
            return () => clearInterval(interval);
        }
    }, [fetchDashboardData, autoRefresh]);

    // Handle error detail view
    const handleErrorDetail = (error) => {
        setSelectedError(error);
        setShowDetailModal(true);
    };

    // Handle content validation
    const handleValidateContent = async (moduleId, lessonId) => {
        try {
            const response = await fetch('/api/content-diagnostics/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ moduleId, lessonId })
            });

            if (response.ok) {
                fetchDashboardData(); // Refresh data
            }
        } catch (err) {
            console.error('Content validation failed:', err);
        }
    };

    // Render loading state
    if (loading && !dashboardData) {
        return (
            <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3 text-muted">Loading content delivery dashboard...</p>
            </div>
        );
    }

    // Render error state
    if (error && !dashboardData) {
        return (
            <Alert variant="danger">
                <Alert.Heading>Dashboard Error</Alert.Heading>
                <p>Failed to load dashboard data: {error}</p>
                <Button variant="outline-danger" onClick={fetchDashboardData}>
                    Retry
                </Button>
            </Alert>
        );
    }

    const {
        summary = {},
        errorAnalysis = {},
        performanceMetrics = {},
        contentHealthStatus = {},
        trends = {},
        systemHealth = {},
        recentErrors = [],
        recommendations = []
    } = dashboardData || {};

    // Chart configurations
    const errorTrendChartData = {
        labels: trends.labels || [],
        datasets: [
            {
                label: 'Critical Errors',
                data: trends.criticalErrors || [],
                borderColor: 'rgb(220, 53, 69)',
                backgroundColor: 'rgba(220, 53, 69, 0.1)',
                tension: 0.1
            },
            {
                label: 'High Errors',
                data: trends.highErrors || [],
                borderColor: 'rgb(255, 193, 7)',
                backgroundColor: 'rgba(255, 193, 7, 0.1)',
                tension: 0.1
            },
            {
                label: 'Medium Errors',
                data: trends.mediumErrors || [],
                borderColor: 'rgb(13, 202, 240)',
                backgroundColor: 'rgba(13, 202, 240, 0.1)',
                tension: 0.1
            }
        ]
    };

    const errorTypeChartData = {
        labels: Object.keys(errorAnalysis.byType || {}),
        datasets: [{
            data: Object.values(errorAnalysis.byType || {}).map(errors => errors.length),
            backgroundColor: [
                '#FF6384',
                '#36A2EB',
                '#FFCE56',
                '#4BC0C0',
                '#9966FF',
                '#FF9F40'
            ]
        }]
    };

    const performanceChartData = {
        labels: ['Video Load', 'Text Load', 'Image Load', 'Total Load'],
        datasets: [{
            label: 'Average Load Time (ms)',
            data: [
                performanceMetrics.avgVideoLoadTime || 0,
                performanceMetrics.avgTextLoadTime || 0,
                performanceMetrics.avgImageLoadTime || 0,
                performanceMetrics.avgLoadTime || 0
            ],
            backgroundColor: 'rgba(54, 162, 235, 0.6)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
        }]
    };

    return (
        <div className="content-delivery-dashboard">
            {/* Dashboard Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="mb-1">Content Delivery Dashboard</h2>
                    <p className="text-muted mb-0">
                        Real-time monitoring and diagnostics for content delivery system
                    </p>
                </div>
                <div className="d-flex gap-2">
                    <Dropdown>
                        <Dropdown.Toggle variant="outline-secondary" size="sm">
                            Time Range: {selectedTimeRange}
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            <Dropdown.Item onClick={() => setSelectedTimeRange('1h')}>Last Hour</Dropdown.Item>
                            <Dropdown.Item onClick={() => setSelectedTimeRange('24h')}>Last 24 Hours</Dropdown.Item>
                            <Dropdown.Item onClick={() => setSelectedTimeRange('7d')}>Last 7 Days</Dropdown.Item>
                            <Dropdown.Item onClick={() => setSelectedTimeRange('30d')}>Last 30 Days</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                    <Button
                        variant={autoRefresh ? "success" : "outline-secondary"}
                        size="sm"
                        onClick={() => setAutoRefresh(!autoRefresh)}
                    >
                        {autoRefresh ? "🔄 Auto" : "⏸️ Manual"}
                    </Button>
                    <Button variant="primary" size="sm" onClick={fetchDashboardData}>
                        Refresh
                    </Button>
                </div>
            </div>

            {/* System Health Alert */}
            {systemHealth.status && systemHealth.status !== 'healthy' && (
                <Alert variant={systemHealth.status === 'critical' ? 'danger' : 'warning'} className="mb-4">
                    <Alert.Heading className="h6">
                        System Health: {systemHealth.status.toUpperCase()}
                    </Alert.Heading>
                    <p className="mb-2">
                        Health Score: {systemHealth.score}/100
                    </p>
                    <small>
                        Critical Errors: {systemHealth.factors?.criticalErrors || 0} |
                        High Errors: {systemHealth.factors?.highErrors || 0} |
                        Success Rate: {systemHealth.factors?.successRate || 0}%
                    </small>
                </Alert>
            )}

            {/* Dashboard Tabs */}
            <Tabs activeKey={activeTab} onSelect={setActiveTab} className="mb-4">
                <Tab eventKey="overview" title="Overview">
                    {/* Summary Cards */}
                    <Row className="mb-4">
                        <Col md={3}>
                            <Card className="border-0 shadow-sm h-100">
                                <Card.Body className="text-center">
                                    <div className="display-6 text-primary mb-2">
                                        {summary.totalErrors || 0}
                                    </div>
                                    <h6 className="text-muted mb-0">Total Errors</h6>
                                    <small className="text-muted">
                                        {selectedTimeRange}
                                    </small>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={3}>
                            <Card className="border-0 shadow-sm h-100">
                                <Card.Body className="text-center">
                                    <div className="display-6 text-danger mb-2">
                                        {summary.criticalErrors || 0}
                                    </div>
                                    <h6 className="text-muted mb-0">Critical Errors</h6>
                                    <small className="text-muted">
                                        Immediate attention required
                                    </small>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={3}>
                            <Card className="border-0 shadow-sm h-100">
                                <Card.Body className="text-center">
                                    <div className="display-6 text-success mb-2">
                                        {performanceMetrics.successRate || 0}%
                                    </div>
                                    <h6 className="text-muted mb-0">Success Rate</h6>
                                    <small className="text-muted">
                                        Content delivery success
                                    </small>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={3}>
                            <Card className="border-0 shadow-sm h-100">
                                <Card.Body className="text-center">
                                    <div className="display-6 text-info mb-2">
                                        {summary.affectedUsers || 0}
                                    </div>
                                    <h6 className="text-muted mb-0">Affected Users</h6>
                                    <small className="text-muted">
                                        Users experiencing issues
                                    </small>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    {/* Charts Row */}
                    <Row className="mb-4">
                        <Col md={8}>
                            <Card className="border-0 shadow-sm h-100">
                                <Card.Header className="bg-light border-0">
                                    <h6 className="mb-0">Error Trends</h6>
                                </Card.Header>
                                <Card.Body>
                                    <Line
                                        data={errorTrendChartData}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            scales: {
                                                y: {
                                                    beginAtZero: true
                                                }
                                            }
                                        }}
                                        height={300}
                                    />
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={4}>
                            <Card className="border-0 shadow-sm h-100">
                                <Card.Header className="bg-light border-0">
                                    <h6 className="mb-0">Error Types</h6>
                                </Card.Header>
                                <Card.Body>
                                    <Doughnut
                                        data={errorTypeChartData}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false
                                        }}
                                        height={300}
                                    />
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    {/* Content Health Status */}
                    <Row className="mb-4">
                        <Col md={12}>
                            <Card className="border-0 shadow-sm">
                                <Card.Header className="bg-light border-0">
                                    <h6 className="mb-0">Content Health Status</h6>
                                </Card.Header>
                                <Card.Body>
                                    <Row>
                                        <Col md={3} className="text-center">
                                            <div className="h4 text-success mb-1">
                                                {contentHealthStatus.healthy || 0}
                                            </div>
                                            <small className="text-muted">Healthy</small>
                                        </Col>
                                        <Col md={3} className="text-center">
                                            <div className="h4 text-warning mb-1">
                                                {contentHealthStatus.warning || 0}
                                            </div>
                                            <small className="text-muted">Warning</small>
                                        </Col>
                                        <Col md={3} className="text-center">
                                            <div className="h4 text-danger mb-1">
                                                {contentHealthStatus.degraded || 0}
                                            </div>
                                            <small className="text-muted">Degraded</small>
                                        </Col>
                                        <Col md={3} className="text-center">
                                            <div className="h4 text-dark mb-1">
                                                {contentHealthStatus.critical || 0}
                                            </div>
                                            <small className="text-muted">Critical</small>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Tab>

                <Tab eventKey="errors" title="Error Analysis">
                    {/* Recent Errors */}
                    <Card className="border-0 shadow-sm mb-4">
                        <Card.Header className="bg-light border-0">
                            <h6 className="mb-0">Recent Errors</h6>
                        </Card.Header>
                        <Card.Body className="p-0">
                            <Table responsive hover className="mb-0">
                                <thead className="bg-light">
                                    <tr>
                                        <th>Time</th>
                                        <th>Type</th>
                                        <th>Severity</th>
                                        <th>Message</th>
                                        <th>Module</th>
                                        <th>User Impact</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentErrors.map((error, index) => (
                                        <tr key={index}>
                                            <td>
                                                <small className="text-muted">
                                                    {new Date(error.timestamp).toLocaleString()}
                                                </small>
                                            </td>
                                            <td>
                                                <Badge bg="secondary">{error.type}</Badge>
                                            </td>
                                            <td>
                                                <Badge bg={
                                                    error.severity === 'critical' ? 'danger' :
                                                        error.severity === 'high' ? 'warning' :
                                                            error.severity === 'medium' ? 'info' : 'light'
                                                }>
                                                    {error.severity}
                                                </Badge>
                                            </td>
                                            <td>
                                                <div style={{ maxWidth: '200px' }}>
                                                    <small>{error.message}</small>
                                                </div>
                                            </td>
                                            <td>
                                                <small className="text-muted">
                                                    {error.moduleId}
                                                </small>
                                            </td>
                                            <td>
                                                <small>{error.userImpact}</small>
                                            </td>
                                            <td>
                                                <Button
                                                    variant="outline-primary"
                                                    size="sm"
                                                    onClick={() => handleErrorDetail(error)}
                                                >
                                                    Details
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>

                    {/* Error Patterns */}
                    {errorAnalysis.commonPatterns && (
                        <Card className="border-0 shadow-sm">
                            <Card.Header className="bg-light border-0">
                                <h6 className="mb-0">Common Error Patterns</h6>
                            </Card.Header>
                            <Card.Body>
                                {errorAnalysis.commonPatterns.map((pattern, index) => (
                                    <div key={index} className="mb-3 p-3 bg-light rounded">
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <h6 className="mb-0">{pattern.description}</h6>
                                            <Badge bg="danger">{pattern.count} occurrences</Badge>
                                        </div>
                                        <small className="text-muted">
                                            Pattern: {pattern.pattern}
                                        </small>
                                    </div>
                                ))}
                            </Card.Body>
                        </Card>
                    )}
                </Tab>

                <Tab eventKey="performance" title="Performance">
                    {/* Performance Metrics */}
                    <Row className="mb-4">
                        <Col md={8}>
                            <Card className="border-0 shadow-sm h-100">
                                <Card.Header className="bg-light border-0">
                                    <h6 className="mb-0">Load Time Performance</h6>
                                </Card.Header>
                                <Card.Body>
                                    <Bar
                                        data={performanceChartData}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            scales: {
                                                y: {
                                                    beginAtZero: true,
                                                    title: {
                                                        display: true,
                                                        text: 'Load Time (ms)'
                                                    }
                                                }
                                            }
                                        }}
                                        height={300}
                                    />
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={4}>
                            <Card className="border-0 shadow-sm h-100">
                                <Card.Header className="bg-light border-0">
                                    <h6 className="mb-0">Performance Summary</h6>
                                </Card.Header>
                                <Card.Body>
                                    <div className="mb-3">
                                        <div className="d-flex justify-content-between mb-1">
                                            <small>Success Rate</small>
                                            <small>{performanceMetrics.successRate || 0}%</small>
                                        </div>
                                        <ProgressBar
                                            now={performanceMetrics.successRate || 0}
                                            variant={
                                                (performanceMetrics.successRate || 0) > 90 ? 'success' :
                                                    (performanceMetrics.successRate || 0) > 70 ? 'warning' : 'danger'
                                            }
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <small className="text-muted d-block">Total Requests</small>
                                        <div className="h5">{performanceMetrics.totalRequests || 0}</div>
                                    </div>
                                    <div className="mb-3">
                                        <small className="text-muted d-block">Failed Requests</small>
                                        <div className="h5 text-danger">{performanceMetrics.failedRequests || 0}</div>
                                    </div>
                                    <div>
                                        <small className="text-muted d-block">Avg Load Time</small>
                                        <div className="h5">{performanceMetrics.avgLoadTime || 0}ms</div>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Tab>

                <Tab eventKey="recommendations" title="Recommendations">
                    {/* Recommendations */}
                    <div className="mb-4">
                        {recommendations.length > 0 ? (
                            recommendations.map((rec, index) => (
                                <Card key={index} className="border-0 shadow-sm mb-3">
                                    <Card.Body>
                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                            <h6 className="mb-0">{rec.title}</h6>
                                            <Badge bg={
                                                rec.priority === 'critical' ? 'danger' :
                                                    rec.priority === 'high' ? 'warning' : 'info'
                                            }>
                                                {rec.priority}
                                            </Badge>
                                        </div>
                                        <p className="text-muted mb-3">{rec.description}</p>
                                        <div>
                                            <small className="text-muted d-block mb-2">Recommended Actions:</small>
                                            <ul className="small mb-0">
                                                {rec.actions.map((action, actionIndex) => (
                                                    <li key={actionIndex}>{action}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </Card.Body>
                                </Card>
                            ))
                        ) : (
                            <Alert variant="success">
                                <Alert.Heading className="h6">All Good!</Alert.Heading>
                                <p className="mb-0">No recommendations at this time. Your content delivery system is performing well.</p>
                            </Alert>
                        )}
                    </div>
                </Tab>
            </Tabs>

            {/* Error Detail Modal */}
            <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Error Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedError && (
                        <div>
                            <Row className="mb-3">
                                <Col md={6}>
                                    <strong>Error ID:</strong> {selectedError.errorId}
                                </Col>
                                <Col md={6}>
                                    <strong>Timestamp:</strong> {new Date(selectedError.timestamp).toLocaleString()}
                                </Col>
                            </Row>
                            <Row className="mb-3">
                                <Col md={6}>
                                    <strong>Type:</strong> <Badge bg="secondary">{selectedError.type}</Badge>
                                </Col>
                                <Col md={6}>
                                    <strong>Severity:</strong> <Badge bg={
                                        selectedError.severity === 'critical' ? 'danger' :
                                            selectedError.severity === 'high' ? 'warning' :
                                                selectedError.severity === 'medium' ? 'info' : 'light'
                                    }>{selectedError.severity}</Badge>
                                </Col>
                            </Row>
                            <div className="mb-3">
                                <strong>Message:</strong>
                                <p className="mt-1">{selectedError.message}</p>
                            </div>
                            <div className="mb-3">
                                <strong>User Impact:</strong>
                                <p className="mt-1">{selectedError.userImpact}</p>
                            </div>
                            {selectedError.suggestedActions && (
                                <div className="mb-3">
                                    <strong>Suggested Actions:</strong>
                                    <ul className="mt-1">
                                        {selectedError.suggestedActions.map((action, index) => (
                                            <li key={index}>{action}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {selectedError.technicalDetails && (
                                <div>
                                    <strong>Technical Details:</strong>
                                    <pre className="mt-1 p-2 bg-light rounded small">
                                        {JSON.stringify(selectedError.technicalDetails, null, 2)}
                                    </pre>
                                </div>
                            )}
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
                        Close
                    </Button>
                    {selectedError && (
                        <Button
                            variant="primary"
                            onClick={() => handleValidateContent(selectedError.moduleId, selectedError.lessonId)}
                        >
                            Validate Content
                        </Button>
                    )}
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default ContentDeliveryDashboard;