package com.it342.besanez.ui.recipe

import android.app.Activity
import android.os.Bundle
import android.view.*
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.lifecycleScope
import com.it342.besanez.R
import com.it342.besanez.network.ApiClient
import kotlinx.coroutines.*

class CreateRecipeActivity : AppCompatActivity() {

    companion object {
        const val EXTRA_RECIPE_ID = "recipe_id" // null = create, non-zero = edit
    }

    private lateinit var vm: CreateRecipeViewModel
    private var editId = 0L

    // Form fields
    private lateinit var etName: EditText
    private lateinit var etDesc: EditText
    private lateinit var etPrepTime: EditText
    private lateinit var etCookTime: EditText
    private lateinit var etTotalTime: EditText
    private lateinit var etNotes: EditText
    private lateinit var etImageUrl: EditText
    private lateinit var cbPublic: CheckBox
    private lateinit var llIngredients: LinearLayout
    private lateinit var llInstructions: LinearLayout
    private lateinit var btnAddIngredient: Button
    private lateinit var btnAddStep: Button
    private lateinit var progressBar: ProgressBar
    private lateinit var tvError: TextView

    private val ingredientRows = mutableListOf<IngredientRow>()
    private val instructionRows = mutableListOf<InstructionRow>()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_create_recipe)

        editId = intent.getLongExtra(EXTRA_RECIPE_ID, 0L)
        vm = ViewModelProvider(this)[CreateRecipeViewModel::class.java]

        supportActionBar?.setDisplayHomeAsUpEnabled(true)
        supportActionBar?.title = if (editId > 0) "Edit Recipe" else "New Recipe"

        bindViews()
        setupListeners()
        observe()

        if (editId > 0) loadForEdit()
        else {
            addIngredientRow()   // Start with one empty row
            addInstructionRow()
        }
    }

    private fun bindViews() {
        etName = findViewById(R.id.etName)
        etDesc = findViewById(R.id.etDesc)
        etPrepTime = findViewById(R.id.etPrepTime)
        etCookTime = findViewById(R.id.etCookTime)
        etTotalTime = findViewById(R.id.etTotalTime)
        etNotes = findViewById(R.id.etNotes)
        etImageUrl = findViewById(R.id.etImageUrl)
        cbPublic = findViewById(R.id.cbPublic)
        llIngredients = findViewById(R.id.llIngredients)
        llInstructions = findViewById(R.id.llInstructions)
        btnAddIngredient = findViewById(R.id.btnAddIngredient)
        btnAddStep = findViewById(R.id.btnAddStep)
        progressBar = findViewById(R.id.progressBar)
        tvError = findViewById(R.id.tvError)
    }

    private fun setupListeners() {
        btnAddIngredient.setOnClickListener { addIngredientRow() }
        btnAddStep.setOnClickListener { addInstructionRow() }
        findViewById<Button>(R.id.btnSave).setOnClickListener { save() }
    }

    private fun observe() {
        vm.loading.observe(this) {
            progressBar.visibility = if (it) View.VISIBLE else View.GONE
            findViewById<Button>(R.id.btnSave).isEnabled = !it
        }
        vm.error.observe(this) {
            tvError.text = it ?: ""
            tvError.visibility = if (it.isNullOrBlank()) View.GONE else View.VISIBLE
        }
        vm.saved.observe(this) { recipe ->
            recipe ?: return@observe
            setResult(Activity.RESULT_OK)
            finish()
        }
    }

    private fun addIngredientRow(prefill: IngredientRow? = null) {
        val row = prefill ?: IngredientRow()
        ingredientRows.add(row)

        val rowView = layoutInflater.inflate(R.layout.item_ingredient_input, llIngredients, false)
        val etQty = rowView.findViewById<EditText>(R.id.etQty)
        val etUnit = rowView.findViewById<EditText>(R.id.etUnit)
        val etIngName = rowView.findViewById<EditText>(R.id.etIngName)
        val etIngNotes = rowView.findViewById<EditText>(R.id.etIngNotes)
        val btnRemove = rowView.findViewById<ImageButton>(R.id.btnRemoveIng)

        etQty.setText(if (row.quantity > 0) row.quantity.toString() else "")
        etUnit.setText(row.unit)
        etIngName.setText(row.name)
        etIngNotes.setText(row.notes)

        // Live sync into data model
        etQty.onFocusChange { row.quantity = it.trim().toIntOrNull() ?: 0 }
        etUnit.onFocusChange { row.unit = it.trim() }
        etIngName.onFocusChange { row.name = it.trim() }
        etIngNotes.onFocusChange { row.notes = it.trim() }

        btnRemove.setOnClickListener {
            ingredientRows.remove(row)
            llIngredients.removeView(rowView)
        }

        llIngredients.addView(rowView)
    }

    private fun addInstructionRow(prefill: InstructionRow? = null) {
        val row = prefill ?: InstructionRow(stepNumber = instructionRows.size + 1)
        instructionRows.add(row)

        val rowView = layoutInflater.inflate(R.layout.item_instruction_input, llInstructions, false)
        val tvStep = rowView.findViewById<TextView>(R.id.tvStepNum)
        val etStep = rowView.findViewById<EditText>(R.id.etStepDesc)
        val btnRemove = rowView.findViewById<ImageButton>(R.id.btnRemoveStep)

        tvStep.text = "${instructionRows.size}"
        etStep.setText(row.description)
        etStep.onFocusChange { row.description = it.trim() }

        btnRemove.setOnClickListener {
            instructionRows.remove(row)
            llInstructions.removeView(rowView)
            renumberSteps()
        }

        llInstructions.addView(rowView)
    }

    private fun renumberSteps() {
        instructionRows.forEachIndexed { idx, row -> row.stepNumber = idx + 1 }
        for (i in 0 until llInstructions.childCount) {
            llInstructions.getChildAt(i)?.findViewById<TextView>(R.id.tvStepNum)?.text = "${i + 1}"
        }
    }

    private fun save() {
        // Flush focus to capture last typed value
        currentFocus?.clearFocus()

        val name = etName.text.toString().trim()
        if (name.isBlank()) { tvError.text = "Name required"; tvError.visibility = View.VISIBLE; return }

        val prep = etPrepTime.text.toString().toIntOrNull()
        val cook = etCookTime.text.toString().toIntOrNull()
        val total = etTotalTime.text.toString().toIntOrNull()

        if (editId > 0) {
            vm.update(editId, name, etDesc.text(), prep, cook, total,
                etNotes.text(), etImageUrl.text(), cbPublic.isChecked,
                ingredientRows, instructionRows)
        } else {
            vm.create(name, etDesc.text(), prep, cook, total,
                etNotes.text(), etImageUrl.text(), cbPublic.isChecked,
                ingredientRows, instructionRows)
        }
    }

    private fun loadForEdit() {
        lifecycleScope.launch {
            try {
                val api = ApiClient.apiService
                val r = api.getRecipeById(editId)
                val ing = api.getIngredients(editId)
                val inst = api.getInstructions(editId)

                if (r.isSuccessful) r.body()?.let { recipe ->
                    etName.setText(recipe.name)
                    etDesc.setText(recipe.description ?: "")
                    etPrepTime.setText(recipe.prepTimeMinutes?.toString() ?: "")
                    etCookTime.setText(recipe.cookTimeMinutes?.toString() ?: "")
                    etTotalTime.setText(recipe.totalTimeMinutes?.toString() ?: "")
                    etNotes.setText(recipe.notes ?: "")
                    etImageUrl.setText(recipe.imageUrl ?: "")
                    cbPublic.isChecked = recipe.isPublic
                }
                if (ing.isSuccessful) ing.body()?.forEach { i ->
                    addIngredientRow(IngredientRow(i.id, i.name, i.quantity, i.unit ?: "", i.notes ?: ""))
                }
                if (inst.isSuccessful) inst.body()?.sortedBy { it.stepNumber }?.forEach { s ->
                    addInstructionRow(InstructionRow(s.id, s.stepNumber, s.description))
                }
            } catch (_: Exception) {}
        }
    }

    // Extension helpers
    private fun EditText.text() = text.toString().trim().ifBlank { null }
    private fun EditText.onFocusChange(block: (String) -> Unit) {
        setOnFocusChangeListener { _, hasFocus -> if (!hasFocus) block(text.toString()) }
    }

    override fun onSupportNavigateUp(): Boolean { finish(); return true }
}