package edu.cit.besanez.cookbook.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import edu.cit.besanez.cookbook.dto.user.UserRequestDTO;
import edu.cit.besanez.cookbook.dto.user.UserResponseDTO;
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

    @Transactional
    public UserResponseDTO updateProfileImage(long userId, String profileImageUrl) {
        UserEntity userEntity = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        // Allow null/empty to clear the image
        userEntity.setProfileImage(
                (profileImageUrl != null && profileImageUrl.isBlank()) ? null : profileImageUrl);

        UserEntity updated = userRepository.save(userEntity);
        return convertToResponseDTO(updated);
    }

    // ─── Mapping ──────────────────────────────────────────────────────────────

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