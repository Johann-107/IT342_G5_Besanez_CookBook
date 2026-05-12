package com.it342.besanez.ui.main

import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.google.android.material.bottomnavigation.BottomNavigationView
import com.it342.besanez.BesanezApp
import com.it342.besanez.R
import com.it342.besanez.repository.AuthRepository
import com.it342.besanez.ui.auth.LoginActivity
import com.it342.besanez.ui.collection.CollectionFragment
import com.it342.besanez.ui.profile.ProfileFragment
import com.it342.besanez.ui.recipe.RecipeFragment
import androidx.lifecycle.lifecycleScope
import kotlinx.coroutines.launch

class HomeActivity : AppCompatActivity() {

    private lateinit var bottomNavigation: BottomNavigationView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_home)

        bottomNavigation = findViewById(R.id.bottomNavigation)

        // Load default fragment
        if (savedInstanceState == null) {
            loadFragment(RecipeFragment())
        }

        bottomNavigation.setOnItemSelectedListener { item ->
            when (item.itemId) {
                R.id.nav_recipes -> {
                    loadFragment(RecipeFragment())
                    true
                }
                R.id.nav_collections -> {
                    loadFragment(CollectionFragment())
                    true
                }
                R.id.nav_profile -> {
                    loadFragment(ProfileFragment())
                    true
                }
                else -> false
            }
        }
    }

    private fun loadFragment(fragment: androidx.fragment.app.Fragment) {
        supportFragmentManager.beginTransaction()
            .replace(R.id.fragmentContainer, fragment)
            .commit()
    }

    fun logout() {
        val tokenManager = (application as BesanezApp).tokenManager
        val repository = AuthRepository(tokenManager)
        lifecycleScope.launch {
            repository.logout()
            startActivity(Intent(this@HomeActivity, LoginActivity::class.java))
            finish()
        }
    }
}