import React, { useState } from 'react';
import { Navbar, Nav, Container, Button, Offcanvas } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useOffline } from '../context/OfflineContext';

function Header() {
    const { user, isAuthenticated, dispatch } = useUser();
    const isOnline = useOffline();
    const location = useLocation();
    const [showOffcanvas, setShowOffcanvas] = useState(false);

    const handleLogout = () => {
        dispatch({ type: 'LOGOUT' });
        localStorage.removeItem('adaptiveLearningUser');
    };

    const navItems = [
        { path: '/', label: 'Home', icon: '🏠' },
        { path: '/dashboard', label: 'Dashboard', icon: '📈' },
        { path: '/assessment', label: 'Assessment', icon: '📊' },
        { path: '/learning', label: 'Learning', icon: '📚' },
        { path: '/business-tools', label: 'Business Tools', icon: '💼' }
    ];

    return (
        <>
            <Navbar bg="primary" variant="dark" expand="lg" sticky="top" className="shadow-sm">
                <Container>
                    <Navbar.Brand as={Link} to="/" className="fw-bold">
                        <span className="me-2">🎓</span>
                        SkillBridge254
                    </Navbar.Brand>

                    {/* Connection Status Indicator */}
                    <div className="d-flex align-items-center me-3">
                        <span className={`badge ${isOnline ? 'bg-success' : 'bg-warning'} me-2`}>
                            {isOnline ? '🌐 Online' : '📱 Offline'}
                        </span>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <Button
                        variant="outline-light"
                        className="d-lg-none"
                        onClick={() => setShowOffcanvas(true)}
                    >
                        ☰
                    </Button>

                    {/* Desktop Navigation */}
                    <Navbar.Collapse id="basic-navbar-nav" className="d-none d-lg-block">
                        <Nav className="me-auto">
                            {navItems.map((item) => (
                                <Nav.Link
                                    key={item.path}
                                    as={Link}
                                    to={item.path}
                                    className={location.pathname === item.path ? 'active fw-bold' : ''}
                                >
                                    <span className="me-1">{item.icon}</span>
                                    {item.label}
                                </Nav.Link>
                            ))}
                        </Nav>

                        <Nav>
                            {isAuthenticated ? (
                                <>
                                    <Nav.Link as={Link} to="/profile" className="me-2">
                                        <span className="me-1">👤</span>
                                        {user?.name || 'User'}
                                    </Nav.Link>
                                    <Button variant="outline-light" size="sm" onClick={handleLogout}>
                                        Logout
                                    </Button>
                                </>
                            ) : (
                                <Button variant="light" size="sm" as={Link} to="/profile">
                                    Login / Register
                                </Button>
                            )}
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            {/* Mobile Offcanvas Menu */}
            <Offcanvas
                show={showOffcanvas}
                onHide={() => setShowOffcanvas(false)}
                placement="end"
                className="bg-primary text-white"
            >
                <Offcanvas.Header closeButton closeVariant="white">
                    <Offcanvas.Title>
                        <span className="me-2">🎓</span>
                        SkillBridge254
                    </Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                    <Nav className="flex-column">
                        {navItems.map((item) => (
                            <Nav.Link
                                key={item.path}
                                as={Link}
                                to={item.path}
                                className={`text-white py-3 border-bottom ${location.pathname === item.path ? 'active fw-bold' : ''
                                    }`}
                                onClick={() => setShowOffcanvas(false)}
                            >
                                <span className="me-2 fs-5">{item.icon}</span>
                                <span className="fs-6">{item.label}</span>
                            </Nav.Link>
                        ))}
                    </Nav>

                    <div className="mt-4 pt-4 border-top">
                        {isAuthenticated ? (
                            <>
                                <div className="mb-3">
                                    <span className="me-2">👤</span>
                                    {user?.name || 'User'}
                                </div>
                                <Button
                                    variant="outline-light"
                                    className="w-100"
                                    onClick={() => {
                                        handleLogout();
                                        setShowOffcanvas(false);
                                    }}
                                >
                                    Logout
                                </Button>
                            </>
                        ) : (
                            <Button
                                variant="light"
                                className="w-100"
                                as={Link}
                                to="/profile"
                                onClick={() => setShowOffcanvas(false)}
                            >
                                Login / Register
                            </Button>
                        )}
                    </div>
                </Offcanvas.Body>
            </Offcanvas>
        </>
    );
}

export default Header;