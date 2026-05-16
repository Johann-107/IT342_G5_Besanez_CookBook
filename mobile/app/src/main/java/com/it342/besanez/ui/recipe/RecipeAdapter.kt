package com.it342.besanez.ui.recipe

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageButton
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.bumptech.glide.Glide
import com.it342.besanez.R
import com.it342.besanez.model.RecipeResponse

class RecipeAdapter(
    private val onItemClick: (RecipeResponse) -> Unit,
    private val onDeleteClick: (RecipeResponse) -> Unit
) : ListAdapter<RecipeResponse, RecipeAdapter.RecipeViewHolder>(DiffCallback()) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): RecipeViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_recipe, parent, false)
        return RecipeViewHolder(view)
    }

    override fun onBindViewHolder(holder: RecipeViewHolder, position: Int) {
        holder.bind(getItem(position))
    }

    inner class RecipeViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {

        private val ivImage: ImageView = itemView.findViewById(R.id.ivRecipeImage)
        private val tvName: TextView = itemView.findViewById(R.id.tvRecipeName)
        private val tvDesc: TextView = itemView.findViewById(R.id.tvRecipeDesc)
        private val tvTime: TextView = itemView.findViewById(R.id.tvTime)
        private val tvVisibility: TextView = itemView.findViewById(R.id.tvVisibility)
        private val btnDelete: ImageButton = itemView.findViewById(R.id.btnDelete)

        fun bind(recipe: RecipeResponse) {
            tvName.text = recipe.name
            tvDesc.text = recipe.description ?: ""
            tvDesc.visibility = if (recipe.description.isNullOrBlank()) View.GONE else View.VISIBLE

            // Time badge
            val time = recipe.totalTimeMinutes
            if (time != null && time > 0) {
                tvTime.visibility = View.VISIBLE
                tvTime.text = if (time < 60) "${time}m"
                else {
                    val h = time / 60
                    val m = time % 60
                    if (m > 0) "${h}h ${m}m" else "${h}h"
                }
            } else {
                tvTime.visibility = View.GONE
            }

            // Visibility badge
            tvVisibility.text = if (recipe.isPublic) "Public" else "Private"

            // Image
            if (!recipe.imageUrl.isNullOrBlank()) {
                Glide.with(itemView.context)
                    .load(recipe.imageUrl)
                    .placeholder(android.R.drawable.ic_menu_gallery)
                    .centerCrop()
                    .into(ivImage)
            } else {
                ivImage.setImageResource(android.R.drawable.ic_menu_gallery)
            }

            itemView.setOnClickListener { onItemClick(recipe) }
            btnDelete.setOnClickListener { onDeleteClick(recipe) }
        }
    }

    class DiffCallback : DiffUtil.ItemCallback<RecipeResponse>() {
        override fun areItemsTheSame(old: RecipeResponse, new: RecipeResponse) = old.id == new.id
        override fun areContentsTheSame(old: RecipeResponse, new: RecipeResponse) = old == new
    }
}