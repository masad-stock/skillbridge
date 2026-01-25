import { Navigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

function ProtectedRoute({ children }) {
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

    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    return children;
}

export default ProtectedRoute;
