import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingScreen from './LoadingScreen';
import { ShieldCheck } from 'lucide-react';

const AdminRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <LoadingScreen
                icon={<ShieldCheck size={52} strokeWidth={1.3} />}
                message="Verifying access…"
            />
        );
    }

    if (!user) return <Navigate to="/" replace />;
    if (user.role !== 'ADMIN') return <Navigate to="/dashboard" replace />;

    return children;
};

export default AdminRoute;