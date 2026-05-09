package com.it342.besanez

import android.app.Application
import com.it342.besanez.data.TokenManager
import com.it342.besanez.network.ApiClient

class BesanezApp : Application() {
    lateinit var tokenManager: TokenManager

    override fun onCreate() {
        super.onCreate()
        tokenManager = TokenManager(this)
        ApiClient.init(tokenManager)
    }
}