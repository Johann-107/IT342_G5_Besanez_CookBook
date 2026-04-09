import recipeAPI from '../services/recipe';
import ingredientAPI from '../services/ingredient';
import instructionAPI from '../services/instruction';
import collectionAPI from '../services/collection';
import { publicClient } from './APIClientFactory';

class CookbookFacade {

    // ─── Read operations ────────────────────────────────────────────────────────

    /**
     * Fetches a recipe together with its ingredients and instructions in parallel.
     * Used by RecipeDetail (authenticated owner view) and CreateRecipe (edit mode).
     *
     * @param {string|number} recipeId
     * @returns {Promise<{ recipe, ingredients, instructions }>}
     */
    static async getRecipeDetail(recipeId) {
        const [recipeRes, ingRes, instRes] = await Promise.all([
            recipeAPI.getRecipeById(recipeId),
            ingredientAPI.getIngredients(recipeId),
            instructionAPI.getInstructions(recipeId),
        ]);
        return {
            recipe: recipeRes.data,
            ingredients: ingRes.data,
            instructions: instRes.data,
        };
    }

    /**
     * Fetches a shared recipe (by share token) together with its ingredients and
     * instructions using the PUBLIC client — no auth token required.
     *
     * Used by SharedRecipePage so both guests and logged-in users can load the
     * full recipe data. Guests see blurred ingredients/instructions in the UI;
     * the data is fetched regardless so the blur overlay works correctly.
     *
     * @param {string} token — share token from the URL param
     * @returns {Promise<{ recipe, ingredients, instructions }>}
     */
    static async getSharedRecipeDetail(token) {
        const recipeRes = await publicClient.get(`/api/share/${token}`);
        const recipe = recipeRes.data;
        const [ingRes, instRes] = await Promise.all([
            publicClient.get(`/api/recipe/${recipe.id}/ingredient`).catch(() => ({ data: [] })),
            publicClient.get(`/api/recipe/${recipe.id}/instruction`).catch(() => ({ data: [] })),
        ]);

        return {
            recipe,
            ingredients: ingRes.data || [],
            instructions: instRes.data || [],
        };
    }

    /**
     * Loads the dashboard data in parallel: recent recipes, total count,
     * and all collections.
     *
     * @returns {Promise<{ recentRecipes, totalRecipes, collections, totalCollections }>}
     */
    static async getDashboardData() {
        const [recentRes, allRes, collectionsRes] = await Promise.all([
            recipeAPI.getRecipes({ size: 3, sort: 'createdAt,desc', page: 0 }),
            recipeAPI.getRecipes({ size: 1, page: 0 }),
            collectionAPI.getCollections({ size: 50, sort: 'createdAt,desc', page: 0 }),
        ]);
        return {
            recentRecipes: recentRes.data.content || [],
            totalRecipes: allRes.data.totalElements || 0,
            collections: collectionsRes.data.content || [],
            totalCollections: collectionsRes.data.totalElements || 0,
        };
    }

    // ─── Write operations ───────────────────────────────────────────────────────

    /**
     * Creates a recipe with its ingredients, instructions, and optional
     * collection memberships in the correct order.
     *
     * @param {object}   recipePayload  — RecipeRequestDTO
     * @param {Array}    ingredients    — validated IngredientRequestDTO[]
     * @param {Array}    steps          — validated InstructionRequestDTO[]
     * @param {number[]} collectionIds  — optional collection IDs to join
     * @returns {Promise<{ recipeId, recipe }>}
     */
    static async createRecipeWithDetails(recipePayload, ingredients, steps, collectionIds = []) {
        const recipeRes = await recipeAPI.createRecipe(recipePayload);
        const recipeId = recipeRes.data.id;

        await Promise.all([
            ...ingredients.map((ing) =>
                ingredientAPI.addIngredient(recipeId, ing)
            ),
            ...steps.map((step, idx) =>
                instructionAPI.addInstruction(recipeId, {
                    stepNumber: idx + 1,
                    description: step.description.trim(),
                })
            ),
        ]);

        if (collectionIds.length > 0) {
            await Promise.all(
                collectionIds.map((colId) =>
                    collectionAPI.addRecipeToCollection(colId, recipeId)
                )
            );
        }

        return { recipeId, recipe: recipeRes.data };
    }

    /**
     * Updates a recipe's basic info and its existing ingredients/instructions.
     *
     * @param {string|number} recipeId
     * @param {object} recipePayload  — RecipeRequestDTO
     * @param {Array}  ingredients    — existing IngredientResponseDTO[] (with ids)
     * @param {Array}  steps          — existing InstructionResponseDTO[] (with ids)
     */
    static async updateRecipeWithDetails(recipeId, recipePayload, ingredients, steps) {
        await recipeAPI.updateRecipe(recipeId, recipePayload);

        await Promise.all([
            ...ingredients
                .filter((i) => i.id)
                .map((ing) =>
                    ingredientAPI.updateIngredient(recipeId, ing.id, {
                        name: ing.name.trim(),
                        quantity: ing.quantity ? Number(ing.quantity) : 0,
                        unit: ing.unit || null,
                        notes: ing.notes || null,
                    })
                ),
            ...steps
                .filter((s) => s.id)
                .map((step, idx) =>
                    instructionAPI.updateInstruction(recipeId, step.id, {
                        stepNumber: step.stepNumber || idx + 1,
                        description: step.description.trim(),
                    })
                ),
        ]);
    }

    /** Deletes a recipe by id. */
    static async deleteRecipe(recipeId) {
        await recipeAPI.deleteRecipe(recipeId);
    }
}

export default CookbookFacade;