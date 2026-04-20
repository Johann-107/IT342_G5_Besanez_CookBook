package edu.cit.besanez.cookbook.service;

import org.hibernate.Hibernate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import edu.cit.besanez.cookbook.dto.collection.CollectionRequestDTO;
import edu.cit.besanez.cookbook.dto.collection.CollectionResponseDTO;
import edu.cit.besanez.cookbook.entity.CollectionEntity;
import edu.cit.besanez.cookbook.entity.RecipeEntity;
import edu.cit.besanez.cookbook.entity.UserEntity;
import edu.cit.besanez.cookbook.exception.ResourceNotFoundException;
import edu.cit.besanez.cookbook.repository.CollectionRepository;
import edu.cit.besanez.cookbook.repository.RecipeRepository;
import edu.cit.besanez.cookbook.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CollectionService {

    private final CollectionRepository collectionRepository;
    private final UserRepository userRepository;
    private final RecipeRepository recipeRepository;

    // ─── CRUD ─────────────────────────────────────────────────────────────────

    @Transactional
    public CollectionResponseDTO createCollection(long userId, CollectionRequestDTO requestDTO) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        CollectionEntity collection = CollectionEntity.builder()
                .name(requestDTO.getName())
                .description(requestDTO.getDescription())
                .coverImage(requestDTO.getCoverImage())
                .user(user)
                .build();

        CollectionEntity saved = collectionRepository.save(collection);
        return convertToResponseDTO(saved);
    }

    @Transactional(readOnly = true)
    public CollectionResponseDTO getCollectionById(long userId, Long collectionId) {
        CollectionEntity collection = collectionRepository.findByIdAndUserId(collectionId, userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Collection not found with id: " + collectionId));
        return convertToResponseDTO(collection);
    }

    @Transactional(readOnly = true)
    public Page<CollectionResponseDTO> getAllCollectionsByUser(long userId, Pageable pageable) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found with id: " + userId);
        }
        return collectionRepository.findByUserId(userId, pageable)
                .map(this::convertToResponseDTO);
    }

    @Transactional(readOnly = true)
    public Page<CollectionResponseDTO> searchCollections(long userId, String name, Pageable pageable) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found with id: " + userId);
        }
        return collectionRepository.findByUserIdAndNameContainingIgnoreCase(userId, name, pageable)
                .map(this::convertToResponseDTO);
    }

    @Transactional
    public CollectionResponseDTO updateCollection(long userId, Long collectionId,
            CollectionRequestDTO requestDTO) {
        CollectionEntity collection = collectionRepository.findByIdAndUserId(collectionId, userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Collection not found with id: " + collectionId));

        collection.setName(requestDTO.getName());
        collection.setDescription(requestDTO.getDescription());

        // Allow clearing the cover image by passing null or blank
        if (requestDTO.getCoverImage() != null) {
            collection.setCoverImage(
                    requestDTO.getCoverImage().isBlank() ? null : requestDTO.getCoverImage());
        }

        CollectionEntity updated = collectionRepository.save(collection);
        return convertToResponseDTO(updated);
    }

    @Transactional
    public void deleteCollection(long userId, Long collectionId) {
        if (!collectionRepository.existsByIdAndUserId(collectionId, userId)) {
            throw new ResourceNotFoundException("Collection not found with id: " + collectionId);
        }
        collectionRepository.deleteById(collectionId);
    }

    // ─── Recipe membership ────────────────────────────────────────────────────

    @Transactional
    public CollectionResponseDTO addRecipeToCollection(long userId, Long collectionId, Long recipeId) {
        CollectionEntity collection = collectionRepository.findByIdAndUserId(collectionId, userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Collection not found with id: " + collectionId));

        RecipeEntity recipe = recipeRepository.findByIdAndUserId(recipeId, userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Recipe not found with id: " + recipeId));

        Hibernate.initialize(collection.getRecipes());
        collection.addRecipe(recipe);
        CollectionEntity updated = collectionRepository.save(collection);
        return convertToResponseDTO(updated);
    }

    @Transactional
    public CollectionResponseDTO removeRecipeFromCollection(long userId, Long collectionId, Long recipeId) {
        CollectionEntity collection = collectionRepository.findByIdAndUserId(collectionId, userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Collection not found with id: " + collectionId));

        RecipeEntity recipe = recipeRepository.findByIdAndUserId(recipeId, userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Recipe not found with id: " + recipeId));

        Hibernate.initialize(collection.getRecipes());
        collection.removeRecipe(recipe);
        CollectionEntity updated = collectionRepository.save(collection);
        return convertToResponseDTO(updated);
    }

    // ─── Mapping ──────────────────────────────────────────────────────────────

    private CollectionResponseDTO convertToResponseDTO(CollectionEntity collection) {
        Hibernate.initialize(collection.getRecipes());
        return CollectionResponseDTO.builder()
                .id(collection.getId())
                .name(collection.getName())
                .description(collection.getDescription())
                .coverImage(collection.getCoverImage())
                .userId(collection.getUser().getId())
                .recipeCount(collection.getRecipes().size())
                .createdAt(collection.getCreatedAt())
                .updatedAt(collection.getUpdatedAt())
                .build();
    }

    public CollectionResponseDTO convertToResponseDTOPublic(CollectionEntity collection) {
        Hibernate.initialize(collection.getRecipes());
        return CollectionResponseDTO.builder()
                .id(collection.getId())
                .name(collection.getName())
                .description(collection.getDescription())
                .coverImage(collection.getCoverImage())
                .userId(collection.getUser().getId())
                .recipeCount(collection.getRecipes().size())
                .createdAt(collection.getCreatedAt())
                .updatedAt(collection.getUpdatedAt())
                .build();
    }
}