package com.it342.besanez.ui.auth

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.it342.besanez.model.AuthResponse
import com.it342.besanez.repository.AuthRepository
import kotlinx.coroutines.launch

class AuthViewModel(private val repository: AuthRepository) : ViewModel() {

    private val _loginResult = MutableLiveData<Result<AuthResponse>>()
    val loginResult: LiveData<Result<AuthResponse>> = _loginResult

    private val _registerResult = MutableLiveData<Result<AuthResponse>>()
    val registerResult: LiveData<Result<AuthResponse>> = _registerResult

    private val _forgotPasswordResult = MutableLiveData<Result<com.it342.besanez.model.BaseResponse>>()
    val forgotPasswordResult: LiveData<Result<com.it342.besanez.model.BaseResponse>> = _forgotPasswordResult

    private val _loading = MutableLiveData<Boolean>()
    val loading: LiveData<Boolean> = _loading

    fun login(email: String, password: String) {
        _loading.value = true
        viewModelScope.launch {
            _loginResult.value = repository.login(email, password)
            _loading.value = false
        }
    }

    fun register(firstName: String, lastName: String, email: String, password: String) {
        _loading.value = true
        viewModelScope.launch {
            _registerResult.value = repository.register(firstName, lastName, email, password)
            _loading.value = false
        }
    }

    fun forgotPassword(email: String, newPassword: String) {
        _loading.value = true
        viewModelScope.launch {
            _forgotPasswordResult.value = repository.forgotPassword(email, newPassword)
            _loading.value = false
        }
    }
}