package com.it342.besanez.ui.auth

import android.content.Context
import androidx.credentials.CredentialManager
import androidx.credentials.CustomCredential
import androidx.credentials.GetCredentialRequest
import androidx.credentials.exceptions.GetCredentialException
import com.google.android.libraries.identity.googleid.GetGoogleIdOption
import com.google.android.libraries.identity.googleid.GoogleIdTokenCredential

class GoogleAuthHelper(private val context: Context) {

    private val webClientId =
        "926457944849-icmu448b9f18dgafces9jv47r4t50vn4.apps.googleusercontent.com"

    private val credentialManager = CredentialManager.create(context)

    suspend fun signIn(
        onSuccess: (idToken: String) -> Unit,
        onFailure: (String) -> Unit
    ) {
        val googleIdOption = GetGoogleIdOption.Builder()
            .setFilterByAuthorizedAccounts(false)
            .setServerClientId(webClientId)
            .setAutoSelectEnabled(false)
            .build()

        val request = GetCredentialRequest.Builder()
            .addCredentialOption(googleIdOption)
            .build()

        try {
            val result = credentialManager.getCredential(
                context = context,
                request = request
            )
            val credential = result.credential
            if (credential is CustomCredential &&
                credential.type == GoogleIdTokenCredential.TYPE_GOOGLE_ID_TOKEN_CREDENTIAL
            ) {
                val googleIdTokenCredential =
                    GoogleIdTokenCredential.createFrom(credential.data)
                onSuccess(googleIdTokenCredential.idToken)
            } else {
                onFailure("Unexpected credential type: ${credential.type}")
            }
        } catch (e: GetCredentialException) {
            onFailure("Google sign-in failed: ${e.message}")
        }
    }
}