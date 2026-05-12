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
import com.it342.besanez.BesanezApp
import com.it342.besanez.R
import com.it342.besanez.repository.AuthRepository

class RegisterActivity : AppCompatActivity() {

    private lateinit var viewModel: AuthViewModel

    private lateinit var etFirstName: EditText
    private lateinit var etLastName: EditText
    private lateinit var etEmail: EditText
    private lateinit var etPassword: EditText
    private lateinit var etConfirmPassword: EditText
    private lateinit var btnRegister: Button
    private lateinit var tvLogin: TextView
    private lateinit var progressBar: ProgressBar

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_register)

        // Init ViewModel
        val tokenManager = (application as BesanezApp).tokenManager
        val repository = AuthRepository(tokenManager)
        val factory = AuthViewModelFactory(repository)
        viewModel = ViewModelProvider(this, factory)[AuthViewModel::class.java]

        // Bind views
        etFirstName = findViewById(R.id.etFirstName)
        etLastName = findViewById(R.id.etLastName)
        etEmail = findViewById(R.id.etEmail)
        etPassword = findViewById(R.id.etPassword)
        etConfirmPassword = findViewById(R.id.etConfirmPassword)
        btnRegister = findViewById(R.id.btnRegister)
        tvLogin = findViewById(R.id.tvLogin)
        progressBar = findViewById(R.id.progressBar)

        // Register button
        btnRegister.setOnClickListener {
            val firstName = etFirstName.text.toString().trim()
            val lastName = etLastName.text.toString().trim()
            val email = etEmail.text.toString().trim()
            val password = etPassword.text.toString().trim()
            val confirmPassword = etConfirmPassword.text.toString().trim()

            if (firstName.isEmpty() || lastName.isEmpty() || email.isEmpty() || password.isEmpty()) {
                Toast.makeText(this, "Fill in all fields", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            if (password != confirmPassword) {
                Toast.makeText(this, "Passwords do not match", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            if (password.length < 8) {
                Toast.makeText(this, "Password must be at least 8 characters", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            viewModel.register(firstName, lastName, email, password)
        }

        // Back to Login
        tvLogin.setOnClickListener { finish() }

        // Observe loading
        viewModel.loading.observe(this) { isLoading ->
            progressBar.visibility = if (isLoading) View.VISIBLE else View.GONE
            btnRegister.isEnabled = !isLoading
        }

        // Observe register result
        viewModel.registerResult.observe(this) { result ->
            result.onSuccess { response ->
                if (response.success) {
                    Toast.makeText(this, "Account created! Please sign in.", Toast.LENGTH_SHORT).show()
                    finish() // back to LoginActivity
                } else {
                    Toast.makeText(this, response.message, Toast.LENGTH_LONG).show()
                }
            }
            result.onFailure { error ->
                Toast.makeText(this, error.message ?: "Registration failed", Toast.LENGTH_LONG).show()
            }
        }
    }
}