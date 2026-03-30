import { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/auth';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');

            if (!token) {          // Fixed: skip API call entirely if no token
                setLoading(false);
                return;
            }

            try {
                const response = await authAPI.getProfile();
                setUser(response.data);
            } catch (error) {
                console.error('Auth check failed: ', error);
                localStorage.removeItem('token');
            }
            setLoading(false);
        };
        checkAuth();
    }, []);

    const login = async (email, password) => {
        try {
            const response = await authAPI.login({ email, password });
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                setUser(response.data.user);
                return { success: true };
            }
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Something went wrong. Ulitin mo boss / AuthContext.jsx | const login'
            };
        }
    };

    const register = async (userData) => {
        try {
            console.log('Sending registration data:', userData);
            const response = await authAPI.register(userData);
            console.log('Registration response:', response.data);

            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                setUser(response.data.user);
                return { success: true };
            } else if (response.data?.success === true || response.status === 201 || response.status === 200) {
                return {
                    success: true,
                    requiresLogin: true,
                    message: 'Registration successful! Please login.'
                };
            } else {
                return {
                    success: false,
                    error: response.data?.message || 'Registration failed'
                };
            }
        } catch (error) {
            console.error('Registration error:', error);
            console.error('Error response:', error.response);
            return {
                success: false,
                error: error.response?.data?.message || 'Something went wrong. Ulitin mo boss / AuthContext.jsx | const register'
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);