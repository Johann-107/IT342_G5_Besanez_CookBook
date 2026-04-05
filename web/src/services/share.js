import api from './api';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

// ─── ShareController  /api/share ──────────────────────────────────────────────

/**
 * POST /api/share/recipe/:recipeId
 * Generates (or returns existing) share token for a recipe.
 * Response: { shareToken, shareUrl }
 */
export const generateShareToken = (recipeId) =>
    api.post(`/api/share/recipe/${recipeId}`);

/**
 * DELETE /api/share/recipe/:recipeId
 * Revokes the share link for a recipe.
 */
export const revokeShareToken = (recipeId) =>
    api.delete(`/api/share/recipe/${recipeId}`);

/**
 * GET /api/share/:token
 * Public — no auth required. Returns the shared RecipeResponseDTO.
 */
export const getSharedRecipe = (token) =>
    axios.get(`${API_BASE_URL}/api/share/${token}`);

/**
 * POST /api/share/:token/save
 * Saves the shared recipe as a copy for the authenticated user.
 * @param {string} token       - the share token from the URL
 * @param {number[]} collectionIds - optional array of collection IDs to add to
 */
export const saveSharedRecipe = (token, collectionIds = []) =>
    api.post(`/api/share/${token}/save`, { collectionIds });

const shareAPI = {
    generateShareToken,
    revokeShareToken,
    getSharedRecipe,
    saveSharedRecipe,
};

export default shareAPI;