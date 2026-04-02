package edu.cit.besanez.cookbook.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import edu.cit.besanez.cookbook.dto.recipe.RecipeRequestDTO;
import edu.cit.besanez.cookbook.dto.recipe.RecipeResponseDTO;
import edu.cit.besanez.cookbook.service.RecipeService;
import edu.cit.besanez.cookbook.util.JwtUtil;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/recipe")
@RequiredArgsConstructor
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:5173" })
public class RecipeController {

    private final RecipeService recipeService;
    private final JwtUtil jwtUtil;

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private long extractUserId(HttpServletRequest request) {
        String token = request.getHeader("Authorization").substring(7);
        return jwtUtil.extractUserId(token);
    }

    // ─── CRUD ─────────────────────────────────────────────────────────────────

    /** POST /api/recipe — create a new recipe */
    @PostMapping
    public ResponseEntity<RecipeResponseDTO> createRecipe(
            HttpServletRequest request,
            @Valid @RequestBody RecipeRequestDTO requestDTO) {
        long userId = extractUserId(request);
        RecipeResponseDTO created = recipeService.createRecipe(userId, requestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * GET /api/recipe — all recipes for the authenticated user
     * GET /api/recipe?search=x — search user's recipes by name (SDD: GET
     * /recipe?search={query})
     * GET /api/recipe?collection=x — recipes scoped to a specific collection
     */
    @GetMapping
    public ResponseEntity<List<RecipeResponseDTO>> getRecipes(
            HttpServletRequest request,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long collection) {
        long userId = extractUserId(request);

        List<RecipeResponseDTO> recipes;

        if (search != null && !search.isBlank()) {
            recipes = recipeService.searchUserRecipes(userId, search);
        } else if (collection != null) {
            recipes = recipeService.getRecipesByCollection(userId, collection);
        } else {
            recipes = recipeService.getAllRecipesByUser(userId);
        }

        return ResponseEntity.ok(recipes);
    }

    /**
     * GET /api/recipe/public?search=x — browse public recipes (shared collections)
     */
    @GetMapping("/public")
    public ResponseEntity<List<RecipeResponseDTO>> getPublicRecipes(
            @RequestParam(required = false) String search) {

        List<RecipeResponseDTO> recipes = (search != null && !search.isBlank())
                ? recipeService.searchPublicRecipes(search)
                : recipeService.searchPublicRecipes("");

        return ResponseEntity.ok(recipes);
    }

    /** GET /api/recipe/{id} — get a single recipe by id */
    @GetMapping("/{id}")
    public ResponseEntity<RecipeResponseDTO> getRecipeById(
            HttpServletRequest request,
            @PathVariable Long id) {
        long userId = extractUserId(request);
        RecipeResponseDTO recipe = recipeService.getRecipeById(userId, id);
        return ResponseEntity.ok(recipe);
    }

    /** PUT /api/recipe/{id} — update a recipe */
    @PutMapping("/{id}")
    public ResponseEntity<RecipeResponseDTO> updateRecipe(
            HttpServletRequest request,
            @PathVariable Long id,
            @Valid @RequestBody RecipeRequestDTO requestDTO) {
        long userId = extractUserId(request);
        RecipeResponseDTO updated = recipeService.updateRecipe(userId, id, requestDTO);
        return ResponseEntity.ok(updated);
    }

    /** DELETE /api/recipe/{id} — delete a recipe */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRecipe(
            HttpServletRequest request,
            @PathVariable Long id) {
        long userId = extractUserId(request);
        recipeService.deleteRecipe(userId, id);
        return ResponseEntity.noContent().build();
    }
}