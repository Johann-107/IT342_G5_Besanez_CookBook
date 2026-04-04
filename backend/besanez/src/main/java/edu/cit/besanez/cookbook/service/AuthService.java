package edu.cit.besanez.cookbook.service;

import edu.cit.besanez.cookbook.dto.auth.LoginRequest;
import edu.cit.besanez.cookbook.dto.auth.LoginResponse;
import edu.cit.besanez.cookbook.dto.user.UserRequestDTO;
import edu.cit.besanez.cookbook.dto.user.UserResponseDTO;
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
                .profileImage(userRequestDTO.getProfileImage()) // optional, usually null on registration
                .build();

        UserEntity savedUser = userRepository.save(userEntity);
        return convertToResponseDTO(savedUser);
    }

    // ─── Login ────────────────────────────────────────────────────────────────

    @Transactional
    public LoginResponse login(LoginRequest loginRequest) {
        UserEntity user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found with email: " + loginRequest.getEmail()));

        // Prevent Google users from logging in with password
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
        String picture = oauth2User.getAttribute("picture"); // Google profile photo URL

        UserEntity user = userRepository.findByEmail(email).orElseGet(() -> {
            // First-time Google login — create new user and save their profile picture
            UserEntity newUser = UserEntity.builder()
                    .email(email)
                    .firstName(firstName != null ? firstName : "Google")
                    .lastName(lastName != null ? lastName : "User")
                    .password(null) // no password for Google users
                    .birthdate(null) // Google doesn't provide birthdate
                    .profileImage(picture) // save Google profile photo URL
                    .build();
            return userRepository.save(newUser);
        });

        // Refresh profile image on every Google login in case the user changed their
        // photo
        if (picture != null && !picture.equals(user.getProfileImage())) {
            user.setProfileImage(picture);
            userRepository.save(user);
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

    private LoginResponse buildLoginResponse(String token, UserEntity user) {
        UserResponseDTO userDTO = convertToResponseDTO(user);
        return LoginResponse.builder()
                .token(token)
                .type("Bearer") // set explicitly — no @Builder.Default needed
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
                .build();
    }
}