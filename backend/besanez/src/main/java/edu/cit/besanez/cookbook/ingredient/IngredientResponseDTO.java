package edu.cit.besanez.cookbook.ingredient;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IngredientResponseDTO {

    private Long id;

    private String name;

    private Integer quantity;

    private IngredientUnit unit;

    private String notes;

    private Long recipeId;
}