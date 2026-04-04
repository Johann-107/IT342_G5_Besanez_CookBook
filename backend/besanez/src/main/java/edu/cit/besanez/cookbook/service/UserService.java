package edu.cit.besanez.cookbook.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import edu.cit.besanez.cookbook.dto.user.UserRequestDTO;
import edu.cit.besanez.cookbook.dto.user.UserResponseDTO;
import edu.cit.besanez.cookbook.entity.CookingLevel;
import edu.cit.besanez.cookbook.entity.UserEntity;
import edu.cit.besanez.cookbook.exception.ResourceNotFoundException;
import edu.cit.besanez.cookbook.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public UserResponseDTO getUserById(long userId) {
        UserEntity userEntity = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        return convertToResponseDTO(userEntity);
    }

    @Transactional(readOnly = true)
    public List<UserResponseDTO> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserResponseDTO updateUser(long userId, UserRequestDTO userRequestDTO) {
        UserEntity userEntity = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        // Check if email is being changed and if new email already exists
        if (!userEntity.getEmail().equals(userRequestDTO.getEmail()) &&
                userRepository.existsByEmail(userRequestDTO.getEmail())) {
            throw new IllegalArgumentException("Email already exists: " + userRequestDTO.getEmail());
        }

        userEntity.setFirstName(userRequestDTO.getFirstName());
        userEntity.setLastName(userRequestDTO.getLastName());
        userEntity.setBirthdate(userRequestDTO.getBirthdate());
        userEntity.setEmail(userRequestDTO.getEmail());

        // Update cookingLevel when provided
        if (userRequestDTO.getCookingLevel() != null) {
            userEntity.setCookingLevel(userRequestDTO.getCookingLevel());
        }

        // Update profileImage only when the field is explicitly provided
        if (userRequestDTO.getProfileImage() != null) {
            userEntity.setProfileImage(userRequestDTO.getProfileImage());
        }

        // Password is NOT updated here — use AuthService.changePassword instead

        UserEntity updatedUser = userRepository.save(userEntity);
        return convertToResponseDTO(updatedUser);
    }

    @Transactional
    public void deleteUser(long userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found with id: " + userId);
        }
        userRepository.deleteById(userId);
    }

    @Transactional(readOnly = true)
    public UserResponseDTO getUserByEmail(String email) {
        UserEntity userEntity = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        return convertToResponseDTO(userEntity);
    }

    // ─── Profile image ────────────────────────────────────────────────────────

    /**
     * Updates (or clears) the profile image via a URL / base64 data URL string.
     * Pass null or blank to clear.
     */
    @Transactional
    public UserResponseDTO updateProfileImage(long userId, String profileImageUrl) {
        UserEntity userEntity = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        userEntity.setProfileImage(
                (profileImageUrl != null && profileImageUrl.isBlank()) ? null : profileImageUrl);

        UserEntity updated = userRepository.save(userEntity);
        return convertToResponseDTO(updated);
    }

    /**
     * Accepts a raw file as a byte array (from multipart upload), encodes it to a
     * base64 data URL, and persists it.
     *
     * NOTE: For production, replace this with an S3 / Cloudinary upload and store
     * only the returned CDN URL. The base64 approach is intentionally simple for
     * development and small images (≤ 5 MB).
     */
    @Transactional
    public UserResponseDTO uploadProfileImage(long userId, byte[] imageBytes, String contentType) {
        if (imageBytes == null || imageBytes.length == 0) {
            throw new IllegalArgumentException("Image file is empty.");
        }

        // 5 MB hard limit
        if (imageBytes.length > 5 * 1024 * 1024) {
            throw new IllegalArgumentException("Image must be smaller than 5 MB.");
        }

        String base64 = java.util.Base64.getEncoder().encodeToString(imageBytes);
        String dataUrl = "data:" + contentType + ";base64," + base64;

        return updateProfileImage(userId, dataUrl);
    }

    // ─── Mapping ──────────────────────────────────────────────────────────────

    public UserResponseDTO convertToResponseDTO(UserEntity userEntity) {
        return UserResponseDTO.builder()
                .userId(userEntity.getId())
                .firstName(userEntity.getFirstName())
                .lastName(userEntity.getLastName())
                .birthdate(userEntity.getBirthdate())
                .email(userEntity.getEmail())
                .profileImage(userEntity.getProfileImage())
                .cookingLevel(userEntity.getCookingLevel())
                .build();
    }
}