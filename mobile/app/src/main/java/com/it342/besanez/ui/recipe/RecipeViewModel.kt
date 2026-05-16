package com.it342.besanez.ui.recipe

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.it342.besanez.model.RecipeResponse
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

class RecipeViewModel : ViewModel() {

    private val repository = RecipeRepository()

    private val _recipes = MutableLiveData<List<RecipeResponse>>()
    val recipes: LiveData<List<RecipeResponse>> = _recipes

    private val _loading = MutableLiveData<Boolean>()
    val loading: LiveData<Boolean> = _loading

    private val _error = MutableLiveData<String?>()
    val error: LiveData<String?> = _error

    private val _deleteResult = MutableLiveData<Result<Unit>>()
    val deleteResult: LiveData<Result<Unit>> = _deleteResult

    // Pagination
    private var currentPage = 0
    private var totalPages = 1
    var isLastPage = false
        private set

    // Search debounce
    private var searchJob: Job? = null
    private var currentSearch: String? = null

    fun loadRecipes(search: String? = null, reset: Boolean = true) {
        if (reset) {
            currentPage = 0
            isLastPage = false
        }

        if (isLastPage && !reset) return

        _loading.value = true
        currentSearch = search

        viewModelScope.launch {
            val result = repository.getRecipes(
                search = search,
                page = currentPage,
                size = 10
            )
            result.onSuccess { page ->
                val existing = if (reset) emptyList() else _recipes.value ?: emptyList()
                _recipes.value = existing + page.content
                totalPages = page.totalPages
                isLastPage = page.last
                currentPage++
                _error.value = null
            }
            result.onFailure { e ->
                _error.value = e.message
            }
            _loading.value = false
        }
    }

    fun searchDebounced(query: String) {
        searchJob?.cancel()
        searchJob = viewModelScope.launch {
            delay(400)
            loadRecipes(search = query.ifBlank { null }, reset = true)
        }
    }

    fun loadNextPage() {
        if (!isLastPage && _loading.value != true) {
            loadRecipes(search = currentSearch, reset = false)
        }
    }

    fun deleteRecipe(id: Long) {
        viewModelScope.launch {
            val result = repository.deleteRecipe(id)
            _deleteResult.value = result
            if (result.isSuccess) {
                _recipes.value = _recipes.value?.filter { it.id != id }
            }
        }
    }
}