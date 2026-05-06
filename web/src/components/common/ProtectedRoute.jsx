import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingScreen from './LoadingScreen';
import { UtensilsCrossed } from 'lucide-react';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <LoadingScreen
                icon={<UtensilsCrossed size={52} strokeWidth={1.3} />}
                message="Getting your cookbook ready…"
            />
        );
    }

    if (!user) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;