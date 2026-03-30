import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (userData) => api.post('/api/auth/register', userData),
  login: (credentials) => api.post('/api/auth/login', credentials),
  logout: () => api.post('/api/auth/logout'),
  getProfile: () => api.get('/api/user/me'),
  changePassword: (passwordData) => api.post('/api/auth/change-password', passwordData),
  forgotPassword: (data) => api.post('/api/auth/forgot-password', data),
};

export const userAPI = {
  getAllUsers: () => api.get('/api/user'),
  getUserById: (id) => api.get(`/api/user/${id}`),
  getUserByEmail: (email) => api.get('/api/user/email', { params: { email } }),
  updateUser: (id, userData) => api.put(`/api/user/${id}`, userData),
  deleteUser: (id) => api.delete(`/api/user/${id}`),
};