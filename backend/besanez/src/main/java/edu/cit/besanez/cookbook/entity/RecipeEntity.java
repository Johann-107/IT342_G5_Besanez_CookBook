package edu.cit.besanez.cookbook.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "recipe")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecipeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false, length = 150)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "prep_time_minutes")
    private Integer prepTimeMinutes;

    @Column(name = "cook_time_minutes")
    private Integer cookTimeMinutes;

    @Column(name = "total_time_minutes")
    private Integer totalTimeMinutes;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(name = "is_public", nullable = false)
    @Builder.Default
    private boolean isPublic = false;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    // @OneToMany(mappedBy = "recipe", cascade = CascadeType.ALL, orphanRemoval =
    // true, fetch = FetchType.LAZY)
    // @Builder.Default
    // private List<IngredientEntity> ingredients = new ArrayList<>();

    // @OneToMany(mappedBy = "recipe", cascade = CascadeType.ALL, orphanRemoval =
    // true, fetch = FetchType.LAZY)
    // @OrderBy("stepNumber ASC")
    // @Builder.Default
    // private List<InstructionEntity> instructions = new ArrayList<>();

    @ManyToMany(mappedBy = "recipes", fetch = FetchType.LAZY)
    @Builder.Default
    private Set<CollectionEntity> collections = new HashSet<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // public void addIngredient(IngredientEntity ingredient) {
    // this.ingredients.add(ingredient);
    // ingredient.setRecipe(this);
    // }

    // public void removeIngredient(IngredientEntity ingredient) {
    // this.ingredients.remove(ingredient);
    // ingredient.setRecipe(null);
    // }

    // public void addInstruction(InstructionEntity instruction) {
    // this.instructions.add(instruction);
    // instruction.setRecipe(this);
    // }

    // public void removeInstruction(InstructionEntity instruction) {
    // this.instructions.remove(instruction);
    // instruction.setRecipe(null);
    // }
}