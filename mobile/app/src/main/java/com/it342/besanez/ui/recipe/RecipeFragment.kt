package com.it342.besanez.ui.recipe

import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ProgressBar
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.fragment.app.Fragment
import androidx.lifecycle.ViewModelProvider
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.google.android.material.floatingactionbutton.FloatingActionButton
import com.google.android.material.textfield.TextInputEditText
import com.it342.besanez.R
import com.it342.besanez.model.RecipeResponse

class RecipeFragment : Fragment() {

    private lateinit var viewModel: RecipeViewModel
    private lateinit var adapter: RecipeAdapter

    private lateinit var rvRecipes: RecyclerView
    private lateinit var etSearch: TextInputEditText
    private lateinit var fabAddRecipe: FloatingActionButton
    private lateinit var progressBar: ProgressBar
    private lateinit var tvEmpty: TextView

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View = inflater.inflate(R.layout.fragment_recipe, container, false)

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        viewModel = ViewModelProvider(this)[RecipeViewModel::class.java]

        rvRecipes = view.findViewById(R.id.rvRecipes)
        etSearch = view.findViewById(R.id.etSearch)
        fabAddRecipe = view.findViewById(R.id.fabAddRecipe)
        progressBar = view.findViewById(R.id.progressBar)
        tvEmpty = view.findViewById(R.id.tvEmpty)

        setupRecyclerView()
        setupSearch()
        setupObservers()

        // Load initial recipes
        viewModel.loadRecipes()

        // FAB — placeholder for create recipe screen
        fabAddRecipe.setOnClickListener {
            Toast.makeText(requireContext(), "Create recipe — coming soon", Toast.LENGTH_SHORT).show()
        }
    }

    private fun setupRecyclerView() {
        adapter = RecipeAdapter(
            onItemClick = { recipe -> onRecipeClicked(recipe) },
            onDeleteClick = { recipe -> confirmDelete(recipe) }
        )

        val layoutManager = LinearLayoutManager(requireContext())
        rvRecipes.layoutManager = layoutManager
        rvRecipes.adapter = adapter

        // Pagination — load next page on scroll to bottom
        rvRecipes.addOnScrollListener(object : RecyclerView.OnScrollListener() {
            override fun onScrolled(recyclerView: RecyclerView, dx: Int, dy: Int) {
                super.onScrolled(recyclerView, dx, dy)
                val lastVisible = layoutManager.findLastVisibleItemPosition()
                val total = layoutManager.itemCount
                if (dy > 0 && lastVisible >= total - 3) {
                    viewModel.loadNextPage()
                }
            }
        })
    }

    private fun setupSearch() {
        etSearch.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
            override fun afterTextChanged(s: Editable?) {
                viewModel.searchDebounced(s?.toString() ?: "")
            }
        })
    }

    private fun setupObservers() {
        viewModel.recipes.observe(viewLifecycleOwner) { recipes ->
            adapter.submitList(recipes)
            tvEmpty.visibility = if (recipes.isEmpty()) View.VISIBLE else View.GONE
        }

        viewModel.loading.observe(viewLifecycleOwner) { isLoading ->
            progressBar.visibility = if (isLoading && adapter.itemCount == 0) View.VISIBLE else View.GONE
        }

        viewModel.error.observe(viewLifecycleOwner) { error ->
            if (!error.isNullOrBlank()) {
                Toast.makeText(requireContext(), error, Toast.LENGTH_LONG).show()
            }
        }

        viewModel.deleteResult.observe(viewLifecycleOwner) { result ->
            result.onSuccess {
                Toast.makeText(requireContext(), "Recipe deleted", Toast.LENGTH_SHORT).show()
            }
            result.onFailure { e ->
                Toast.makeText(requireContext(), e.message, Toast.LENGTH_LONG).show()
            }
        }
    }

    private fun onRecipeClicked(recipe: RecipeResponse) {
        // Placeholder — recipe detail screen coming next
        Toast.makeText(requireContext(), "Opened: ${recipe.name}", Toast.LENGTH_SHORT).show()
    }

    private fun confirmDelete(recipe: RecipeResponse) {
        AlertDialog.Builder(requireContext())
            .setTitle("Delete Recipe")
            .setMessage("Delete \"${recipe.name}\"? This cannot be undone.")
            .setPositiveButton("Delete") { _, _ -> viewModel.deleteRecipe(recipe.id) }
            .setNegativeButton("Cancel", null)
            .show()
    }
}