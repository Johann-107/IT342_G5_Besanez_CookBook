import api from './api';

// ─── Admin API  /api/admin ─────────────────────────────────────────────────────

// GET /api/admin/stats
export const getAdminStats = () => api.get('/api/admin/stats');

// ─── Users ────────────────────────────────────────────────────────────────────

// GET /api/admin/users?search=&page=&size=&sort=
export const getAdminUsers = (params = {}) => api.get('/api/admin/users', { params });

// PUT /api/admin/users/:id
export const updateAdminUser = (id, data) => api.put(`/api/admin/users/${id}`, data);

// DELETE /api/admin/users/:id
export const deleteAdminUser = (id) => api.delete(`/api/admin/users/${id}`);

// PATCH /api/admin/users/:id/toggle-role
export const toggleUserRole = (id) => api.patch(`/api/admin/users/${id}/toggle-role`);

// ─── Recipes ──────────────────────────────────────────────────────────────────

// GET /api/admin/recipes?search=&page=&size=&sort=
export const getAdminRecipes = (params = {}) => api.get('/api/admin/recipes', { params });

// DELETE /api/admin/recipes/:id
export const deleteAdminRecipe = (id) => api.delete(`/api/admin/recipes/${id}`);

// ─── Collections ──────────────────────────────────────────────────────────────

// GET /api/admin/collections?page=&size=&sort=
export const getAdminCollections = (params = {}) => api.get('/api/admin/collections', { params });

// DELETE /api/admin/collections/:id
export const deleteAdminCollection = (id) => api.delete(`/api/admin/collections/${id}`);

const adminAPI = {
    getAdminStats,
    getAdminUsers,
    updateAdminUser,
    deleteAdminUser,
    toggleUserRole,
    getAdminRecipes,
    deleteAdminRecipe,
    getAdminCollections,
    deleteAdminCollection,
};

export default adminAPI;