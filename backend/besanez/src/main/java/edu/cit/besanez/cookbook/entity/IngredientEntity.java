package edu.cit.besanez.cookbook.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "ingredient")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IngredientEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false)
    private Integer quantity;

    /**
     * Unit of measurement for the quantity.
     * Stored as a string in the DB (e.g. "TBSP", "CUP", "G").
     * Optional — some ingredients like "2 eggs" have no unit.
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = true, length = 20)
    private IngredientUnit unit;

    @Column(nullable = true, length = 50)
    private String notes;

    /**
     * Many ingredients belong to one recipe.
     * FK column references recipe.id
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "recipe_id", nullable = false)
    private RecipeEntity recipe;
}