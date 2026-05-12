package com.it342.besanez

import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.it342.besanez.data.TokenManager
import com.it342.besanez.ui.auth.LoginActivity
import com.it342.besanez.ui.main.HomeActivity
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val tokenManager = (application as BesanezApp).tokenManager

        lifecycleScope.launch {
            val token = tokenManager.token.first()

            if (token != null) {
                startActivity(Intent(this@MainActivity, HomeActivity::class.java))
            } else {
                startActivity(Intent(this@MainActivity, LoginActivity::class.java))
            }

            finish()
        }
    }
}