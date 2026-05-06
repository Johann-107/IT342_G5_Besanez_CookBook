package edu.cit.besanez.cookbook.service;

import edu.cit.besanez.cookbook.dto.auth.LoginRequest;
import edu.cit.besanez.cookbook.dto.auth.LoginResponse;
import edu.cit.besanez.cookbook.dto.user.UserRequestDTO;
import edu.cit.besanez.cookbook.dto.user.UserResponseDTO;
import edu.cit.besanez.cookbook.entity.CookingLevel;
import edu.cit.besanez.cookbook.entity.UserEntity;
import edu.cit.besanez.cookbook.exception.ResourceNotFoundException;
import edu.cit.besanez.cookbook.repository.UserRepository;
import edu.cit.besanez.cookbook.util.JwtUtil;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final CloudinaryService cloudinaryService;
    private final DefaultDataSeederService seederService; // ← injected

    // ─── Register ─────────────────────────────────────────────────────────────

    @Transactional
    public UserResponseDTO register(UserRequestDTO userRequestDTO) {
        if (userRepository.existsByEmail(userRequestDTO.getEmail())) {
            throw new IllegalArgumentException("Email already exists: " + userRequestDTO.getEmail());
        }

        String encryptedPassword = passwordEncoder.encode(userRequestDTO.getPassword());

        UserEntity userEntity = UserEntity.builder()
                .firstName(userRequestDTO.getFirstName())
                .lastName(userRequestDTO.getLastName())
                .birthdate(userRequestDTO.getBirthdate())
                .email(userRequestDTO.getEmail())
                .password(encryptedPassword)
                .profileImage(userRequestDTO.getProfileImage())
                .cookingLevel(userRequestDTO.getCookingLevel() != null
                        ? userRequestDTO.getCookingLevel()
                        : CookingLevel.BEGINNER)
                .build();

        UserEntity savedUser = userRepository.save(userEntity);

        // Seed 3 built-in Filipino recipes + 1 starter collection for every new
        // account.
        seederService.seedDefaultData(savedUser);

        return convertToResponseDTO(savedUser);
    }

    // ─── Login ────────────────────────────────────────────────────────────────

    @Transactional
    public LoginResponse login(LoginRequest loginRequest) {
        UserEntity user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found with email: " + loginRequest.getEmail()));

        if (user.getPassword() == null) {
            throw new IllegalArgumentException(
                    "This account uses Google Sign-In. Please log in with Google.");
        }

        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid password");
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getId());
        return buildLoginResponse(token, user);
    }

    // ─── Google OAuth2 ────────────────────────────────────────────────────────

    @Transactional
    public LoginResponse loginOrRegisterGoogleUser(OAuth2User oauth2User) {
        String email = oauth2User.getAttribute("email");
        String firstName = oauth2User.getAttribute("given_name");
        String lastName = oauth2User.getAttribute("family_name");
        String picture = oauth2User.getAttribute("picture");

        boolean[] isNewUser = { false };

        UserEntity user = userRepository.findByEmail(email).orElseGet(() -> {
            // New Google user — upload their avatar to Cloudinary immediately so we
            // never depend on lh3.googleusercontent.com again.
            String persistedImage = uploadGoogleAvatar(null, picture);

            UserEntity newUser = UserEntity.builder()
                    .email(email)
                    .firstName(firstName != null ? firstName : "Google")
                    .lastName(lastName != null ? lastName : "User")
                    .password(null)
                    .birthdate(null)
                    .profileImage(persistedImage)
                    .cookingLevel(CookingLevel.BEGINNER)
                    .build();

            UserEntity saved = userRepository.save(newUser);
            isNewUser[0] = true;
            return saved;
        });

        // Seed default recipes only for brand-new Google accounts.
        if (isNewUser[0]) {
            seederService.seedDefaultData(user);
        }

        // For existing users: re-upload only when Google gives us a new picture URL
        // (i.e. the stored URL is still a Google URL, or it changed).
        boolean storedIsGoogleUrl = user.getProfileImage() != null
                && user.getProfileImage().contains("googleusercontent.com");

        if (!isNewUser[0] && picture != null && (storedIsGoogleUrl || user.getProfileImage() == null)) {
            String cloudinaryUrl = uploadGoogleAvatar(user.getId(), picture);
            if (cloudinaryUrl != null) {
                user.setProfileImage(cloudinaryUrl);
                userRepository.save(user);
            }
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getId());
        return buildLoginResponse(token, user);
    }

    // ─── Password management ──────────────────────────────────────────────────

    @Transactional
    public void changePassword(Long userId, String oldPassword, String newPassword) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found with id: " + userId));

        if (user.getPassword() == null) {
            throw new IllegalArgumentException(
                    "Google Sign-In accounts cannot change password here.");
        }

        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new IllegalArgumentException("Old password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    @Transactional
    public void forgotPassword(String email, String newPassword) {
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found with email: " + email));

        if (user.getPassword() == null) {
            throw new IllegalArgumentException(
                    "Google Sign-In accounts cannot reset password here.");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    /**
     * Uploads a Google profile picture to Cloudinary and returns the CDN URL.
     * Falls back to the original Google URL if Cloudinary is unavailable,
     * so a Cloudinary outage never blocks login.
     */
    private String uploadGoogleAvatar(Long userId, String picture) {
        if (picture == null || picture.isBlank())
            return null;
        try {
            String folder = userId != null
                    ? "users/" + userId + "/profiles"
                    : "users/profiles";
            return cloudinaryService.uploadImageFromUrl(picture, folder);
        } catch (Exception e) {
            System.err.println("Google avatar upload to Cloudinary failed: " + e.getMessage());
            return picture;
        }
    }

    private LoginResponse buildLoginResponse(String token, UserEntity user) {
        UserResponseDTO userDTO = convertToResponseDTO(user);
        return LoginResponse.builder()
                .token(token)
                .type("Bearer")
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .user(userDTO)
                .build();
    }

    private UserResponseDTO convertToResponseDTO(UserEntity userEntity) {
        return UserResponseDTO.builder()
                .userId(userEntity.getId())
                .firstName(userEntity.getFirstName())
                .lastName(userEntity.getLastName())
                .birthdate(userEntity.getBirthdate())
                .email(userEntity.getEmail())
                .profileImage(userEntity.getProfileImage())
                .cookingLevel(userEntity.getCookingLevel())
                .role(userEntity.getRole())
                .build();
    }
}