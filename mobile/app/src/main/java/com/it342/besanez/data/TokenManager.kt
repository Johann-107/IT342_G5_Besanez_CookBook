package com.it342.besanez.data

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.longPreferencesKey
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "auth_prefs")

class TokenManager(private val context: Context) {

    companion object {
        private val KEY_TOKEN = stringPreferencesKey("jwt_token")
        private val KEY_USER_ID = longPreferencesKey("user_id")
        private val KEY_EMAIL = stringPreferencesKey("email")
        private val KEY_FIRST_NAME = stringPreferencesKey("first_name")
        private val KEY_LAST_NAME = stringPreferencesKey("last_name")
        private val KEY_ROLE = stringPreferencesKey("role")
    }

    suspend fun saveToken(
        token: String,
        userId: Long,
        email: String,
        firstName: String,
        lastName: String,
        role: String
    ) {
        context.dataStore.edit { prefs ->
            prefs[KEY_TOKEN] = token
            prefs[KEY_USER_ID] = userId
            prefs[KEY_EMAIL] = email
            prefs[KEY_FIRST_NAME] = firstName
            prefs[KEY_LAST_NAME] = lastName
            prefs[KEY_ROLE] = role
        }
    }

    suspend fun clearToken() {
        context.dataStore.edit { it.clear() }
    }

    val token: Flow<String?> = context.dataStore.data.map { it[KEY_TOKEN] }
    val userId: Flow<Long?> = context.dataStore.data.map { it[KEY_USER_ID] }
    val email: Flow<String?> = context.dataStore.data.map { it[KEY_EMAIL] }
    val firstName: Flow<String?> = context.dataStore.data.map { it[KEY_FIRST_NAME] }
    val lastName: Flow<String?> = context.dataStore.data.map { it[KEY_LAST_NAME] }
    val role: Flow<String?> = context.dataStore.data.map { it[KEY_ROLE] }
}