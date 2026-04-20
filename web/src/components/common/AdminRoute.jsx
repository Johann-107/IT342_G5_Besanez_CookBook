import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * AdminRoute — renders children only if the logged-in user has role === 'ADMIN'.
 * Non-admins are redirected to /dashboard; unauthenticated users go to /.
 */
const AdminRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                height: '100vh', fontFamily: "'DM Sans', sans-serif",
                color: '#B09080', fontSize: '0.9rem', gap: '10px'
            }}>
                <span style={{ fontSize: '1.5rem' }}>🍳</span> Loading…
            </div>
        );
    }

    if (!user) return <Navigate to="/" replace />;
    if (user.role !== 'ADMIN') return <Navigate to="/dashboard" replace />;

    return children;
};

export default AdminRoute;