package edu.cit.besanez.cookbook.dto.recipe;

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
public class RecipeRequestDTO {

    private String name;

    private String description;

    private Integer prepTimeMinutes;

    private Integer cookTimeMinutes;

    private Integer totalTimeMinutes;

    private String notes;

    private String imageUrl;

    private boolean isPublic;
}