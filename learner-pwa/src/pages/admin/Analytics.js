import { useState, useEffect } from 'react';
import {
    Container,
    Row,
    Col,
    Card,
    Form,
    Alert,
    Spinner,
    Table,
    Badge
} from 'react-bootstrap';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
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
    Legend
} from 'chart.js';
import { adminAPI } from '../../services/api';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

function Analytics() {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [period, setPeriod] = useState('30');

    useEffect(() => {
        loadAnalytics();
    }, [period]);

    const loadAnalytics = async () => {
        try {
            setLoading(true);
            const response = await adminAPI.getAnalytics({ period });
            setAnalytics(response.data?.data || null);
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load analytics');
            setAnalytics(null);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Container className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3">Loading analytics...</p>
            </Container>
        );
    }

    if (error) {
        return (
            <Container>
                <Alert variant="danger">
                    <Alert.Heading>Error</Alert.Heading>
                    <p>{error}</p>
                </Alert>
            </Container>
        );
    }

    // Prepare chart data
    const userGrowthData = {
        labels: analytics?.userGrowth?.map(item => item._id) || [],
        datasets: [
            {
                label: 'New Users',
                data: analytics?.userGrowth?.map(item => item.count) || [],
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                tension: 0.4
            }
        ]
    };

    const assessmentStatsData = {
        labels: analytics?.assessmentStats?.map(item => item._id) || [],
        datasets: [
            {
                label: 'Count',
                data: analytics?.assessmentStats?.map(item => item.count) || [],
                backgroundColor: [
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(255, 206, 86, 0.6)',
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(255, 99, 132, 0.6)'
                ]
            }
        ]
    };

    const moduleEngagementData = {
        labels: analytics?.moduleEngagement?.map(item =>
            item.moduleInfo?.[0]?.title || 'Unknown'
        ).slice(0, 5) || [],
        datasets: [
            {
                label: 'Enrollments',
                data: analytics?.moduleEngagement?.map(item => item.enrollments).slice(0, 5) || [],
                backgroundColor: 'rgba(54, 162, 235, 0.6)'
            },
            {
                label: 'Completions',
                data: analytics?.moduleEngagement?.map(item => item.completions).slice(0, 5) || [],
                backgroundColor: 'rgba(75, 192, 192, 0.6)'
            }
        ]
    };

    const completionRatesData = {
        labels: analytics?.completionRates?.map(item => item._id) || [],
        datasets: [
            {
                label: 'Completion Rate (%)',
                data: analytics?.completionRates?.map(item => item.completionRate) || [],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(255, 206, 86, 0.6)',
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(153, 102, 255, 0.6)',
                    'rgba(255, 159, 64, 0.6)'
                ]
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top'
            }
        }
    };

    return (
        <Container fluid>
            <Row className="mb-4">
                <Col>
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h2 className="fw-bold">
                                <span className="me-2">📈</span>
                                Analytics
                            </h2>
                            <p className="text-muted">Platform performance and insights</p>
                        </div>
                        <Form.Select
                            value={period}
                            onChange={(e) => setPeriod(e.target.value)}
                            style={{ width: '200px' }}
                        >
                            <option value="7">Last 7 days</option>
                            <option value="30">Last 30 days</option>
                            <option value="90">Last 90 days</option>
                            <option value="365">Last year</option>
                        </Form.Select>
                    </div>
                </Col>
            </Row>

            {/* User Growth Chart */}
            <Row className="mb-4">
                <Col lg={12}>
                    <Card className="border-0 shadow-sm">
                        <Card.Header className="bg-white border-bottom">
                            <h5 className="mb-0 fw-bold">
                                <span className="me-2">👥</span>
                                User Growth
                            </h5>
                        </Card.Header>
                        <Card.Body style={{ height: '300px' }}>
                            <Line data={userGrowthData} options={chartOptions} />
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row className="mb-4">
                {/* Assessment Statistics */}
                <Col lg={6} className="mb-4">
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Header className="bg-white border-bottom">
                            <h5 className="mb-0 fw-bold">
                                <span className="me-2">📝</span>
                                Assessment Status
                            </h5>
                        </Card.Header>
                        <Card.Body style={{ height: '300px' }}>
                            <Doughnut data={assessmentStatsData} options={chartOptions} />
                        </Card.Body>
                    </Card>
                </Col>

                {/* Completion Rates by Category */}
                <Col lg={6} className="mb-4">
                    <Card className="border-0 shadow-sm h-100">
                        <Card.Header className="bg-white border-bottom">
                            <h5 className="mb-0 fw-bold">
                                <span className="me-2">✅</span>
                                Completion Rates by Category
                            </h5>
                        </Card.Header>
                        <Card.Body style={{ height: '300px' }}>
                            <Bar data={completionRatesData} options={chartOptions} />
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Module Engagement */}
            <Row className="mb-4">
                <Col lg={12}>
                    <Card className="border-0 shadow-sm">
                        <Card.Header className="bg-white border-bottom">
                            <h5 className="mb-0 fw-bold">
                                <span className="me-2">📚</span>
                                Top 5 Module Engagement
                            </h5>
                        </Card.Header>
                        <Card.Body style={{ height: '300px' }}>
                            <Bar data={moduleEngagementData} options={chartOptions} />
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Detailed Statistics Table */}
            <Row>
                <Col lg={6} className="mb-4">
                    <Card className="border-0 shadow-sm">
                        <Card.Header className="bg-white border-bottom">
                            <h5 className="mb-0 fw-bold">
                                <span className="me-2">📊</span>
                                Module Engagement Details
                            </h5>
                        </Card.Header>
                        <Card.Body className="p-0">
                            <Table hover responsive className="mb-0">
                                <thead className="bg-light">
                                    <tr>
                                        <th>Module</th>
                                        <th>Enrollments</th>
                                        <th>Completions</th>
                                        <th>Avg Progress</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {analytics?.moduleEngagement?.slice(0, 10).map((item, index) => (
                                        <tr key={index}>
                                            <td>
                                                {item.moduleInfo?.[0]?.title || 'Unknown Module'}
                                            </td>
                                            <td>
                                                <Badge bg="primary">{item.enrollments}</Badge>
                                            </td>
                                            <td>
                                                <Badge bg="success">{item.completions}</Badge>
                                            </td>
                                            <td>
                                                <Badge bg="info">
                                                    {item.avgProgress?.toFixed(1) || 0}%
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={6} className="mb-4">
                    <Card className="border-0 shadow-sm">
                        <Card.Header className="bg-white border-bottom">
                            <h5 className="mb-0 fw-bold">
                                <span className="me-2">📈</span>
                                Assessment Performance
                            </h5>
                        </Card.Header>
                        <Card.Body className="p-0">
                            <Table hover responsive className="mb-0">
                                <thead className="bg-light">
                                    <tr>
                                        <th>Status</th>
                                        <th>Count</th>
                                        <th>Avg Score</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {analytics?.assessmentStats?.map((item, index) => (
                                        <tr key={index}>
                                            <td>
                                                <Badge bg={
                                                    item._id === 'completed' ? 'success' :
                                                        item._id === 'in_progress' ? 'warning' :
                                                            'secondary'
                                                }>
                                                    {item._id}
                                                </Badge>
                                            </td>
                                            <td>{item.count}</td>
                                            <td>
                                                {item.avgScore ? `${item.avgScore.toFixed(1)}%` : 'N/A'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default Analytics;
