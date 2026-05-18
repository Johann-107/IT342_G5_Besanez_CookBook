package com.it342.besanez.ui.collection

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

class CollectionRecipeAdapter(
    private val onView: (RecipeResponse) -> Unit,
    private val onRemove: (RecipeResponse) -> Unit
) : ListAdapter<RecipeResponse, CollectionRecipeAdapter.VH>(Diff()) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): VH {
        val v = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_collection_recipe, parent, false)
        return VH(v)
    }

    override fun onBindViewHolder(holder: VH, position: Int) =
        holder.bind(getItem(position))

    inner class VH(itemView: View) : RecyclerView.ViewHolder(itemView) {
        private val ivThumb: ImageView = itemView.findViewById(R.id.ivThumb)
        private val tvName: TextView = itemView.findViewById(R.id.tvRecipeName)
        private val tvMeta: TextView = itemView.findViewById(R.id.tvMeta)
        private val tvVisibility: TextView = itemView.findViewById(R.id.tvVisibility)
        private val btnView: ImageButton = itemView.findViewById(R.id.btnView)
        private val btnRemove: ImageButton = itemView.findViewById(R.id.btnRemove)

        fun bind(recipe: RecipeResponse) {
            tvName.text = recipe.name
            tvMeta.text = recipe.totalTimeMinutes?.let { min ->
                if (min < 60) "${min}m"
                else "${min / 60}h${if (min % 60 > 0) " ${min % 60}m" else ""}"
            } ?: ""
            tvMeta.visibility = if (tvMeta.text.isNullOrBlank()) View.GONE else View.VISIBLE
            tvVisibility.text = if (recipe.isPublic) "🌐" else "🔒"

            if (!recipe.imageUrl.isNullOrBlank()) {
                Glide.with(itemView).load(recipe.imageUrl).centerCrop().into(ivThumb)
            } else {
                ivThumb.setImageResource(android.R.drawable.ic_menu_gallery)
            }

            itemView.setOnClickListener { onView(recipe) }
            btnView.setOnClickListener { onView(recipe) }
            btnRemove.setOnClickListener { onRemove(recipe) }
        }
    }

    class Diff : DiffUtil.ItemCallback<RecipeResponse>() {
        override fun areItemsTheSame(a: RecipeResponse, b: RecipeResponse) = a.id == b.id
        override fun areContentsTheSame(a: RecipeResponse, b: RecipeResponse) = a == b
    }
}