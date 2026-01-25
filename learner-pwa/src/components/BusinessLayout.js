import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Badge, Alert, Nav, Navbar, Offcanvas } from 'react-bootstrap';
import { useBusiness } from '../context/BusinessContext';
import { useUser } from '../context/UserContext';

function BusinessLayout({ children, activeTab, onTabChange }) {
    const { state } = useBusiness();
    const { isOnline } = useUser();
    const [showMobileMenu, setShowMobileMenu] = useState(false);

    const tools = [
        {
            id: 'dashboard',
            title: 'Dashboard',
            icon: '📊',
            description: 'Business overview and analytics',
            color: 'primary'
        },
        {
            id: 'inventory',
            title: 'Inventory',
            icon: '📦',
            description: 'Manage products and stock',
            color: 'primary',
            badge: state.inventory.lowStockCount > 0 ? state.inventory.lowStockCount : null
        },
        {
            id: 'customers',
            title: 'Customers',
            icon: '👥',
            description: 'Customer management',
            color: 'success'
        },
        {
            id: 'sales',
            title: 'Sales',
            icon: '💰',
            description: 'Record sales and invoices',
            color: 'info'
        },
        {
            id: 'expenses',
            title: 'Expenses',
            icon: '💸',
            description: 'Track business expenses',
            color: 'danger'
        },
        {
            id: 'suppliers',
            title: 'Suppliers',
            icon: '🚚',
            description: 'Manage suppliers',
            color: 'warning'
        },
        {
            id: 'reports',
            title: 'Reports',
            icon: '📈',
            description: 'Business reports and analytics',
            color: 'secondary'
        },
        {
            id: 'settings',
            title: 'Settings',
            icon: '⚙️',
            description: 'Business settings',
            color: 'dark'
        }
    ];

    const QuickStats = () => (
        <Row className="mb-4">
            <Col md={3} sm={6} className="mb-3">
                <Card className="border-0 bg-primary text-white h-100">
                    <Card.Body className="text-center p-3">
                        <div className="fs-4 mb-2">💰</div>
                        <h6 className="mb-1">Revenue</h6>
                        <h5 className="mb-0">KSh {state.sales.totalRevenue?.toLocaleString() || 0}</h5>
                    </Card.Body>
                </Card>
            </Col>
            <Col md={3} sm={6} className="mb-3">
                <Card className="border-0 bg-success text-white h-100">
                    <Card.Body className="text-center p-3">
                        <div className="fs-4 mb-2">📦</div>
                        <h6 className="mb-1">Inventory</h6>
                        <h5 className="mb-0">{state.inventory.data?.length || 0} items</h5>
                    </Card.Body>
                </Card>
            </Col>
            <Col md={3} sm={6} className="mb-3">
                <Card className="border-0 bg-info text-white h-100">
                    <Card.Body className="text-center p-3">
                        <div className="fs-4 mb-2">👥</div>
                        <h6 className="mb-1">Customers</h6>
                        <h5 className="mb-0">{state.customers.data?.length || 0}</h5>
                    </Card.Body>
                </Card>
            </Col>
            <Col md={3} sm={6} className="mb-3">
                <Card className="border-0 bg-warning text-white h-100">
                    <Card.Body className="text-center p-3">
                        <div className="fs-4 mb-2">💸</div>
                        <h6 className="mb-1">Expenses</h6>
                        <h5 className="mb-0">KSh {state.expenses.totalExpenses?.toLocaleString() || 0}</h5>
                    </Card.Body>
                </Card>
            </Col>
        </Row>
    );

    return (
        <div className="business-layout">
            {/* Header */}
            <Navbar bg="white" expand="lg" className="border-bottom sticky-top">
                <Container fluid>
                    <div className="d-flex align-items-center">
                        <h4 className="mb-0 me-3">
                            <span className="me-2">💼</span>
                            Business Tools
                        </h4>
                        {!isOnline && (
                            <Badge bg="warning" className="me-2">
                                <span className="me-1">📱</span>
                                Offline
                            </Badge>
                        )}
                        {state.offlineQueue?.length > 0 && (
                            <Badge bg="info">
                                <span className="me-1">⏳</span>
                                {state.offlineQueue.length} pending
                            </Badge>
                        )}
                    </div>

                    <Navbar.Toggle
                        aria-controls="business-nav"
                        onClick={() => setShowMobileMenu(true)}
                        className="d-lg-none"
                    />

                    <Navbar.Collapse id="business-nav" className="d-none d-lg-block">
                        <Nav className="ms-auto">
                            {tools.map(tool => (
                                <Nav.Item key={tool.id}>
                                    <Button
                                        variant={activeTab === tool.id ? tool.color : 'light'}
                                        className="me-2 position-relative"
                                        onClick={() => onTabChange(tool.id)}
                                    >
                                        <span className="me-1">{tool.icon}</span>
                                        {tool.title}
                                        {tool.badge && (
                                            <Badge bg="danger" className="ms-1 position-absolute top-0 start-100 translate-middle">
                                                {tool.badge}
                                            </Badge>
                                        )}
                                    </Button>
                                </Nav.Item>
                            ))}
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            {/* Mobile Menu */}
            <Offcanvas show={showMobileMenu} onHide={() => setShowMobileMenu(false)} placement="end">
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title>Business Tools</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                    <div className="d-grid gap-2">
                        {tools.map(tool => (
                            <Button
                                key={tool.id}
                                variant={activeTab === tool.id ? tool.color : 'outline-primary'}
                                className="text-start position-relative"
                                onClick={() => {
                                    onTabChange(tool.id);
                                    setShowMobileMenu(false);
                                }}
                            >
                                <span className="me-2">{tool.icon}</span>
                                {tool.title}
                                {tool.badge && (
                                    <Badge bg="danger" className="ms-2">
                                        {tool.badge}
                                    </Badge>
                                )}
                            </Button>
                        ))}
                    </div>
                </Offcanvas.Body>
            </Offcanvas>

            {/* Main Content */}
            <Container fluid className="py-4">
                {/* Quick Stats - Only show on dashboard */}
                {activeTab === 'dashboard' && <QuickStats />}

                {/* Error Alert */}
                {state.error && (
                    <Alert variant="danger" className="mb-4" dismissible onClose={() => {}}>
                        <Alert.Heading>Error</Alert.Heading>
                        <p className="mb-0">{state.error}</p>
                    </Alert>
                )}

                {/* Loading Indicator */}
                {state.loading && (
                    <div className="text-center py-4">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-2 text-muted">Loading business data...</p>
                    </div>
                )}

                {/* Page Content */}
                {children}
            </Container>
        </div>
    );
}

export default BusinessLayout;
