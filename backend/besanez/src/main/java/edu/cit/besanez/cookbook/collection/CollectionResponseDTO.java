package edu.cit.besanez.cookbook.collection;

import java.time.LocalDateTime;
import java.util.List;

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
public class CollectionResponseDTO {

    private Long id;

    private String name;

    private String description;

    private long userId;

    private int recipeCount;

    private String coverImage;

    private List<String> recipeImages;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}