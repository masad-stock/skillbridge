import { useState, useEffect } from 'react';
import { Navbar, Nav, Container, Button, Offcanvas } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useTranslation } from 'react-i18next';
import AuthModal from './AuthModal';
import ThemeToggle from './ThemeToggle';
import LanguageToggle from './LanguageToggle';

function Header() {
    const { user, isAuthenticated, logout } = useUser();
    const { t } = useTranslation();
    const location = useLocation();
    const [showOffcanvas, setShowOffcanvas] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    const handleLogout = () => {
        logout();
        setShowOffcanvas(false);
    };

    // Add scroll effect for dynamic header
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navItems = [
        { path: '/', label: t('nav.home'), hideWhenAuth: true }, // Hide Home when authenticated
        { path: '/dashboard', label: t('nav.dashboard'), authRequired: true },
        { path: '/learning', label: t('nav.learning'), authRequired: true },
        { path: '/certificates', label: t('nav.certificates'), authRequired: true },
    ];

    return (
        <>
            {/* Beautiful Header with Glassmorphism Effect */}
            <Navbar
                expand="lg"
                fixed="top"
                className={`beautiful-header ${isScrolled ? 'scrolled' : ''}`}
                style={{
                    zIndex: 1030,
                    backdropFilter: 'blur(20px)',
                    background: isScrolled
                        ? 'rgba(255, 255, 255, 0.95)'
                        : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
                    borderBottom: isScrolled ? '1px solid rgba(226, 232, 240, 0.5)' : 'none',
                    boxShadow: isScrolled ? '0 8px 32px rgba(0, 0, 0, 0.1)' : '0 4px 32px rgba(0, 0, 0, 0.05)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
            >
                <Container>
                    {/* Enhanced Brand with Animation */}
                    <Navbar.Brand as={Link} to="/" className="d-flex align-items-center brand-container">
                        <div className="brand-icon-wrapper">
                            <span className="brand-icon">🎓</span>
                            <div className="brand-glow"></div>
                        </div>
                        <div className="brand-text-container">
                            <span className="brand-main">SkillBridge</span>
                            <span className="brand-sub">254</span>
                        </div>
                    </Navbar.Brand>

                    {/* Desktop Navigation */}
                    <Nav className="mx-auto d-none d-lg-flex nav-links">
                        {navItems.map((item) => {
                            if (item.authRequired && !isAuthenticated) return null;
                            if (item.hideWhenAuth && isAuthenticated) return null;
                            return (
                                <Nav.Link
                                    key={item.path}
                                    as={Link}
                                    to={item.path}
                                    className={`nav-link-beautiful ${location.pathname === item.path ? 'active' : ''}`}
                                >
                                    <span className="nav-text">{item.label}</span>
                                    {location.pathname === item.path && <div className="nav-indicator"></div>}
                                </Nav.Link>
                            );
                        })}
                    </Nav>

                    {/* Right Side Controls */}
                    <div className="d-flex align-items-center order-lg-3 controls-container">
                        {/* Theme and Language Toggles with Enhanced Styling */}
                        <div className="d-flex align-items-center gap-2 me-3 toggle-container">
                            <div className="toggle-wrapper">
                                <ThemeToggle />
                            </div>
                            <div className="toggle-wrapper">
                                <LanguageToggle />
                            </div>
                        </div>

                        {/* Authentication Buttons */}
                        {!isAuthenticated ? (
                            <div className="d-none d-lg-flex gap-2 auth-buttons">
                                <Button
                                    variant="outline-primary"
                                    size="sm"
                                    className="btn-outline-beautiful"
                                    onClick={() => setShowAuthModal(true)}
                                >
                                    <span className="btn-text">{t('nav.login')}</span>
                                </Button>
                                <Button
                                    variant="primary"
                                    size="sm"
                                    className="btn-primary-beautiful"
                                    onClick={() => setShowAuthModal(true)}
                                >
                                    <span className="btn-text">{t('nav.register')}</span>
                                    <div className="btn-shine"></div>
                                </Button>
                            </div>
                        ) : (
                            <div className="d-none d-lg-flex align-items-center gap-2 user-controls">
                                <Link to="/dashboard" className="text-decoration-none">
                                    <div className="user-profile">
                                        <div className="user-avatar">
                                            <span className="avatar-text">
                                                {(user?.profile?.firstName || 'U')[0].toUpperCase()}
                                            </span>
                                        </div>
                                        <span className="user-name">{user?.profile?.firstName || 'Profile'}</span>
                                    </div>
                                </Link>
                                <Button
                                    variant="outline-danger"
                                    size="sm"
                                    className="btn-logout-beautiful"
                                    onClick={handleLogout}
                                >
                                    <span className="btn-text">{t('nav.logout')}</span>
                                </Button>
                            </div>
                        )}

                        {/* Mobile Menu Toggle */}
                        <Button
                            variant="link"
                            className="mobile-toggle"
                            onClick={() => setShowOffcanvas(true)}
                        >
                            <div className="hamburger">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </Button>
                    </div>
                </Container>
            </Navbar>

            {/* Enhanced Offcanvas Menu */}
            <Offcanvas
                id="offcanvas-navbar"
                aria-labelledby="offcanvas-navbar-label"
                placement="end"
                show={showOffcanvas}
                onHide={() => setShowOffcanvas(false)}
                className="beautiful-offcanvas"
            >
                <Offcanvas.Header className="offcanvas-header-beautiful">
                    <Offcanvas.Title id="offcanvas-navbar-label" className="offcanvas-title">
                        <div className="brand-icon-wrapper">
                            <span className="brand-icon">🎓</span>
                        </div>
                        <span className="brand-main">SkillBridge254</span>
                    </Offcanvas.Title>
                    <button
                        type="button"
                        className="btn-close-beautiful"
                        onClick={() => setShowOffcanvas(false)}
                    >
                        <span>×</span>
                    </button>
                </Offcanvas.Header>
                <Offcanvas.Body className="offcanvas-body-beautiful">
                    <Nav className="flex-column nav-mobile">
                        {navItems.map((item) => {
                            if (item.authRequired && !isAuthenticated) return null;
                            if (item.hideWhenAuth && isAuthenticated) return null;
                            return (
                                <Nav.Link
                                    key={item.path}
                                    as={Link}
                                    to={item.path}
                                    className={`nav-link-mobile ${location.pathname === item.path ? 'active' : ''}`}
                                    onClick={() => setShowOffcanvas(false)}
                                >
                                    <span className="nav-text">{item.label}</span>
                                    {location.pathname === item.path && <div className="nav-indicator"></div>}
                                </Nav.Link>
                            );
                        })}
                    </Nav>

                    {/* Mobile Auth Section */}
                    <div className="mobile-auth-section">
                        {!isAuthenticated ? (
                            <div className="d-grid gap-3">
                                <Button
                                    variant="outline-primary"
                                    className="btn-mobile-outline"
                                    onClick={() => {
                                        setShowOffcanvas(false);
                                        setShowAuthModal(true);
                                    }}
                                >
                                    <span className="btn-text">{t('nav.login')}</span>
                                </Button>
                                <Button
                                    variant="primary"
                                    className="btn-mobile-primary"
                                    onClick={() => {
                                        setShowOffcanvas(false);
                                        setShowAuthModal(true);
                                    }}
                                >
                                    <span className="btn-text">{t('nav.register')}</span>
                                    <div className="btn-shine"></div>
                                </Button>
                            </div>
                        ) : (
                            <div className="user-section-mobile">
                                <div className="user-info-mobile">
                                    <div className="user-avatar-mobile">
                                        <span className="avatar-text">
                                            {(user?.profile?.firstName || 'U')[0].toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="user-details">
                                        <div className="welcome-text">{t('dashboard.welcome')}</div>
                                        <div className="user-name-mobile">{user?.profile?.firstName || 'User'}</div>
                                    </div>
                                </div>
                                <Button
                                    variant="outline-danger"
                                    className="btn-mobile-logout"
                                    onClick={handleLogout}
                                >
                                    <span className="btn-text">{t('nav.logout')}</span>
                                </Button>
                            </div>
                        )}
                    </div>
                </Offcanvas.Body>
            </Offcanvas>

            <AuthModal show={showAuthModal} onHide={() => setShowAuthModal(false)} />
        </>
    );
}

export default Header;
