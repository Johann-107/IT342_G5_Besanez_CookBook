import api from './api';

// ─── CollectionController  /api/collection ────────────────────────────────────

// POST /api/collection
// Body: { name, description }
//   name: required, max 100 chars
//   description: optional, max 255 chars
// Response: CollectionResponseDTO
//   { id, name, description, userId, recipeCount, createdAt, updatedAt }
export const createCollection = (collectionData) =>
    api.post('/api/collection', collectionData);

// GET /api/collection
// Paginated. Optional query params:
//   ?search=<name>     → filter by name (case-insensitive)
//   ?page=0&size=10&sort=createdAt,desc
// Response: Page<CollectionResponseDTO>
export const getCollections = (params = {}) =>
    api.get('/api/collection', { params });

// GET /api/collection/:id
// Response: CollectionResponseDTO
export const getCollectionById = (id) =>
    api.get(`/api/collection/${id}`);

// PUT /api/collection/:id
// Body: { name, description }
// Response: CollectionResponseDTO
export const updateCollection = (id, collectionData) =>
    api.put(`/api/collection/${id}`, collectionData);

// DELETE /api/collection/:id
// Response: 204 No Content
export const deleteCollection = (id) =>
    api.delete(`/api/collection/${id}`);

// ─── Recipe membership ────────────────────────────────────────────────────────

// POST /api/collection/:id/recipe/:recipeId
// Adds a recipe to a collection
// Response: CollectionResponseDTO (with updated recipeCount)
export const addRecipeToCollection = (collectionId, recipeId) =>
    api.post(`/api/collection/${collectionId}/recipe/${recipeId}`);

// DELETE /api/collection/:id/recipe/:recipeId
// Removes a recipe from a collection
// Response: CollectionResponseDTO (with updated recipeCount)
export const removeRecipeFromCollection = (collectionId, recipeId) =>
    api.delete(`/api/collection/${collectionId}/recipe/${recipeId}`);

// ─── Convenience helpers ──────────────────────────────────────────────────────

// Search collections by name
export const searchCollections = (name, params = {}) =>
    getCollections({ search: name, ...params });

const collectionAPI = {
    createCollection,
    getCollections,
    getCollectionById,
    updateCollection,
    deleteCollection,
    addRecipeToCollection,
    removeRecipeFromCollection,
    searchCollections,
};

export default collectionAPI;