package com.it342.besanez.ui.auth

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.EditText
import android.widget.ProgressBar
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.lifecycleScope
import com.it342.besanez.BesanezApp
import com.it342.besanez.R
import com.it342.besanez.repository.AuthRepository
import com.it342.besanez.ui.main.HomeActivity
import kotlinx.coroutines.launch

class LoginActivity : AppCompatActivity() {

    private lateinit var viewModel: AuthViewModel
    private lateinit var googleAuthHelper: GoogleAuthHelper

    private lateinit var etEmail: EditText
    private lateinit var etPassword: EditText
    private lateinit var btnLogin: Button
    private lateinit var btnGoogle: Button
    private lateinit var tvRegister: TextView
    private lateinit var tvForgotPassword: TextView
    private lateinit var progressBar: ProgressBar

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_login)

        val tokenManager = (application as BesanezApp).tokenManager
        val repository = AuthRepository(tokenManager)
        val factory = AuthViewModelFactory(repository)
        viewModel = ViewModelProvider(this, factory)[AuthViewModel::class.java]
        googleAuthHelper = GoogleAuthHelper(this)

        etEmail = findViewById(R.id.etEmail)
        etPassword = findViewById(R.id.etPassword)
        btnLogin = findViewById(R.id.btnLogin)
        btnGoogle = findViewById(R.id.btnGoogle)
        tvRegister = findViewById(R.id.tvRegister)
        tvForgotPassword = findViewById(R.id.tvForgotPassword)
        progressBar = findViewById(R.id.progressBar)

        btnLogin.setOnClickListener {
            val email = etEmail.text.toString().trim()
            val password = etPassword.text.toString().trim()
            if (email.isEmpty() || password.isEmpty()) {
                Toast.makeText(this, "Fill in all fields", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }
            viewModel.login(email, password)
        }

        btnGoogle.setOnClickListener {
            lifecycleScope.launch {
                googleAuthHelper.signIn(
                    onSuccess = { idToken ->
                        viewModel.loginWithGoogle(idToken)
                    },
                    onFailure = { error ->
                        Toast.makeText(this@LoginActivity, error, Toast.LENGTH_LONG).show()
                    }
                )
            }
        }

        tvRegister.setOnClickListener {
            startActivity(Intent(this, RegisterActivity::class.java))
        }

        tvForgotPassword.setOnClickListener {
            startActivity(Intent(this, ForgotPasswordActivity::class.java))
        }

        viewModel.loading.observe(this) { isLoading ->
            progressBar.visibility = if (isLoading) View.VISIBLE else View.GONE
            btnLogin.isEnabled = !isLoading
            btnGoogle.isEnabled = !isLoading
        }

        viewModel.loginResult.observe(this) { result ->
            result.onSuccess { response ->
                if (response.success) {
                    startActivity(Intent(this, HomeActivity::class.java))
                    finish()
                } else {
                    Toast.makeText(this, response.message, Toast.LENGTH_LONG).show()
                }
            }
            result.onFailure { error ->
                Toast.makeText(this, error.message ?: "Login failed", Toast.LENGTH_LONG).show()
            }
        }

        viewModel.googleLoginResult.observe(this) { result ->
            result.onSuccess { response ->
                if (response.success) {
                    startActivity(Intent(this, HomeActivity::class.java))
                    finish()
                } else {
                    Toast.makeText(this, response.message, Toast.LENGTH_LONG).show()
                }
            }
            result.onFailure { error ->
                Toast.makeText(this, error.message ?: "Google login failed", Toast.LENGTH_LONG).show()
            }
        }
    }
}