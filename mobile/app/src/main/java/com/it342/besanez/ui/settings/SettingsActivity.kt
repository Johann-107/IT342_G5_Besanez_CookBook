package com.it342.besanez.ui.settings

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.view.MenuItem
import android.view.View
import android.widget.Button
import android.widget.ProgressBar
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import com.google.android.material.textfield.TextInputEditText
import com.it342.besanez.BesanezApp
import com.it342.besanez.R
import com.it342.besanez.data.TokenManager
import com.it342.besanez.model.ChangePasswordRequest
import com.it342.besanez.network.ApiClient
import com.it342.besanez.ui.auth.LoginActivity
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch

class SettingsActivity : AppCompatActivity() {

    private lateinit var tokenManager: TokenManager

    // Password fields
    private lateinit var etCurrentPassword: TextInputEditText
    private lateinit var etNewPassword: TextInputEditText
    private lateinit var etConfirmPassword: TextInputEditText
    private lateinit var tvPasswordError: TextView
    private lateinit var progressPassword: ProgressBar
    private lateinit var btnChangePassword: Button

    // Delete
    private lateinit var progressDelete: ProgressBar
    private lateinit var btnDeleteAccount: Button

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_settings)

        tokenManager = (application as BesanezApp).tokenManager

        val toolbar = findViewById<androidx.appcompat.widget.Toolbar>(R.id.toolbar)
        setSupportActionBar(toolbar)
        supportActionBar?.setDisplayHomeAsUpEnabled(true)
        supportActionBar?.title = "Settings"

        bindViews()
        setupListeners()
    }

    // ── Bind ─────────────────────────────────────────────────────────────────

    private fun bindViews() {
        etCurrentPassword  = findViewById(R.id.etCurrentPassword)
        etNewPassword      = findViewById(R.id.etNewPassword)
        etConfirmPassword  = findViewById(R.id.etConfirmPassword)
        tvPasswordError    = findViewById(R.id.tvPasswordError)
        progressPassword   = findViewById(R.id.progressPassword)
        btnChangePassword  = findViewById(R.id.btnChangePassword)
        progressDelete     = findViewById(R.id.progressDelete)
        btnDeleteAccount   = findViewById(R.id.btnDeleteAccount)
    }

    // ── Listeners ────────────────────────────────────────────────────────────

    private fun setupListeners() {
        btnChangePassword.setOnClickListener { attemptChangePassword() }
        btnDeleteAccount.setOnClickListener  { confirmDeleteAccount() }

        // Legal links — open in browser
        findViewById<Button>(R.id.btnPrivacy).setOnClickListener {
            openUrl("https://cookbook.app/privacy") // replace with actual URL
        }
        findViewById<Button>(R.id.btnTerms).setOnClickListener {
            openUrl("https://cookbook.app/terms")
        }
        findViewById<Button>(R.id.btnAbout).setOnClickListener {
            openUrl("https://cookbook.app/about")
        }
    }

    // ── Change password ───────────────────────────────────────────────────────

    private fun attemptChangePassword() {
        val current = etCurrentPassword.text.toString().trim()
        val new     = etNewPassword.text.toString().trim()
        val confirm = etConfirmPassword.text.toString().trim()

        if (current.isBlank() || new.isBlank() || confirm.isBlank()) {
            showPasswordError("Fill in all fields")
            return
        }
        if (new.length < 8) {
            showPasswordError("Password must be at least 8 characters")
            return
        }
        if (new != confirm) {
            showPasswordError("Passwords do not match")
            return
        }

        tvPasswordError.visibility = View.GONE
        progressPassword.visibility = View.VISIBLE
        btnChangePassword.isEnabled = false

        lifecycleScope.launch {
            try {
                val res = ApiClient.apiService.changePassword(
                    ChangePasswordRequest(oldPassword = current, newPassword = new)
                )
                if (res.isSuccessful) {
                    etCurrentPassword.text?.clear()
                    etNewPassword.text?.clear()
                    etConfirmPassword.text?.clear()
                    Toast.makeText(
                        this@SettingsActivity,
                        "Password updated successfully",
                        Toast.LENGTH_SHORT
                    ).show()
                } else {
                    showPasswordError("Current password is incorrect")
                }
            } catch (e: Exception) {
                showPasswordError("Network error. Check your connection.")
            } finally {
                progressPassword.visibility = View.GONE
                btnChangePassword.isEnabled = true
            }
        }
    }

    private fun showPasswordError(msg: String) {
        tvPasswordError.text = msg
        tvPasswordError.visibility = View.VISIBLE
    }

    // ── Delete account ────────────────────────────────────────────────────────

    private fun confirmDeleteAccount() {
        MaterialAlertDialogBuilder(this, R.style.CookBook_Dialog)
            .setTitle("Delete Account")
            .setMessage(
                "This will permanently delete your account, all recipes, and collections.\n\nThis cannot be undone. Are you sure?"
            )
            .setPositiveButton("Delete") { _, _ -> deleteAccount() }
            .setNegativeButton("Cancel", null)
            .show()
    }

    private fun deleteAccount() {
        progressDelete.visibility = View.VISIBLE
        btnDeleteAccount.isEnabled = false

        lifecycleScope.launch {
            try {
                val userId = tokenManager.userId.first()
                if (userId == null) {
                    Toast.makeText(this@SettingsActivity, "Not logged in", Toast.LENGTH_SHORT).show()
                    return@launch
                }

                val res = ApiClient.apiService.deleteUser(userId)
                if (res.isSuccessful) {
                    tokenManager.clearToken()
                    Toast.makeText(
                        this@SettingsActivity,
                        "Account deleted",
                        Toast.LENGTH_SHORT
                    ).show()
                    // Back to login
                    val intent = Intent(this@SettingsActivity, LoginActivity::class.java)
                    intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
                    startActivity(intent)
                } else {
                    Toast.makeText(
                        this@SettingsActivity,
                        "Failed to delete account",
                        Toast.LENGTH_LONG
                    ).show()
                    progressDelete.visibility = View.GONE
                    btnDeleteAccount.isEnabled = true
                }
            } catch (e: Exception) {
                Toast.makeText(
                    this@SettingsActivity,
                    "Network error. Check your connection.",
                    Toast.LENGTH_LONG
                ).show()
                progressDelete.visibility = View.GONE
                btnDeleteAccount.isEnabled = true
            }
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private fun openUrl(url: String) {
        try {
            startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url)))
        } catch (e: Exception) {
            Toast.makeText(this, "No browser found", Toast.LENGTH_SHORT).show()
        }
    }

    override fun onOptionsItemSelected(item: MenuItem): Boolean {
        if (item.itemId == android.R.id.home) { finish(); return true }
        return super.onOptionsItemSelected(item)
    }
}