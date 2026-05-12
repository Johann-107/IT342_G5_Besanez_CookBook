package com.it342.besanez.ui.auth

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

class ForgotPasswordActivity : AppCompatActivity() {

    private lateinit var viewModel: AuthViewModel

    private lateinit var etEmail: EditText
    private lateinit var etNewPassword: EditText
    private lateinit var etConfirmPassword: EditText
    private lateinit var btnReset: Button
    private lateinit var tvBack: TextView
    private lateinit var progressBar: ProgressBar

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_forgot_password)

        val tokenManager = (application as BesanezApp).tokenManager
        val repository = AuthRepository(tokenManager)
        val factory = AuthViewModelFactory(repository)
        viewModel = ViewModelProvider(this, factory)[AuthViewModel::class.java]

        etEmail = findViewById(R.id.etEmail)
        etNewPassword = findViewById(R.id.etNewPassword)
        etConfirmPassword = findViewById(R.id.etConfirmPassword)
        btnReset = findViewById(R.id.btnReset)
        tvBack = findViewById(R.id.tvBack)
        progressBar = findViewById(R.id.progressBar)

        btnReset.setOnClickListener {
            val email = etEmail.text.toString().trim()
            val newPassword = etNewPassword.text.toString().trim()
            val confirmPassword = etConfirmPassword.text.toString().trim()

            if (email.isEmpty() || newPassword.isEmpty() || confirmPassword.isEmpty()) {
                Toast.makeText(this, "Fill in all fields", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            if (newPassword != confirmPassword) {
                Toast.makeText(this, "Passwords do not match", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            if (newPassword.length < 8) {
                Toast.makeText(this, "Password must be at least 8 characters", Toast.LENGTH_SHORT).show()
                return@setOnClickListener
            }

            viewModel.forgotPassword(email, newPassword)
        }

        tvBack.setOnClickListener { finish() }

        viewModel.loading.observe(this) { isLoading ->
            progressBar.visibility = if (isLoading) View.VISIBLE else View.GONE
            btnReset.isEnabled = !isLoading
        }

        viewModel.forgotPasswordResult.observe(this) { result ->
            result.onSuccess { response ->
                if (response.success) {
                    Toast.makeText(this, "Password reset! Please sign in.", Toast.LENGTH_SHORT).show()
                    finish()
                } else {
                    Toast.makeText(this, response.message, Toast.LENGTH_LONG).show()
                }
            }
            result.onFailure { error ->
                Toast.makeText(this, error.message ?: "Reset failed", Toast.LENGTH_LONG).show()
            }
        }
    }
}