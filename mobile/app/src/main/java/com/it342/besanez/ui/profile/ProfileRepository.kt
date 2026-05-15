package com.it342.besanez.ui.profile

import com.it342.besanez.model.UpdateUserRequest
import com.it342.besanez.model.UserResponse
import com.it342.besanez.network.ApiClient

class ProfileRepository {

    private val api = ApiClient.apiService

    suspend fun getCurrentUser(): Result<UserResponse> {
        return try {
            val response = api.getCurrentUser()
            if (response.isSuccessful) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Failed to load profile"))
            }
        } catch (e: Exception) {
            Result.failure(Exception("Network error. Check your connection."))
        }
    }

    suspend fun updateUser(id: Long, request: UpdateUserRequest): Result<UserResponse> {
        return try {
            val response = api.updateUser(id, request)
            if (response.isSuccessful) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Failed to update profile"))
            }
        } catch (e: Exception) {
            Result.failure(Exception("Network error. Check your connection."))
        }
    }
}