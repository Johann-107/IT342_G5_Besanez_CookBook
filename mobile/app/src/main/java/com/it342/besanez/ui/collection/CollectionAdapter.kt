package com.it342.besanez.ui.collection

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.it342.besanez.R
import com.it342.besanez.model.CollectionResponse

class CollectionAdapter(
    private val onClick: (CollectionResponse) -> Unit,
    private val onEdit: (CollectionResponse) -> Unit,
    private val onDelete: (CollectionResponse) -> Unit
) : ListAdapter<CollectionResponse, CollectionAdapter.VH>(Diff()) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): VH {
        val v = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_collection, parent, false)
        return VH(v)
    }

    override fun onBindViewHolder(holder: VH, position: Int) =
        holder.bind(getItem(position))

    inner class VH(itemView: View) : RecyclerView.ViewHolder(itemView) {
        private val tvName: TextView = itemView.findViewById(R.id.tvCollectionName)
        private val tvDesc: TextView = itemView.findViewById(R.id.tvCollectionDesc)
        private val tvCount: TextView = itemView.findViewById(R.id.tvRecipeCount)

        fun bind(col: CollectionResponse) {
            tvName.text = col.name
            tvDesc.text = col.description ?: ""
            tvDesc.visibility = if (col.description.isNullOrBlank()) View.GONE else View.VISIBLE
            tvCount.text = "${col.recipeCount} recipe${if (col.recipeCount != 1) "s" else ""}"

            itemView.setOnClickListener { onClick(col) }
        }
    }

    class Diff : DiffUtil.ItemCallback<CollectionResponse>() {
        override fun areItemsTheSame(a: CollectionResponse, b: CollectionResponse) = a.id == b.id
        override fun areContentsTheSame(a: CollectionResponse, b: CollectionResponse) = a == b
    }
}