package edu.cit.besanez.cookbook.dto.recipe;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecipeRequestDTO {

    @NotBlank(message = "Recipe name is required")
    @Size(max = 150, message = "Recipe name must not exceed 150 characters")
    private String name;

    private String description;

    @Min(value = 0, message = "Prep time must be 0 or greater")
    private Integer prepTimeMinutes;

    @Min(value = 0, message = "Cook time must be 0 or greater")
    private Integer cookTimeMinutes;

    @Min(value = 0, message = "Total time must be 0 or greater")
    private Integer totalTimeMinutes;

    private String notes;

    @Size(max = 500, message = "Image URL must not exceed 500 characters")
    private String imageUrl;

    private boolean isPublic;
}