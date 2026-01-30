import { useState } from 'react';
import { Container, Row, Col, Nav, Navbar, Offcanvas, Button } from 'react-bootstrap';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import '../pages/admin/AdminDashboard.css';

function AdminLayout() {
    const location = useLocation();
    const { user, logout } = useUser();
    const [showSidebar, setShowSidebar] = useState(false);

    const menuItems = [
        { path: '/admin', label: 'Dashboard', icon: '📊' },
        { path: '/admin/users', label: 'Users', icon: '👥' },
        { path: '/admin/modules', label: 'Modules', icon: '📚' },
        { path: '/admin/instructors', label: 'Instructors', icon: '👨‍🏫' },
        { path: '/admin/blog', label: 'Blog', icon: '📝' },
        { path: '/admin/events', label: 'Events', icon: '📅' },
        { path: '/admin/analytics', label: 'Analytics', icon: '📈' },
        { path: '/admin/settings', label: 'Settings', icon: '⚙️' }
    ];

    const isActive = (path) => {
        if (path === '/admin') {
            return location.pathname === '/admin';
        }
        return location.pathname.startsWith(path);
    };

    return (
        <div className="admin-layout">
            {/* Top Navigation */}
            <Navbar bg="dark" variant="dark" className="shadow-sm">
                <Container fluid>
                    <Button
                        variant="outline-light"
                        className="d-lg-none me-2"
                        onClick={() => setShowSidebar(true)}
                    >
                        ☰
                    </Button>
                    <Navbar.Brand>
                        <span className="me-2">🎓</span>
                        Admin Panel
                    </Navbar.Brand>
                    <Nav className="ms-auto">
                        <Nav.Link as={Link} to="/" className="text-light">
                            <span className="me-1">🏠</span>
                            Back to Site
                        </Nav.Link>
                        <Nav.Link className="text-light">
                            <span className="me-1">👤</span>
                            {user?.profile?.firstName || 'Admin'}
                        </Nav.Link>
                        <Button variant="outline-light" size="sm" onClick={logout}>
                            Logout
                        </Button>
                    </Nav>
                </Container>
            </Navbar>

            <Container fluid>
                <Row>
                    {/* Desktop Sidebar */}
                    <Col lg={2} className="d-none d-lg-block bg-light border-end min-vh-100 p-0">
                        <Nav className="flex-column p-3">
                            {menuItems.map((item) => (
                                <Nav.Link
                                    key={item.path}
                                    as={Link}
                                    to={item.path}
                                    className={`py-3 px-3 mb-2 rounded ${isActive(item.path)
                                        ? 'bg-primary text-white'
                                        : 'text-dark hover-bg-light'
                                        }`}
                                >
                                    <span className="me-2 fs-5">{item.icon}</span>
                                    <span>{item.label}</span>
                                </Nav.Link>
                            ))}
                        </Nav>
                    </Col>

                    {/* Main Content */}
                    <Col lg={10} className="p-4">
                        <Outlet />
                    </Col>
                </Row>
            </Container>

            {/* Mobile Sidebar */}
            <Offcanvas
                show={showSidebar}
                onHide={() => setShowSidebar(false)}
                placement="start"
            >
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title>
                        <span className="me-2">🎓</span>
                        Admin Menu
                    </Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                    <Nav className="flex-column">
                        {menuItems.map((item) => (
                            <Nav.Link
                                key={item.path}
                                as={Link}
                                to={item.path}
                                className={`py-3 px-3 mb-2 rounded ${isActive(item.path)
                                    ? 'bg-primary text-white'
                                    : 'text-dark'
                                    }`}
                                onClick={() => setShowSidebar(false)}
                            >
                                <span className="me-2 fs-5">{item.icon}</span>
                                <span>{item.label}</span>
                            </Nav.Link>
                        ))}
                    </Nav>
                </Offcanvas.Body>
            </Offcanvas>
        </div>
    );
}

export default AdminLayout;
