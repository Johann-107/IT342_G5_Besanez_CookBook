package edu.cit.besanez.cookbook.auth;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.assertj.core.api.Assertions.*;

import java.time.LocalDate;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import edu.cit.besanez.cookbook.shared.exception.ResourceNotFoundException;
import edu.cit.besanez.cookbook.shared.util.JwtUtil;
import edu.cit.besanez.cookbook.user.CookingLevel;
import edu.cit.besanez.cookbook.user.DefaultDataSeederService;
import edu.cit.besanez.cookbook.user.UserEntity;
import edu.cit.besanez.cookbook.user.UserRepository;
import edu.cit.besanez.cookbook.user.UserRequestDTO;
import edu.cit.besanez.cookbook.user.UserResponseDTO;
import edu.cit.besanez.cookbook.user.UserService;
import edu.cit.besanez.cookbook.image.CloudinaryService;
import edu.cit.besanez.cookbook.admin.AdminService;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private JwtUtil jwtUtil;
    @Mock
    private DefaultDataSeederService seederService;
    @Mock
    private CloudinaryService cloudinaryService;
    @Mock
    private AdminService adminService;
    @Mock
    private org.springframework.mail.javamail.JavaMailSender mailSender;

    @InjectMocks
    private AuthService authService;

    // ── Fixtures ──────────────────────────────────────────────────────────────

    private UserEntity mockUser;
    private LoginRequest loginRequest;

    @BeforeEach
    void setUp() {
        mockUser = UserEntity.builder()
                .id(1L)
                .firstName("Juan")
                .lastName("Dela Cruz")
                .email("juan@test.com")
                .password("$2a$12$hashedpassword")
                .cookingLevel(CookingLevel.BEGINNER)
                .role("USER")
                .build();

        loginRequest = new LoginRequest();
        loginRequest.setEmail("user@test.com");
        loginRequest.setPassword("Pass@1234");
    }

    private UserRequestDTO dtoWithEmail(String email) {
        return UserRequestDTO.builder()
                .firstName("Test")
                .lastName("User")
                .email(email)
                .password("Pass@1234")
                .birthdate(LocalDate.of(1995, 1, 1))
                .build();
    }

    private UserEntity mockUserWithPassword(String hashedPassword) {
        return UserEntity.builder()
                .id(2L)
                .firstName("User")
                .lastName("Test")
                .email("user@test.com")
                .password(hashedPassword)
                .cookingLevel(CookingLevel.BEGINNER)
                .role("USER")
                .build();
    }

    // ── Tests ─────────────────────────────────────────────────────────────────

    @Test
    void register_validData_returnsUserResponseDTO() {
        UserRequestDTO dto = UserRequestDTO.builder()
                .firstName("Juan")
                .lastName("Dela Cruz")
                .email("juan@test.com")
                .password("Pass@1234")
                .birthdate(LocalDate.of(1995, 1, 1))
                .build();

        when(userRepository.existsByEmail("juan@test.com")).thenReturn(false);
        when(passwordEncoder.encode(any())).thenReturn("$2a$12$hashed");
        when(userRepository.save(any())).thenReturn(mockUser);

        UserResponseDTO result = authService.register(dto);

        assertThat(result.getEmail()).isEqualTo("juan@test.com");
        verify(seederService).seedDefaultData(any());
    }

    @Test
    void register_duplicateEmail_throwsIllegalArgumentException() {
        when(userRepository.existsByEmail("dup@test.com")).thenReturn(true);

        assertThrows(IllegalArgumentException.class,
                () -> authService.register(dtoWithEmail("dup@test.com")));
    }

    @Test
    void login_validCredentials_returnsLoginResponse() {
        UserEntity user = mockUserWithPassword("hashed");

        when(userRepository.findByEmail("user@test.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("Pass@1234", "hashed")).thenReturn(true);
        when(jwtUtil.generateToken(any(), any())).thenReturn("jwt-token");
        doNothing().when(adminService).cleanupUserDataIfAdmin(anyLong(), any());

        LoginResponse response = authService.login(loginRequest);

        assertThat(response.getToken()).isEqualTo("jwt-token");
        assertThat(response.getUser().getEmail()).isEqualTo("user@test.com");
    }

    @Test
    void login_invalidPassword_throwsIllegalArgumentException() {
        UserEntity user = mockUserWithPassword("hashed");

        when(userRepository.findByEmail("user@test.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrongpassword", "hashed")).thenReturn(false);

        loginRequest.setPassword("wrongpassword");

        assertThrows(IllegalArgumentException.class,
                () -> authService.login(loginRequest));
    }

    @Test
    void login_nonExistentEmail_throwsResourceNotFoundException() {
        when(userRepository.findByEmail("nobody@test.com")).thenReturn(Optional.empty());

        loginRequest.setEmail("nobody@test.com");

        assertThrows(ResourceNotFoundException.class,
                () -> authService.login(loginRequest));
    }
}