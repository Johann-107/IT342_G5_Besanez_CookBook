package edu.cit.besanez.cookbook.collection;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.assertj.core.api.Assertions.*;

import java.util.HashSet;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import edu.cit.besanez.cookbook.recipe.RecipeEntity;
import edu.cit.besanez.cookbook.recipe.RecipeRepository;
import edu.cit.besanez.cookbook.shared.exception.ResourceNotFoundException;
import edu.cit.besanez.cookbook.user.UserEntity;
import edu.cit.besanez.cookbook.user.UserRepository;

@ExtendWith(MockitoExtension.class)
class CollectionServiceTest {

    @Mock
    private CollectionRepository collectionRepository;
    @Mock
    private RecipeRepository recipeRepository;
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private CollectionService collectionService;

    // ── Fixtures ──────────────────────────────────────────────────────────────

    private UserEntity mockUser;
    private CollectionEntity mockCollection;
    private RecipeEntity mockRecipe;

    @BeforeEach
    void setUp() {
        mockUser = UserEntity.builder()
                .id(1L)
                .firstName("Test")
                .lastName("User")
                .email("test@test.com")
                .role("USER")
                .build();

        mockRecipe = RecipeEntity.builder()
                .id(2L)
                .name("Chicken Adobo")
                .isPublic(false)
                .user(mockUser)
                .build();

        mockCollection = CollectionEntity.builder()
                .id(1L)
                .name("Filipino Favorites")
                .user(mockUser)
                .recipes(new HashSet<>())
                .build();
    }

    // ── Tests ─────────────────────────────────────────────────────────────────

    @Test
    void addRecipeToCollection_validIds_updatesCollection() {
        when(collectionRepository.findByIdAndUserId(1L, 1L))
                .thenReturn(Optional.of(mockCollection));
        when(recipeRepository.findByIdAndUserId(2L, 1L))
                .thenReturn(Optional.of(mockRecipe));
        when(collectionRepository.save(any())).thenReturn(mockCollection);

        CollectionResponseDTO result = collectionService.addRecipeToCollection(1L, 1L, 2L);

        assertThat(result.getRecipeCount()).isGreaterThan(0);
    }

    @Test
    void addRecipeToCollection_collectionNotFound_throwsResourceNotFoundException() {
        when(collectionRepository.findByIdAndUserId(99L, 1L))
                .thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> collectionService.addRecipeToCollection(1L, 99L, 2L));
    }

    @Test
    void deleteCollection_validOwner_deletesCollection() {
        when(collectionRepository.existsByIdAndUserId(1L, 1L)).thenReturn(true);

        collectionService.deleteCollection(1L, 1L);

        verify(collectionRepository).deleteById(1L);
    }

    @Test
    void deleteCollection_notOwner_throwsResourceNotFoundException() {
        when(collectionRepository.existsByIdAndUserId(1L, 99L)).thenReturn(false);

        assertThrows(ResourceNotFoundException.class,
                () -> collectionService.deleteCollection(99L, 1L));
    }
}