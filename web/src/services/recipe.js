import api from './api';

// ─── RecipeController  /api/recipe ────────────────────────────────────────────

// POST /api/recipe
// Body: { name, description, prepTimeMinutes, cookTimeMinutes,
//         totalTimeMinutes, notes, imageUrl, isPublic }
// Response: RecipeResponseDTO
export const createRecipe = (recipeData) =>
    api.post('/api/recipe', recipeData);

// GET /api/recipe
// Paginated. Optional query params:
//   ?search=<name>        → searches by name
//   ?collection=<id>      → scoped to a collection
//   ?page=0&size=10&sort=createdAt,desc
// Response: Page<RecipeResponseDTO>
export const getRecipes = (params = {}) =>
    api.get('/api/recipe', { params });

// GET /api/recipe/public
// No auth required.
// Optional: ?search=<name>&page=0&size=10
// Response: Page<RecipeResponseDTO>
export const getPublicRecipes = (params = {}) =>
    api.get('/api/recipe/public', { params });

// GET /api/recipe/:id
// Response: RecipeResponseDTO
export const getRecipeById = (id) =>
    api.get(`/api/recipe/${id}`);

// PUT /api/recipe/:id
// Body: same shape as createRecipe
// Response: RecipeResponseDTO
export const updateRecipe = (id, recipeData) =>
    api.put(`/api/recipe/${id}`, recipeData);

// DELETE /api/recipe/:id
// Response: 204 No Content
export const deleteRecipe = (id) =>
    api.delete(`/api/recipe/${id}`);

// ─── Convenience helpers ──────────────────────────────────────────────────────

// Search user's own recipes by name
export const searchRecipes = (name, params = {}) =>
    getRecipes({ search: name, ...params });

// Get recipes scoped to a collection
export const getRecipesByCollection = (collectionId, params = {}) =>
    getRecipes({ collection: collectionId, ...params });

const recipeAPI = {
    createRecipe,
    getRecipes,
    getPublicRecipes,
    getRecipeById,
    updateRecipe,
    deleteRecipe,
    searchRecipes,
    getRecipesByCollection,
};

export default recipeAPI;