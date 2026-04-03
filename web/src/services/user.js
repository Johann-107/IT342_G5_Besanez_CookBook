import api from './api';

// ─── UserController  /api/user ─────────────────────────────────────────────────

// GET /api/user/me
// Response: { userId, email, firstName, lastName }
export const getMe = () =>
    api.get('/api/user/me');

// GET /api/user/:id
// Response: UserResponseDTO { userId, firstName, lastName, birthdate, email }
export const getUserById = (id) =>
    api.get(`/api/user/${id}`);

// GET /api/user?email=xxx
export const getUserByEmail = (email) =>
    api.get('/api/user/email', { params: { email } });

// GET /api/user  (admin — returns all users)
export const getAllUsers = () =>
    api.get('/api/user');

// PUT /api/user/:id
// Body: { firstName, lastName, birthdate, email, password }
// Note: password field is required by UserRequestDTO validation but NOT
//       updated by UserService — use changePassword for that.
// Response: UserResponseDTO
export const updateUser = (id, userData) =>
    api.put(`/api/user/${id}`, userData);

// DELETE /api/user/:id
export const deleteUser = (id) =>
    api.delete(`/api/user/${id}`);

const userAPI = {
    getMe,
    getUserById,
    getUserByEmail,
    getAllUsers,
    updateUser,
    deleteUser,
};

export default userAPI;