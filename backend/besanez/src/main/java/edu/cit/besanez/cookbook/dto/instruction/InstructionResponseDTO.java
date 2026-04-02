package edu.cit.besanez.cookbook.dto.instruction;

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
public class InstructionResponseDTO {

    private Long id;

    private Integer stepNumber;

    private String description;

    private Long recipeId;
}