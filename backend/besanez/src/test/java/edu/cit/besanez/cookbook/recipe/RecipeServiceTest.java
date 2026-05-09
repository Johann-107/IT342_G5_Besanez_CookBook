package edu.cit.besanez.cookbook.recipe;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.assertj.core.api.Assertions.*;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import edu.cit.besanez.cookbook.shared.exception.ResourceNotFoundException;
import edu.cit.besanez.cookbook.user.UserEntity;
import edu.cit.besanez.cookbook.user.UserRepository;

@ExtendWith(MockitoExtension.class)
class RecipeServiceTest {

    @Mock
    private RecipeRepository recipeRepository;
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private RecipeService recipeService;

    // ── Fixtures ──────────────────────────────────────────────────────────────

    private UserEntity mockUser;
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
                .id(1L)
                .name("Chicken Adobo")
                .isPublic(false)
                .user(mockUser)
                .build();
    }

    // ── Tests ─────────────────────────────────────────────────────────────────

    @Test
    void createRecipe_validData_returnsRecipeResponseDTO() {
        RecipeRequestDTO dto = RecipeRequestDTO.builder()
                .name("Chicken Adobo")
                .isPublic(false)
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(mockUser));
        when(recipeRepository.save(any())).thenReturn(mockRecipe);

        RecipeResponseDTO result = recipeService.createRecipe(1L, dto);

        assertThat(result.getName()).isEqualTo("Chicken Adobo");
        assertThat(result.isPublic()).isFalse();
    }

    @Test
    void getRecipeById_notOwner_throwsResourceNotFoundException() {
        when(recipeRepository.findByIdAndUserId(1L, 99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> recipeService.getRecipeById(99L, 1L));
    }

    @Test
    void deleteRecipe_validOwner_deletesRecipe() {
        when(recipeRepository.existsByIdAndUserId(1L, 1L)).thenReturn(true);

        recipeService.deleteRecipe(1L, 1L);

        verify(recipeRepository).deleteById(1L);
    }

    @Test
    void deleteRecipe_notOwner_throwsResourceNotFoundException() {
        when(recipeRepository.existsByIdAndUserId(1L, 99L)).thenReturn(false);

        assertThrows(ResourceNotFoundException.class,
                () -> recipeService.deleteRecipe(99L, 1L));
    }
}