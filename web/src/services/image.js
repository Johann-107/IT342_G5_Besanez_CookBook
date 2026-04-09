import { multipartClient } from '../patterns/APIClientFactory';

/**
 * POST /api/image/upload
 * Uploads a File to Cloudinary via the backend and returns the CDN URL.
 * @param {File} file
 * @param {string} folder — 'recipes' | 'profiles' etc.
 */
export const uploadImage = (file, folder = 'recipes') => {
    const formData = new FormData();
    formData.append('file', file);
    return multipartClient.post(`/api/image/upload?folder=${folder}`, formData);
};

const imageAPI = { uploadImage };
export default imageAPI;