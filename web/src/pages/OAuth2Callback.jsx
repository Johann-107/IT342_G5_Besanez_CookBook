import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const OAuth2Callback = () => {
    const navigate = useNavigate();
    const { loginWithGoogle } = useAuth();

    useEffect(() => {
        try {
            const params = new URLSearchParams(window.location.search);

            const token = params.get('token');
            const userId = params.get('userId');
            const email = params.get('email');
            const firstName = params.get('firstName');
            const lastName = params.get('lastName');

            if (token) {
                loginWithGoogle(token, { userId, email, firstName, lastName });
                navigate('/dashboard', { replace: true });
            } else {
                navigate('/?error=true', { replace: true });
            }
        } catch (err) {
            console.error('OAuth2Callback error:', err);
            navigate('/?error=true', { replace: true });
        }
    }, [navigate, loginWithGoogle]);

    return (
        <div style={{ textAlign: 'center', marginTop: '50px', fontFamily: 'DM Sans, sans-serif', color: '#7A5C46' }}>
            <p>Signing you in with Google…</p>
        </div>
    );
};

export default OAuth2Callback;