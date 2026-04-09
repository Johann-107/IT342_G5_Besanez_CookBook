import { multipartClient } from '../patterns/APIClientFactory';

/**
 * @param {File}   file
 * @param {string} folder — e.g. "users/42/recipes" or "users/42/profiles"
 * @returns {Promise<{ data: { url: string } }>}
 */
export const uploadImage = (file, folder = 'recipes') => {
    const formData = new FormData();
    formData.append('file', file);
    return multipartClient.post(`/api/image/upload?folder=${encodeURIComponent(folder)}`, formData);
};

const imageAPI = { uploadImage };
export default imageAPI;