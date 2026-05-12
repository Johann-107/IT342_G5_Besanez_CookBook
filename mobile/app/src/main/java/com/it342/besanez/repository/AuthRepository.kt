package com.it342.besanez.repository

import com.it342.besanez.data.TokenManager
import com.it342.besanez.model.AuthResponse
import com.it342.besanez.model.BaseResponse
import com.it342.besanez.model.ForgotPasswordRequest
import com.it342.besanez.model.LoginRequest
import com.it342.besanez.model.RegisterRequest
import com.it342.besanez.network.ApiClient

class AuthRepository(private val tokenManager: TokenManager) {

    private val api = ApiClient.apiService

    suspend fun login(email: String, password: String): Result<AuthResponse> {
        return try {
            val response = api.login(LoginRequest(email, password))
            if (response.isSuccessful) {
                val body = response.body()!!
                if (body.success && body.token != null && body.user != null) {
                    tokenManager.saveToken(
                        token = body.token,
                        userId = body.user.userId,
                        email = body.user.email,
                        firstName = body.user.firstName,
                        lastName = body.user.lastName,
                        role = body.user.role ?: "USER"
                    )
                }
                Result.success(body)
            } else {
                Result.failure(Exception("Login failed: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun register(
        firstName: String,
        lastName: String,
        email: String,
        password: String
    ): Result<AuthResponse> {
        return try {
            val response = api.register(
                RegisterRequest(
                    firstName = firstName,
                    lastName = lastName,
                    email = email,
                    password = password
                )
            )
            if (response.isSuccessful) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Registration failed: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun forgotPassword(email: String, newPassword: String): Result<BaseResponse> {
        return try {
            val response = api.forgotPassword(ForgotPasswordRequest(email, newPassword))
            if (response.isSuccessful) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Reset failed. Check your email address."))
            }
        } catch (e: Exception) {
            Result.failure(Exception("Network error. Check your connection."))
        }
    }

    suspend fun logout() {
        tokenManager.clearToken()
    }
}