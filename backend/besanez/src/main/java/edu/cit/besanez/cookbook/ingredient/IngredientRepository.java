package edu.cit.besanez.cookbook.ingredient;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IngredientRepository extends JpaRepository<IngredientEntity, Long> {

    List<IngredientEntity> findByRecipeId(Long recipeId);

    Optional<IngredientEntity> findByIdAndRecipeId(Long id, Long recipeId);

    void deleteByRecipeId(Long recipeId);
}