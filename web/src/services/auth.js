import api from './api';

// ─── Auth ─────────────────────────────────────────────────────────────────────
// POST /api/auth/register
// Body: { firstName, lastName, birthdate, email, password }
// Response: { success, message, user }
export const register = (userData) =>
  api.post('/api/auth/register', userData);

// POST /api/auth/login
// Body: { email, password }
// Response: { success, message, token, type, user }
export const login = (credentials) =>
  api.post('/api/auth/login', credentials);

// POST /api/auth/logout
export const logout = () =>
  api.post('/api/auth/logout');

// POST /api/auth/change-password
// Body: { oldPassword, newPassword }
// Header: Authorization Bearer <token>
export const changePassword = (passwordData) =>
  api.post('/api/auth/change-password', passwordData);

// POST /api/auth/forgot-password
// Body: { email, newPassword }
export const forgotPassword = (data) =>
  api.post('/api/auth/forgot-password', data);

// ─── Current User ─────────────────────────────────────────────────────────────
// GET /api/user/me
// Header: Authorization Bearer <token>
// Response: { userId, email, firstName, lastName }
export const getMe = () =>
  api.get('/api/user/me');

const authAPI = {
  register,
  login,
  logout,
  changePassword,
  forgotPassword,
  getMe,
  // Keep legacy alias used by AuthContext
  getProfile: getMe,
};

export default authAPI;