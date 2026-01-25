import { Navigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

function PublicRoute({ children }) {
    const { isAuthenticated, loading } = useUser();

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    // If authenticated, redirect to dashboard
    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}

export default PublicRoute;
