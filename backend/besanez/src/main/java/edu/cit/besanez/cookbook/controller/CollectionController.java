package edu.cit.besanez.cookbook.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import edu.cit.besanez.cookbook.dto.collection.CollectionRequestDTO;
import edu.cit.besanez.cookbook.dto.collection.CollectionResponseDTO;
import edu.cit.besanez.cookbook.service.CollectionService;
import edu.cit.besanez.cookbook.util.JwtUtil;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/collection")
@RequiredArgsConstructor
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:5173" })
public class CollectionController {

    private final CollectionService collectionService;
    private final JwtUtil jwtUtil;

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private long extractUserId(HttpServletRequest request) {
        String token = request.getHeader("Authorization").substring(7);
        return jwtUtil.extractUserId(token);
    }

    // ─── CRUD ─────────────────────────────────────────────────────────────────

    /** POST /api/collection — create a new collection for the authenticated user */
    @PostMapping
    public ResponseEntity<CollectionResponseDTO> createCollection(
            HttpServletRequest request,
            @Valid @RequestBody CollectionRequestDTO requestDTO) {
        long userId = extractUserId(request);
        CollectionResponseDTO created = collectionService.createCollection(userId, requestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * GET /api/collection — all collections for the authenticated user
     * GET /api/collection?search=x — filtered by name (search bar in UI)
     */
    @GetMapping
    public ResponseEntity<List<CollectionResponseDTO>> getAllCollections(
            HttpServletRequest request,
            @RequestParam(required = false) String search) {
        long userId = extractUserId(request);

        List<CollectionResponseDTO> collections = (search != null && !search.isBlank())
                ? collectionService.searchCollections(userId, search)
                : collectionService.getAllCollectionsByUser(userId);

        return ResponseEntity.ok(collections);
    }

    /** GET /api/collection/{id} — get a single collection by id */
    @GetMapping("/{id}")
    public ResponseEntity<CollectionResponseDTO> getCollectionById(
            HttpServletRequest request,
            @PathVariable Long id) {
        long userId = extractUserId(request);
        CollectionResponseDTO collection = collectionService.getCollectionById(userId, id);
        return ResponseEntity.ok(collection);
    }

    /** PUT /api/collection/{id} — update name/description of a collection */
    @PutMapping("/{id}")
    public ResponseEntity<CollectionResponseDTO> updateCollection(
            HttpServletRequest request,
            @PathVariable Long id,
            @Valid @RequestBody CollectionRequestDTO requestDTO) {
        long userId = extractUserId(request);
        CollectionResponseDTO updated = collectionService.updateCollection(userId, id, requestDTO);
        return ResponseEntity.ok(updated);
    }

    /** DELETE /api/collection/{id} — delete a collection */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCollection(
            HttpServletRequest request,
            @PathVariable Long id) {
        long userId = extractUserId(request);
        collectionService.deleteCollection(userId, id);
        return ResponseEntity.noContent().build();
    }

    // ─── Recipe membership ────────────────────────────────────────────────────

    /**
     * POST /api/collection/{id}/recipe/{recipeId} — add a recipe to a collection
     * (the "+ Collection" button)
     */
    @PostMapping("/{id}/recipe/{recipeId}")
    public ResponseEntity<CollectionResponseDTO> addRecipeToCollection(
            HttpServletRequest request,
            @PathVariable Long id,
            @PathVariable Long recipeId) {
        long userId = extractUserId(request);
        CollectionResponseDTO updated = collectionService.addRecipeToCollection(userId, id, recipeId);
        return ResponseEntity.ok(updated);
    }

    /**
     * DELETE /api/collection/{id}/recipe/{recipeId} — remove a recipe from a
     * collection
     */
    @DeleteMapping("/{id}/recipe/{recipeId}")
    public ResponseEntity<CollectionResponseDTO> removeRecipeFromCollection(
            HttpServletRequest request,
            @PathVariable Long id,
            @PathVariable Long recipeId) {
        long userId = extractUserId(request);
        CollectionResponseDTO updated = collectionService.removeRecipeFromCollection(userId, id, recipeId);
        return ResponseEntity.ok(updated);
    }
}