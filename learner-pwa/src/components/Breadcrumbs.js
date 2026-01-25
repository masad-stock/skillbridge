import { Breadcrumb } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';

const routeLabels = {
    '/': 'Home',
    '/about': 'About',
    '/dashboard': 'Dashboard',
    '/assessment': 'Skills Assessment',
    '/assessment-info': 'Assessment Info',
    '/learning': 'Learning Path',
    '/learning-info': 'Learning Info',
    '/business-tools': 'Business Tools',
    '/business-tools-info': 'Business Tools Info',
    '/profile': 'Profile',
    '/certificates': 'Certificates',
    '/payments': 'Payment History',
    '/search': 'Search',
    '/forgot-password': 'Forgot Password',
    '/reset-password': 'Reset Password',
    '/change-password': 'Change Password',
    '/admin': 'Admin Dashboard',
    '/admin/users': 'User Management',
    '/admin/modules': 'Module Management',
    '/admin/analytics': 'Analytics',
    '/admin/settings': 'Settings'
};

function Breadcrumbs() {
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter((x) => x);

    // Don't show breadcrumbs on home page
    if (location.pathname === '/') {
        return null;
    }

    return (
        <Breadcrumb className="mb-3">
            <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/' }}>
                <span className="me-1">🏠</span>
                Home
            </Breadcrumb.Item>
            {pathnames.map((name, index) => {
                const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
                const isLast = index === pathnames.length - 1;
                const label = routeLabels[routeTo] || name.charAt(0).toUpperCase() + name.slice(1).replace(/-/g, ' ');

                return isLast ? (
                    <Breadcrumb.Item key={routeTo} active>
                        {label}
                    </Breadcrumb.Item>
                ) : (
                    <Breadcrumb.Item key={routeTo} linkAs={Link} linkProps={{ to: routeTo }}>
                        {label}
                    </Breadcrumb.Item>
                );
            })}
        </Breadcrumb>
    );
}

export default Breadcrumbs;
