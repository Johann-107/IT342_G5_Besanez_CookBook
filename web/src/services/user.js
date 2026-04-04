import api from './api';

// ─── UserController  /api/user ─────────────────────────────────────────────────

// GET /api/user/me
// Response: { userId, email, firstName, lastName, birthdate, profileImage, cookingLevel }
export const getMe = () =>
    api.get('/api/user/me');

// GET /api/user/:id
export const getUserById = (id) =>
    api.get(`/api/user/${id}`);

// GET /api/user?email=xxx
export const getUserByEmail = (email) =>
    api.get('/api/user/email', { params: { email } });

// GET /api/user  (admin)
export const getAllUsers = () =>
    api.get('/api/user');

// PUT /api/user/:id
// Body: { firstName, lastName, birthdate, email, password, profileImage?, cookingLevel? }
export const updateUser = (id, userData) =>
    api.put(`/api/user/${id}`, userData);

// PATCH /api/user/me/profile-image
// Body: { profileImage: "https://..." }  — send null or "" to clear
export const updateProfileImage = (profileImage) =>
    api.patch('/api/user/me/profile-image', { profileImage });

/**
 * POST /api/user/me/profile-image/upload
 * Uploads a File object as multipart/form-data.
 * The backend encodes it to a base64 data URL and persists it.
 *
 * @param {File} file  — native browser File from <input type="file">
 */
export const uploadProfileImageFile = (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/api/user/me/profile-image/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};

// DELETE /api/user/:id
export const deleteUser = (id) =>
    api.delete(`/api/user/${id}`);

const userAPI = {
    getMe,
    getUserById,
    getUserByEmail,
    getAllUsers,
    updateUser,
    updateProfileImage,
    uploadProfileImageFile,
    deleteUser,
};

export default userAPI;