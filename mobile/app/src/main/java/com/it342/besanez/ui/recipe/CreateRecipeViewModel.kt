package com.it342.besanez.ui.recipe

import androidx.lifecycle.*
import com.it342.besanez.model.*
import com.it342.besanez.network.ApiClient
import kotlinx.coroutines.*

data class IngredientRow(
    var id: Long? = null,
    var name: String = "",
    var quantity: Int = 0,
    var unit: String = "",
    var notes: String = ""
)

data class InstructionRow(
    var id: Long? = null,
    var stepNumber: Int = 0,
    var description: String = ""
)

class CreateRecipeViewModel : ViewModel() {

    private val api = ApiClient.apiService

    private val _saved = MutableLiveData<RecipeResponse?>()
    val saved: LiveData<RecipeResponse?> = _saved

    private val _loading = MutableLiveData(false)
    val loading: LiveData<Boolean> = _loading

    private val _error = MutableLiveData<String?>()
    val error: LiveData<String?> = _error

    /** Create new recipe with ingredients + instructions */
    fun create(
        name: String, description: String?,
        prepTime: Int?, cookTime: Int?, totalTime: Int?,
        notes: String?, imageUrl: String?, isPublic: Boolean,
        ingredients: List<IngredientRow>,
        instructions: List<InstructionRow>
    ) {
        _loading.value = true
        viewModelScope.launch {
            try {
                val recipeRes = api.createRecipe(
                    RecipeRequest(name, description, prepTime, cookTime, totalTime, notes, imageUrl, isPublic)
                )
                if (!recipeRes.isSuccessful) { _error.value = "Failed to save recipe"; return@launch }
                val recipe = recipeRes.body()!!

                ingredients.filter { it.name.isNotBlank() }.forEach { ing ->
                    api.addIngredient(recipe.id, IngredientRequest(
                        ing.name.trim(),
                        if (ing.quantity > 0) ing.quantity else 0,
                        ing.unit.ifBlank { null },
                        ing.notes.ifBlank { null }
                    ))
                }
                instructions.filter { it.description.isNotBlank() }.forEachIndexed { idx, step ->
                    api.addInstruction(recipe.id, InstructionRequest(idx + 1, step.description.trim()))
                }
                _saved.value = recipe
            } catch (e: Exception) {
                _error.value = "Network error"
            } finally {
                _loading.value = false
            }
        }
    }

    /** Update existing recipe */
    fun update(
        id: Long,
        name: String, description: String?,
        prepTime: Int?, cookTime: Int?, totalTime: Int?,
        notes: String?, imageUrl: String?, isPublic: Boolean,
        existingIngredients: List<IngredientRow>,
        existingInstructions: List<InstructionRow>
    ) {
        _loading.value = true
        viewModelScope.launch {
            try {
                val recipeRes = api.updateRecipe(id, RecipeRequest(
                    name, description, prepTime, cookTime, totalTime, notes, imageUrl, isPublic
                ))
                if (!recipeRes.isSuccessful) { _error.value = "Failed to update recipe"; return@launch }

                // Sync ingredients
                existingIngredients.filter { it.name.isNotBlank() }.forEach { ing ->
                    val req = IngredientRequest(ing.name.trim(), ing.quantity, ing.unit.ifBlank { null }, ing.notes.ifBlank { null })
                    if (ing.id != null) api.updateIngredient(id, ing.id!!, req)
                    else api.addIngredient(id, req)
                }

                // Sync instructions
                existingInstructions.filter { it.description.isNotBlank() }.forEachIndexed { idx, step ->
                    val req = InstructionRequest(idx + 1, step.description.trim())
                    if (step.id != null) api.updateInstruction(id, step.id!!, req)
                    else api.addInstruction(id, req)
                }

                _saved.value = recipeRes.body()
            } catch (e: Exception) {
                _error.value = "Network error"
            } finally {
                _loading.value = false
            }
        }
    }
}