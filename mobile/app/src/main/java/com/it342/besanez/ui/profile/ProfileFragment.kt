package com.it342.besanez.ui.profile

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ArrayAdapter
import android.widget.AutoCompleteTextView
import android.widget.Button
import android.widget.ProgressBar
import android.widget.TextView
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.lifecycle.ViewModelProvider
import com.bumptech.glide.Glide
import com.it342.besanez.R
import com.it342.besanez.ui.main.HomeActivity
import de.hdodenhof.circleimageview.CircleImageView

class ProfileFragment : Fragment() {

    private lateinit var viewModel: ProfileViewModel

    private lateinit var ivAvatar: CircleImageView
    private lateinit var tvName: TextView
    private lateinit var tvEmail: TextView
    private lateinit var tvCookingLevel: TextView
    private lateinit var etFirstName: com.google.android.material.textfield.TextInputEditText
    private lateinit var etLastName: com.google.android.material.textfield.TextInputEditText
    private lateinit var etEmailEdit: com.google.android.material.textfield.TextInputEditText
    private lateinit var spinnerCookingLevel: AutoCompleteTextView
    private lateinit var tvError: TextView
    private lateinit var btnSave: Button
    private lateinit var btnLogout: Button
    private lateinit var progressBar: ProgressBar

    private val cookingLevels = listOf("BEGINNER", "INTERMEDIATE", "ADVANCED")
    private var userId: Long = -1

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View = inflater.inflate(R.layout.fragment_profile, container, false)

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        viewModel = ViewModelProvider(this)[ProfileViewModel::class.java]

        // Bind views
        ivAvatar = view.findViewById(R.id.ivAvatar)
        tvName = view.findViewById(R.id.tvName)
        tvEmail = view.findViewById(R.id.tvEmail)
        tvCookingLevel = view.findViewById(R.id.tvCookingLevel)
        etFirstName = view.findViewById(R.id.etFirstName)
        etLastName = view.findViewById(R.id.etLastName)
        etEmailEdit = view.findViewById(R.id.etEmailEdit)
        spinnerCookingLevel = view.findViewById(R.id.spinnerCookingLevel)
        tvError = view.findViewById(R.id.tvError)
        btnSave = view.findViewById(R.id.btnSave)
        btnLogout = view.findViewById(R.id.btnLogout)
        progressBar = view.findViewById(R.id.progressBar)

        // Setup cooking level dropdown
        val adapter = ArrayAdapter(
            requireContext(),
            android.R.layout.simple_dropdown_item_1line,
            cookingLevels
        )
        spinnerCookingLevel.setAdapter(adapter)

        // Load profile
        viewModel.loadProfile()

        // Observe user data
        viewModel.user.observe(viewLifecycleOwner) { user ->
            userId = user.userId

            // Header section
            tvName.text = "${user.firstName} ${user.lastName}"
            tvEmail.text = user.email
            tvCookingLevel.text = user.cookingLevel ?: "BEGINNER"

            // Load avatar with Glide
            if (!user.profileImage.isNullOrBlank()) {
                Glide.with(this)
                    .load(user.profileImage)
                    .placeholder(android.R.drawable.ic_menu_my_calendar)
                    .circleCrop()
                    .into(ivAvatar)
            }

            // Pre-fill edit fields
            etFirstName.setText(user.firstName)
            etLastName.setText(user.lastName)
            etEmailEdit.setText(user.email)
            spinnerCookingLevel.setText(user.cookingLevel ?: "BEGINNER", false)
        }

        // Observe loading
        viewModel.loading.observe(viewLifecycleOwner) { isLoading ->
            progressBar.visibility = if (isLoading) View.VISIBLE else View.GONE
            btnSave.isEnabled = !isLoading
        }

        // Observe error
        viewModel.error.observe(viewLifecycleOwner) { error ->
            if (!error.isNullOrBlank()) {
                tvError.text = error
                tvError.visibility = View.VISIBLE
            } else {
                tvError.visibility = View.GONE
            }
        }

        // Observe update result
        viewModel.updateResult.observe(viewLifecycleOwner) { result ->
            result.onSuccess {
                tvError.visibility = View.GONE
                Toast.makeText(requireContext(), "Profile updated!", Toast.LENGTH_SHORT).show()
            }
            result.onFailure { e ->
                tvError.text = e.message
                tvError.visibility = View.VISIBLE
            }
        }

        // Save button
        btnSave.setOnClickListener {
            val firstName = etFirstName.text.toString().trim()
            val lastName = etLastName.text.toString().trim()
            val email = etEmailEdit.text.toString().trim()
            val cookingLevel = spinnerCookingLevel.text.toString().trim()

            if (firstName.isEmpty() || lastName.isEmpty()) {
                tvError.text = "First and last name are required"
                tvError.visibility = View.VISIBLE
                return@setOnClickListener
            }

            if (userId == -1L) {
                tvError.text = "User not loaded yet"
                tvError.visibility = View.VISIBLE
                return@setOnClickListener
            }

            viewModel.updateProfile(userId, firstName, lastName, email, cookingLevel)
        }

        // Logout button
        btnLogout.setOnClickListener {
            (activity as? HomeActivity)?.logout()
        }
    }
}