package com.it342.besanez.ui.profile

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.it342.besanez.model.UpdateUserRequest
import com.it342.besanez.model.UserResponse
import kotlinx.coroutines.launch

class ProfileViewModel : ViewModel() {

    private val repository = ProfileRepository()

    private val _user = MutableLiveData<UserResponse>()
    val user: LiveData<UserResponse> = _user

    private val _updateResult = MutableLiveData<Result<UserResponse>>()
    val updateResult: LiveData<Result<UserResponse>> = _updateResult

    private val _loading = MutableLiveData<Boolean>()
    val loading: LiveData<Boolean> = _loading

    private val _error = MutableLiveData<String?>()
    val error: LiveData<String?> = _error

    fun loadProfile() {
        _loading.value = true
        viewModelScope.launch {
            val result = repository.getCurrentUser()
            result.onSuccess { user ->
                _user.value = user
                _error.value = null
            }
            result.onFailure { e ->
                _error.value = e.message
            }
            _loading.value = false
        }
    }

    fun updateProfile(id: Long, firstName: String, lastName: String, email: String, cookingLevel: String) {
        _loading.value = true
        viewModelScope.launch {
            val result = repository.updateUser(
                id,
                UpdateUserRequest(
                    firstName = firstName,
                    lastName = lastName,
                    email = email,
                    cookingLevel = cookingLevel
                )
            )
            _updateResult.value = result
            result.onSuccess { updated ->
                _user.value = updated
            }
            _loading.value = false
        }
    }
}