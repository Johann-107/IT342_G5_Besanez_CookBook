package com.it342.besanez.ui.auth

import android.app.Activity
import android.content.Intent
import com.google.android.gms.auth.api.signin.GoogleSignIn
import com.google.android.gms.auth.api.signin.GoogleSignInAccount
import com.google.android.gms.auth.api.signin.GoogleSignInClient
import com.google.android.gms.auth.api.signin.GoogleSignInOptions
import com.google.android.gms.common.api.ApiException
import com.google.android.gms.tasks.Task

const val RC_GOOGLE_SIGN_IN = 1001

class GoogleAuthHelper(private val activity: Activity) {
    private val webClientId = "926457944849-icmu448b9f18dgafces9jv47r4t50vn4.apps.googleusercontent.com"

    private val gso = GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
        .requestIdToken(webClientId)
        .requestEmail()
        .requestProfile()
        .build()

    private val client: GoogleSignInClient = GoogleSignIn.getClient(activity, gso)

    fun signIn() {
        val signInIntent = client.signInIntent
        activity.startActivityForResult(signInIntent, RC_GOOGLE_SIGN_IN)
    }

    fun signOut(onComplete: () -> Unit) {
        client.signOut().addOnCompleteListener { onComplete() }
    }

    fun handleResult(
        requestCode: Int,
        data: Intent?,
        onSuccess: (GoogleSignInAccount) -> Unit,
        onFailure: (String) -> Unit
    ) {
        if (requestCode != RC_GOOGLE_SIGN_IN) return
        val task: Task<GoogleSignInAccount> = GoogleSignIn.getSignedInAccountFromIntent(data)
        try {
            val account = task.getResult(ApiException::class.java)
            onSuccess(account)
        } catch (e: ApiException) {
            onFailure("Google sign-in failed: ${e.statusCode}")
        }
    }
}