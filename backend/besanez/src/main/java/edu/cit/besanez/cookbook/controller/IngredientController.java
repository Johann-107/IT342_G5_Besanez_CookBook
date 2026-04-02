package edu.cit.besanez.cookbook.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import edu.cit.besanez.cookbook.dto.ingredient.IngredientRequestDTO;
import edu.cit.besanez.cookbook.dto.ingredient.IngredientResponseDTO;
import edu.cit.besanez.cookbook.service.IngredientService;
import edu.cit.besanez.cookbook.util.JwtUtil;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/recipe/{recipeId}/ingredient")
@RequiredArgsConstructor
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:5173" })
public class IngredientController {

    private final IngredientService ingredientService;
    private final JwtUtil jwtUtil;

    private long extractUserId(HttpServletRequest request) {
        String token = request.getHeader("Authorization").substring(7);
        return jwtUtil.extractUserId(token);
    }

    @PostMapping
    public ResponseEntity<IngredientResponseDTO> addIngredient(
            HttpServletRequest request,
            @PathVariable Long recipeId,
            @Valid @RequestBody IngredientRequestDTO requestDTO) {
        long userId = extractUserId(request);
        IngredientResponseDTO created = ingredientService.addIngredient(userId, recipeId, requestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping
    public ResponseEntity<List<IngredientResponseDTO>> getIngredients(
            HttpServletRequest request,
            @PathVariable Long recipeId) {
        long userId = extractUserId(request);
        List<IngredientResponseDTO> ingredients = ingredientService.getIngredientsByRecipe(userId, recipeId);
        return ResponseEntity.ok(ingredients);
    }

    @GetMapping("/{id}")
    public ResponseEntity<IngredientResponseDTO> getIngredientById(
            HttpServletRequest request,
            @PathVariable Long recipeId,
            @PathVariable Long id) {
        long userId = extractUserId(request);
        IngredientResponseDTO ingredient = ingredientService.getIngredientById(userId, recipeId, id);
        return ResponseEntity.ok(ingredient);
    }

    @PutMapping("/{id}")
    public ResponseEntity<IngredientResponseDTO> updateIngredient(
            HttpServletRequest request,
            @PathVariable Long recipeId,
            @PathVariable Long id,
            @Valid @RequestBody IngredientRequestDTO requestDTO) {
        long userId = extractUserId(request);
        IngredientResponseDTO updated = ingredientService.updateIngredient(userId, recipeId, id, requestDTO);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteIngredient(
            HttpServletRequest request,
            @PathVariable Long recipeId,
            @PathVariable Long id) {
        long userId = extractUserId(request);
        ingredientService.deleteIngredient(userId, recipeId, id);
        return ResponseEntity.noContent().build();
    }
}