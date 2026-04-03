import api from './api';

// ─── IngredientController  /api/recipe/:recipeId/ingredient ──────────────────

// POST /api/recipe/:recipeId/ingredient
// Body: { name, quantity, unit, notes }
//   unit is optional — one of: G, KG, OZ, LB, ML, L, TSP, TBSP, CUP,
//                              FL_OZ, PIECE, PINCH, CLOVE, SLICE, OTHER
// Response: IngredientResponseDTO { id, name, quantity, unit, notes, recipeId }
export const addIngredient = (recipeId, ingredientData) =>
    api.post(`/api/recipe/${recipeId}/ingredient`, ingredientData);

// GET /api/recipe/:recipeId/ingredient
// Response: IngredientResponseDTO[]
export const getIngredients = (recipeId) =>
    api.get(`/api/recipe/${recipeId}/ingredient`);

// GET /api/recipe/:recipeId/ingredient/:id
// Response: IngredientResponseDTO
export const getIngredientById = (recipeId, id) =>
    api.get(`/api/recipe/${recipeId}/ingredient/${id}`);

// PUT /api/recipe/:recipeId/ingredient/:id
// Body: { name, quantity, unit, notes }
// Response: IngredientResponseDTO
export const updateIngredient = (recipeId, id, ingredientData) =>
    api.put(`/api/recipe/${recipeId}/ingredient/${id}`, ingredientData);

// DELETE /api/recipe/:recipeId/ingredient/:id
// Response: 204 No Content
export const deleteIngredient = (recipeId, id) =>
    api.delete(`/api/recipe/${recipeId}/ingredient/${id}`);

const ingredientAPI = {
    addIngredient,
    getIngredients,
    getIngredientById,
    updateIngredient,
    deleteIngredient,
};

export default ingredientAPI;