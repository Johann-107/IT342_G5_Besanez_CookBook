package com.it342.besanez.model

import com.google.gson.annotations.SerializedName

// ─── Auth ─────────────────────────────────────────────────────────────────────

data class LoginRequest(
    val email: String,
    val password: String
)

data class RegisterRequest(
    val firstName: String,
    val lastName: String,
    val email: String,
    val password: String,
    val birthdate: String? = null,
    val cookingLevel: String? = "BEGINNER"
)

data class ChangePasswordRequest(
    val oldPassword: String,
    val newPassword: String
)

data class ForgotPasswordRequest(
    val email: String,
    val newPassword: String
)

data class AuthResponse(
    val success: Boolean,
    val message: String,
    val token: String?,
    val type: String?,
    val user: UserResponse?
)

data class BaseResponse(
    val success: Boolean,
    val message: String
)

// ─── User ─────────────────────────────────────────────────────────────────────

data class UserResponse(
    val userId: Long,
    val firstName: String,
    val lastName: String,
    val email: String,
    val birthdate: String?,
    val profileImage: String?,
    val cookingLevel: String?,
    val role: String?,
    val createdAt: String?
)

data class UpdateUserRequest(
    val firstName: String,
    val lastName: String,
    val email: String,
    val birthdate: String? = null,
    val cookingLevel: String? = null
)

// ─── Recipe ───────────────────────────────────────────────────────────────────

data class RecipeResponse(
    val id: Long,
    val name: String,
    val description: String?,
    val prepTimeMinutes: Int?,
    val cookTimeMinutes: Int?,
    val totalTimeMinutes: Int?,
    val notes: String?,
    val imageUrl: String?,
    @SerializedName("isPublic") val isPublic: Boolean,
    val userId: Long,
    val createdAt: String?,
    val updatedAt: String?
)

data class RecipeRequest(
    val name: String,
    val description: String? = null,
    val prepTimeMinutes: Int? = null,
    val cookTimeMinutes: Int? = null,
    val totalTimeMinutes: Int? = null,
    val notes: String? = null,
    val imageUrl: String? = null,
    @SerializedName("isPublic") val isPublic: Boolean = false
)

// ─── Ingredient ───────────────────────────────────────────────────────────────

data class IngredientResponse(
    val id: Long,
    val name: String,
    val quantity: Int,
    val unit: String?,
    val notes: String?,
    val recipeId: Long
)

data class IngredientRequest(
    val name: String,
    val quantity: Int,
    val unit: String? = null,
    val notes: String? = null
)

// ─── Instruction ──────────────────────────────────────────────────────────────

data class InstructionResponse(
    val id: Long,
    val stepNumber: Int,
    val description: String,
    val recipeId: Long
)

data class InstructionRequest(
    val stepNumber: Int,
    val description: String
)

// ─── Collection ───────────────────────────────────────────────────────────────

data class CollectionResponse(
    val id: Long,
    val name: String,
    val description: String?,
    val userId: Long,
    val recipeCount: Int,
    val coverImage: String?,
    val recipeImages: List<String>?,
    val createdAt: String?,
    val updatedAt: String?
)

data class CollectionRequest(
    val name: String,
    val description: String? = null
)

// ─── Pagination ───────────────────────────────────────────────────────────────

data class PageResponse<T>(
    val content: List<T>,
    val totalElements: Long,
    val totalPages: Int,
    val number: Int,
    val size: Int,
    val last: Boolean
)