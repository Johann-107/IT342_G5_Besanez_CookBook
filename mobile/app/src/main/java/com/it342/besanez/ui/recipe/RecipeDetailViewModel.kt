package com.it342.besanez.ui.recipe

import androidx.lifecycle.*
import com.it342.besanez.model.*
import com.it342.besanez.network.ApiClient
import kotlinx.coroutines.*

class RecipeDetailViewModel : ViewModel() {

    private val api = ApiClient.apiService

    private val _recipe = MutableLiveData<RecipeResponse?>()
    val recipe: LiveData<RecipeResponse?> = _recipe

    private val _ingredients = MutableLiveData<List<IngredientResponse>>()
    val ingredients: LiveData<List<IngredientResponse>> = _ingredients

    private val _instructions = MutableLiveData<List<InstructionResponse>>()
    val instructions: LiveData<List<InstructionResponse>> = _instructions

    private val _loading = MutableLiveData(false)
    val loading: LiveData<Boolean> = _loading

    private val _error = MutableLiveData<String?>()
    val error: LiveData<String?> = _error

    private val _deleted = MutableLiveData(false)
    val deleted: LiveData<Boolean> = _deleted

    fun load(id: Long) {
        _loading.value = true
        viewModelScope.launch {
            try {
                val (r, ing, inst) = awaitAll(
                    async { api.getRecipeById(id) },
                    async { api.getIngredients(id) },
                    async { api.getInstructions(id) }
                )
                if (r.isSuccessful) _recipe.value = r.body() as RecipeResponse
                if (ing.isSuccessful) _ingredients.value = ing.body() as List<IngredientResponse>
                if (inst.isSuccessful) _instructions.value = inst.body() as List<InstructionResponse>
            } catch (e: Exception) {
                _error.value = "Failed to load recipe"
            } finally {
                _loading.value = false
            }
        }
    }

    fun delete(id: Long) {
        viewModelScope.launch {
            try {
                val res = api.deleteRecipe(id)
                if (res.isSuccessful) _deleted.value = true
                else _error.value = "Delete failed"
            } catch (e: Exception) {
                _error.value = "Network error"
            }
        }
    }
}