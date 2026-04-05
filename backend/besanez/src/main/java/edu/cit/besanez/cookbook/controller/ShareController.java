package edu.cit.besanez.cookbook.controller;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import edu.cit.besanez.cookbook.dto.recipe.RecipeResponseDTO;
import edu.cit.besanez.cookbook.service.ShareService;
import edu.cit.besanez.cookbook.util.JwtUtil;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/share")
@RequiredArgsConstructor
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:5173" })
public class ShareController {

    private final ShareService shareService;
    private final JwtUtil jwtUtil;

    private long extractUserId(HttpServletRequest request) {
        String token = request.getHeader("Authorization").substring(7);
        return jwtUtil.extractUserId(token);
    }

    /**
     * POST /api/share/recipe/:id
     * Generates (or refreshes) a unique share token for a recipe.
     * Only the recipe owner can call this.
     * Response: { shareToken, shareUrl }
     */
    @PostMapping("/recipe/{recipeId}")
    public ResponseEntity<?> generateShareToken(
            HttpServletRequest request,
            @PathVariable Long recipeId) {
        long userId = extractUserId(request);
        Map<String, String> result = shareService.generateShareToken(userId, recipeId);
        return ResponseEntity.ok(result);
    }

    /**
     * DELETE /api/share/recipe/:id
     * Revokes the share link for a recipe (sets shareToken to null).
     */
    @DeleteMapping("/recipe/{recipeId}")
    public ResponseEntity<Void> revokeShareToken(
            HttpServletRequest request,
            @PathVariable Long recipeId) {
        long userId = extractUserId(request);
        shareService.revokeShareToken(userId, recipeId);
        return ResponseEntity.noContent().build();
    }

    /**
     * GET /api/share/:token
     * Public — resolves a share token and returns the recipe preview.
     * No auth required.
     */
    @GetMapping("/{token}")
    public ResponseEntity<RecipeResponseDTO> getSharedRecipe(@PathVariable String token) {
        RecipeResponseDTO recipe = shareService.getRecipeByShareToken(token);
        return ResponseEntity.ok(recipe);
    }

    /**
     * POST /api/share/:token/save
     * Authenticated — saves a shared recipe as a copy for the calling user.
     * Body (optional): { collectionIds: [1, 2] }
     * Response: the newly created RecipeResponseDTO copy
     */
    @PostMapping("/{token}/save")
    public ResponseEntity<RecipeResponseDTO> saveSharedRecipe(
            HttpServletRequest request,
            @PathVariable String token,
            @RequestBody(required = false) Map<String, Object> body) {
        long userId = extractUserId(request);

        List<Long> safeIds = List.of();
        if (body != null && body.containsKey("collectionIds")) {
            Object raw = body.get("collectionIds");
            if (raw instanceof List<?> rawList) {
                safeIds = rawList.stream()
                        .filter(item -> item instanceof Number)
                        .map(item -> ((Number) item).longValue())
                        .toList();
            }
        }

        RecipeResponseDTO saved = shareService.saveSharedRecipe(userId, token, safeIds);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }
}