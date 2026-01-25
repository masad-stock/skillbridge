import { useState, useEffect, useRef, memo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './DashboardSidebar.css';

function DashboardSidebar() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useTranslation();
    const sidebarRef = useRef(null);
    const scrollPositionRef = useRef(0);

    // Navigation items
    const navItems = [
        {
            path: '/dashboard',
            icon: '📊',
            label: t('nav.dashboard', 'Dashboard'),
            translationKey: 'nav.dashboard'
        },
        {
            path: '/learning',
            icon: '📚',
            label: t('nav.learning', 'Learning Path'),
            translationKey: 'nav.learning'
        },
        {
            path: '/assessment',
            icon: '✅',
            label: t('nav.assessment', 'Assessment'),
            translationKey: 'nav.assessment'
        },
        {
            path: '/business-tools',
            icon: '💼',
            label: t('nav.business', 'Business Tools'),
            translationKey: 'nav.business'
        },
        {
            path: '/certificates',
            icon: '🎓',
            label: t('nav.certificates', 'Certificates'),
            translationKey: 'nav.certificates'
        },
        {
            path: '/profile',
            icon: '👤',
            label: t('nav.profile', 'Profile'),
            translationKey: 'nav.profile'
        }
    ];

    // Handle window resize
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (mobile) {
                setIsCollapsed(true);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Auto-collapse on mobile
    useEffect(() => {
        if (isMobile) {
            setIsCollapsed(true);
        }
    }, [isMobile]);

    // Preserve scroll position
    useEffect(() => {
        const sidebar = sidebarRef.current;
        if (sidebar) {
            // Restore scroll position
            sidebar.scrollTop = scrollPositionRef.current;

            // Save scroll position on scroll
            const handleScroll = () => {
                scrollPositionRef.current = sidebar.scrollTop;
            };

            sidebar.addEventListener('scroll', handleScroll);
            return () => sidebar.removeEventListener('scroll', handleScroll);
        }
    }, [location.pathname]);

    const handleNavigation = (path) => {
        navigate(path);
        // Auto-collapse on mobile after navigation
        if (isMobile) {
            setIsCollapsed(true);
        }
    };

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
    };

    const isActive = (path) => {
        return location.pathname === path;
    };

    return (
        <>
            {/* Mobile overlay */}
            {isMobile && !isCollapsed && (
                <div className="sidebar-overlay" onClick={toggleSidebar}></div>
            )}

            {/* Sidebar */}
            <aside className={`dashboard-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
                {/* Toggle button */}
                <button
                    className="sidebar-toggle"
                    onClick={toggleSidebar}
                    aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                    {isCollapsed ? '☰' : '✕'}
                </button>

                {/* Navigation */}
                <nav className="sidebar-nav">
                    {navItems.map((item) => (
                        <button
                            key={item.path}
                            className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
                            onClick={() => handleNavigation(item.path)}
                            title={item.label}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            {!isCollapsed && <span className="nav-label">{item.label}</span>}
                        </button>
                    ))}
                </nav>
            </aside>
        </>
    );
}

export default memo(DashboardSidebar);
