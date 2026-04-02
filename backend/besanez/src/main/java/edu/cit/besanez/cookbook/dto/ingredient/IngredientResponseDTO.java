package edu.cit.besanez.cookbook.dto.ingredient;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IngredientResponseDTO {

    private Long id;

    private String name;

    private Integer quantity;

    private String notes;

    private Long recipeId;
}