import api from './api';
import { publicClient } from './APIClientFactory';

export const generateShareToken = (recipeId) =>
    api.post(`/api/share/recipe/${recipeId}`);

export const revokeShareToken = (recipeId) =>
    api.delete(`/api/share/recipe/${recipeId}`);

export const getSharedRecipe = (token) =>
    publicClient.get(`/api/share/${token}`);

export const saveSharedRecipe = (token, collectionIds = []) =>
    api.post(`/api/share/${token}/save`, { collectionIds });

const shareAPI = {
    generateShareToken,
    revokeShareToken,
    getSharedRecipe,
    saveSharedRecipe,
};

export default shareAPI;