import recipeAPI from '../services/recipe';
import ingredientAPI from '../services/ingredient';
import instructionAPI from '../services/instruction';
import collectionAPI from '../services/collection';
import RecipeBuilder from './RecipeBuilder';

class CookbookFacade {
    // ─── Read operations ────────────────────────────────────────────────────────

    /**
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
     *
     * @param {string|number} recipeId
     * @returns {Promise<{ builder: RecipeBuilder, raw: { recipe, ingredients, instructions } }>}
     */
    static async getRecipeForEdit(recipeId) {
        const raw = await CookbookFacade.getRecipeDetail(recipeId);
        const builder = RecipeBuilder.fromAPIResponse(
            raw.recipe,
            raw.ingredients,
            raw.instructions
        );
        return { builder, raw };
    }

    /**
     *
     * @returns {Promise<{ recentRecipes, totalRecipes, collections }>}
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

    /**
     *
     * @param {object} recipePayload 
     * @param {Array}  ingredients 
     * @param {Array}  steps 
     * @param {number[]} collectionIds 
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
     *
     * @param {string|number} recipeId
     * @param {object} recipePayload 
     * @param {Array}  ingredients 
     * @param {Array}  steps  
     * @returns {Promise<void>}
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

    static async deleteRecipe(recipeId) {
        await recipeAPI.deleteRecipe(recipeId);
    }
}

export default CookbookFacade;