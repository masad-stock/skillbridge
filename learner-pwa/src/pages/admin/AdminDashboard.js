import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Alert, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import './AdminDashboard.css';

function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            setLoading(true);
            const response = await adminAPI.getDashboard();
            setStats(response.data?.data || null);
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load dashboard');
            setStats(null);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Container className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3 text-muted">Loading dashboard...</p>
            </Container>
        );
    }

    if (error) {
        return (
            <Container>
                <Alert variant="danger" className="border-0 shadow-sm">
                    <Alert.Heading>⚠️ Error</Alert.Heading>
                    <p className="mb-0">{error}</p>
                </Alert>
            </Container>
        );
    }

    return (
        <div className="admin-dashboard">
            <Container fluid>
                {/* Welcome Banner */}
                <div className="welcome-banner mb-4">
                    <h2 className="mb-2">
                        <span className="me-2">👋</span>
                        Welcome to Admin Dashboard
                    </h2>
                    <p className="mb-0 opacity-90">
                        Monitor platform performance and manage your learning community
                    </p>
                </div>

                {/* Stats Cards */}
                <Row className="mb-4 g-4">
                    <Col lg={3} md={6}>
                        <Card className="stat-card users h-100">
                            <Card.Body>
                                <div className="d-flex justify-content-between align-items-start">
                                    <div>
                                        <p className="stat-label mb-2">Total Users</p>
                                        <h2 className="stat-value mb-2">{stats?.users?.total || 0}</h2>
                                        <span className="stat-change positive">
                                            <span>✓</span> {stats?.users?.active || 0} active
                                        </span>
                                    </div>
                                    <div className="stat-icon">
                                        👥
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col lg={3} md={6}>
                        <Card className="stat-card modules h-100">
                            <Card.Body>
                                <div className="d-flex justify-content-between align-items-start">
                                    <div>
                                        <p className="stat-label mb-2">Total Modules</p>
                                        <h2 className="stat-value mb-2">{stats?.modules?.total || 0}</h2>
                                        <span className="stat-change positive">
                                            <span>📖</span> Learning content
                                        </span>
                                    </div>
                                    <div className="stat-icon">
                                        📚
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col lg={3} md={6}>
                        <Card className="stat-card assessments h-100">
                            <Card.Body>
                                <div className="d-flex justify-content-between align-items-start">
                                    <div>
                                        <p className="stat-label mb-2">Assessments</p>
                                        <h2 className="stat-value mb-2">{stats?.assessments?.total || 0}</h2>
                                        <span className="stat-change positive">
                                            <span>✓</span> {stats?.assessments?.completed || 0} completed
                                        </span>
                                    </div>
                                    <div className="stat-icon">
                                        📝
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col lg={3} md={6}>
                        <Card className="stat-card completion h-100">
                            <Card.Body>
                                <div className="d-flex justify-content-between align-items-start">
                                    <div>
                                        <p className="stat-label mb-2">Completion Rate</p>
                                        <h2 className="stat-value mb-2">
                                            {stats?.assessments?.completionRate || 0}%
                                        </h2>
                                        <span className="stat-change positive">
                                            <span>⭐</span> Platform metric
                                        </span>
                                    </div>
                                    <div className="stat-icon">
                                        📈
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                <Row className="g-4">
                    {/* Recent Users */}
                    <Col lg={6}>
                        <Card className="admin-card h-100">
                            <Card.Header>
                                <div className="d-flex justify-content-between align-items-center">
                                    <h5 className="mb-0">
                                        <span className="me-2">👤</span>
                                        Recent Users
                                    </h5>
                                    <Link to="/admin/users" className="btn btn-sm btn-outline-primary">
                                        View All →
                                    </Link>
                                </div>
                            </Card.Header>
                            <Card.Body className="p-0">
                                {stats?.recentUsers && stats.recentUsers.length > 0 ? (
                                    <Table className="data-table mb-0" hover responsive>
                                        <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>Email</th>
                                                <th>Joined</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {stats.recentUsers.map((user) => (
                                                <tr key={user._id}>
                                                    <td className="fw-medium">
                                                        {user.profile?.firstName} {user.profile?.lastName}
                                                    </td>
                                                    <td>{user.email}</td>
                                                    <td>
                                                        <Badge className="admin-badge admin-badge-info">
                                                            {new Date(user.createdAt).toLocaleDateString()}
                                                        </Badge>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                ) : (
                                    <div className="text-center py-5">
                                        <div className="fs-1 mb-3 opacity-50">👥</div>
                                        <p className="text-muted mb-0">No recent users</p>
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* Popular Modules */}
                    <Col lg={6}>
                        <Card className="admin-card h-100">
                            <Card.Header>
                                <div className="d-flex justify-content-between align-items-center">
                                    <h5 className="mb-0">
                                        <span className="me-2">🔥</span>
                                        Popular Modules
                                    </h5>
                                    <Link to="/admin/modules" className="btn btn-sm btn-outline-primary">
                                        View All →
                                    </Link>
                                </div>
                            </Card.Header>
                            <Card.Body className="p-0">
                                {stats?.popularModules && stats.popularModules.length > 0 ? (
                                    <Table className="data-table mb-0" hover responsive>
                                        <thead>
                                            <tr>
                                                <th>Module</th>
                                                <th>Enrollments</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {stats.popularModules.map((item) => (
                                                <tr key={item._id}>
                                                    <td className="fw-medium">
                                                        {item.moduleInfo && item.moduleInfo[0]
                                                            ? item.moduleInfo[0].title
                                                            : 'Unknown Module'}
                                                    </td>
                                                    <td>
                                                        <Badge className="admin-badge admin-badge-primary">
                                                            {item.count} enrolled
                                                        </Badge>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                ) : (
                                    <div className="text-center py-5">
                                        <div className="fs-1 mb-3 opacity-50">📚</div>
                                        <p className="text-muted mb-0">No module data</p>
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                {/* Quick Actions */}
                <Row className="mt-4">
                    <Col>
                        <Card className="admin-card">
                            <Card.Header>
                                <h5 className="mb-0">
                                    <span className="me-2">⚡</span>
                                    Quick Actions
                                </h5>
                            </Card.Header>
                            <Card.Body>
                                <Row className="g-3">
                                    <Col lg={3} md={6}>
                                        <Link to="/admin/users" className="quick-action-card users card h-100 text-center p-4">
                                            <div className="action-icon">👥</div>
                                            <div className="action-title">Manage Users</div>
                                            <div className="action-description">View and manage all users</div>
                                        </Link>
                                    </Col>
                                    <Col lg={3} md={6}>
                                        <Link to="/admin/modules" className="quick-action-card modules card h-100 text-center p-4">
                                            <div className="action-icon">📚</div>
                                            <div className="action-title">Manage Modules</div>
                                            <div className="action-description">Edit learning content</div>
                                        </Link>
                                    </Col>
                                    <Col lg={3} md={6}>
                                        <Link to="/admin/content-delivery" className="quick-action-card content-delivery card h-100 text-center p-4">
                                            <div className="action-icon">🚀</div>
                                            <div className="action-title">Content Delivery</div>
                                            <div className="action-description">Monitor content performance</div>
                                        </Link>
                                    </Col>
                                    <Col lg={3} md={6}>
                                        <Link to="/admin/analytics" className="quick-action-card analytics card h-100 text-center p-4">
                                            <div className="action-icon">📈</div>
                                            <div className="action-title">View Analytics</div>
                                            <div className="action-description">Platform insights</div>
                                        </Link>
                                    </Col>
                                </Row>
                                <Row className="g-3 mt-2">
                                    <Col lg={3} md={6}>
                                        <Link to="/admin/settings" className="quick-action-card settings card h-100 text-center p-4">
                                            <div className="action-icon">⚙️</div>
                                            <div className="action-title">Settings</div>
                                            <div className="action-description">Configure platform</div>
                                        </Link>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}

export default AdminDashboard;
