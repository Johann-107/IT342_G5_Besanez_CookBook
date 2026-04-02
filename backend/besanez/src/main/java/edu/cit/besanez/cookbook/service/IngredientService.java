package edu.cit.besanez.cookbook.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import edu.cit.besanez.cookbook.dto.ingredient.IngredientRequestDTO;
import edu.cit.besanez.cookbook.dto.ingredient.IngredientResponseDTO;
import edu.cit.besanez.cookbook.entity.IngredientEntity;
import edu.cit.besanez.cookbook.entity.RecipeEntity;
import edu.cit.besanez.cookbook.exception.ResourceNotFoundException;
import edu.cit.besanez.cookbook.repository.IngredientRepository;
import edu.cit.besanez.cookbook.repository.RecipeRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class IngredientService {

    private final IngredientRepository ingredientRepository;
    private final RecipeRepository recipeRepository;

    @Transactional
    public IngredientResponseDTO addIngredient(long userId, Long recipeId,
            IngredientRequestDTO requestDTO) {
        RecipeEntity recipe = recipeRepository.findByIdAndUserId(recipeId, userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Recipe not found with id: " + recipeId));

        IngredientEntity ingredient = IngredientEntity.builder()
                .name(requestDTO.getName())
                .quantity(requestDTO.getQuantity())
                .notes(requestDTO.getNotes())
                .recipe(recipe)
                .build();

        IngredientEntity saved = ingredientRepository.save(ingredient);

        return convertToResponseDTO(saved);
    }

    @Transactional(readOnly = true)
    public List<IngredientResponseDTO> getIngredientsByRecipe(long userId, Long recipeId) {
        if (!recipeRepository.existsByIdAndUserId(recipeId, userId)) {
            throw new ResourceNotFoundException("Recipe not found with id: " + recipeId);
        }

        return ingredientRepository.findByRecipeId(recipeId)
                .stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public IngredientResponseDTO getIngredientById(long userId, Long recipeId, Long ingredientId) {
        if (!recipeRepository.existsByIdAndUserId(recipeId, userId)) {
            throw new ResourceNotFoundException("Recipe not found with id: " + recipeId);
        }

        IngredientEntity ingredient = ingredientRepository.findByIdAndRecipeId(ingredientId, recipeId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Ingredient not found with id: " + ingredientId));

        return convertToResponseDTO(ingredient);
    }

    @Transactional
    public IngredientResponseDTO updateIngredient(long userId, Long recipeId, Long ingredientId,
            IngredientRequestDTO requestDTO) {
        if (!recipeRepository.existsByIdAndUserId(recipeId, userId)) {
            throw new ResourceNotFoundException("Recipe not found with id: " + recipeId);
        }

        IngredientEntity ingredient = ingredientRepository.findByIdAndRecipeId(ingredientId, recipeId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Ingredient not found with id: " + ingredientId));

        ingredient.setName(requestDTO.getName());
        ingredient.setQuantity(requestDTO.getQuantity());
        ingredient.setNotes(requestDTO.getNotes());

        IngredientEntity updated = ingredientRepository.save(ingredient);

        return convertToResponseDTO(updated);
    }

    @Transactional
    public void deleteIngredient(long userId, Long recipeId, Long ingredientId) {
        if (!recipeRepository.existsByIdAndUserId(recipeId, userId)) {
            throw new ResourceNotFoundException("Recipe not found with id: " + recipeId);
        }

        if (ingredientRepository.findByIdAndRecipeId(ingredientId, recipeId).isEmpty()) {
            throw new ResourceNotFoundException("Ingredient not found with id: " + ingredientId);
        }

        ingredientRepository.deleteById(ingredientId);
    }

    private IngredientResponseDTO convertToResponseDTO(IngredientEntity ingredient) {
        return IngredientResponseDTO.builder()
                .id(ingredient.getId())
                .name(ingredient.getName())
                .quantity(ingredient.getQuantity())
                .notes(ingredient.getNotes())
                .recipeId(ingredient.getRecipe().getId())
                .build();
    }
}