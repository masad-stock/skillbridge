import { memo } from 'react';
import { Outlet } from 'react-router-dom';
import DashboardSidebar from './DashboardSidebar';
import DashboardHeader from './DashboardHeader';
import Footer from './Footer';
import { useUser } from '../context/UserContext';
import './AuthenticatedLayout.css';

function AuthenticatedLayout() {
    const { user, isOnline, logout } = useUser();

    return (
        <div className="authenticated-layout">
            {/* Skip links for accessibility */}
            <a href="#main-content" className="skip-link">
                Skip to main content
            </a>
            <a href="#sidebar-nav" className="skip-link">
                Skip to navigation
            </a>

            <DashboardSidebar />
            <div className="main-content-area">
                <DashboardHeader
                    user={user}
                    isOnline={isOnline}
                    onLogout={logout}
                />
                <main id="main-content" className="page-content" tabIndex="-1">
                    <Outlet />
                </main>
                <Footer />
            </div>
        </div>
    );
}

export default memo(AuthenticatedLayout);
