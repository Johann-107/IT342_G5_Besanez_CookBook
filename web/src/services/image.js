import api from './api';

/**
 * POST /api/image/upload
 * Uploads a File to Cloudinary via the backend and returns the CDN URL.
 * @param {File} file
 * @param {string} folder — 'recipes' | 'profiles' etc.
 */
export const uploadImage = (file, folder = 'recipes') => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/api/image/upload?folder=${folder}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};

const imageAPI = { uploadImage };
export default imageAPI;