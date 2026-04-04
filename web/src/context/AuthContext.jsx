import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import authAPI from '../services/auth';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // On mount — rehydrate user from token if one exists
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');

            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const response = await authAPI.getMe();
                setUser(response.data);
            } catch (error) {
                console.error('Auth check failed:', error);
                localStorage.removeItem('token');
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    // ─── Login ────────────────────────────────────────────────────────────────
    const login = async (email, password) => {
        try {
            const response = await authAPI.login({ email, password });
            const { token, user: userData } = response.data;

            if (token) {
                localStorage.setItem('token', token);
                setUser(userData);
                return { success: true };
            }

            return { success: false, error: 'Login failed — no token received.' };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Something went wrong. Please try again.',
            };
        }
    };

    // ─── Register ─────────────────────────────────────────────────────────────
    const register = async (userData) => {
        try {
            const response = await authAPI.register(userData);

            if (response.data?.success || response.status === 201) {
                return {
                    success: true,
                    requiresLogin: true,
                    message: response.data?.message || 'Registration successful! Please log in.',
                };
            }

            return {
                success: false,
                error: response.data?.message || 'Registration failed.',
            };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Something went wrong. Please try again.',
            };
        }
    };

    // ─── Logout ───────────────────────────────────────────────────────────────
    const logout = async () => {
        try {
            await authAPI.logout();
        } catch (_) {
            // Silently ignore — always clear local state
        } finally {
            localStorage.removeItem('token');
            setUser(null);
        }
    };

    // ─── Refresh user ─────────────────────────────────────────────────────────
    /**
     * Re-fetches the current user from /api/user/me and updates context state.
     * Call this after any profile update so that the header avatar, initials,
     * and other consumer components reflect the latest data immediately.
     */
    const refreshUser = useCallback(async () => {
        try {
            const response = await authAPI.getMe();
            setUser(response.data);
            return { success: true };
        } catch (error) {
            console.error('refreshUser failed:', error);
            return { success: false };
        }
    }, []);

    // ─── Change password ──────────────────────────────────────────────────────
    const changePassword = async (oldPassword, newPassword) => {
        try {
            await authAPI.changePassword({ oldPassword, newPassword });
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to change password.',
            };
        }
    };

    // ─── Forgot password ──────────────────────────────────────────────────────
    const resetPassword = async (email, newPassword) => {
        try {
            await authAPI.forgotPassword({ email, newPassword });
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || 'Failed to reset password.',
            };
        }
    };

    // ─── OAuth2 Google login (called by OAuth2Callback) ───────────────────────
    const loginWithGoogle = useCallback((token, userData) => {
        localStorage.setItem('token', token);
        setUser(userData);
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                register,
                logout,
                changePassword,
                resetPassword,
                refreshUser,
                loginWithGoogle,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);