package com.it342g5.besanez.service;

import com.it342g5.besanez.dto.auth.LoginRequest;
import com.it342g5.besanez.dto.auth.LoginResponse;
import com.it342g5.besanez.dto.user.UserRequestDTO;
import com.it342g5.besanez.dto.user.UserResponseDTO;
import com.it342g5.besanez.entity.UserEntity;
import com.it342g5.besanez.exception.ResourceNotFoundException;
import com.it342g5.besanez.repository.UserRepository;
import com.it342g5.besanez.util.JwtUtil;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    
    @Transactional
    public UserResponseDTO register(UserRequestDTO userRequestDTO) {
        // Check if email already exists
        if (userRepository.existsByEmail(userRequestDTO.getEmail())) {
            throw new IllegalArgumentException("Email already exists: " + userRequestDTO.getEmail());
        }
        
        // Encrypt password with BCrypt
        String encryptedPassword = passwordEncoder.encode(userRequestDTO.getPassword());
        
        UserEntity userEntity = UserEntity.builder()
                .firstName(userRequestDTO.getFirstName())
                .lastName(userRequestDTO.getLastName())
                .birthdate(userRequestDTO.getBirthdate())
                .email(userRequestDTO.getEmail())
                .password(encryptedPassword) // BCrypt encrypted password
                .build();
        
        UserEntity savedUser = userRepository.save(userEntity);
        
        return convertToResponseDTO(savedUser);
    }
    
    @Transactional
    public LoginResponse login(LoginRequest loginRequest) {
        // Find user by email
        UserEntity user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + loginRequest.getEmail()));
        
        // Verify password using BCrypt
        boolean passwordMatches = passwordEncoder.matches(loginRequest.getPassword(), user.getPassword());
        
        if (!passwordMatches) {
            throw new IllegalArgumentException("Invalid password");
        }
        
        // Generate JWT token
        String token = jwtUtil.generateToken(user.getEmail(), user.getUserId());
        
        // Return login response with token and user info
        return new LoginResponse(
            token,
            user.getUserId(),
            user.getEmail(),
            user.getFirstName(),
            user.getLastName()
        );
    }
    
    @Transactional
    public void changePassword(Long userId, String oldPassword, String newPassword) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        // Verify old password
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new IllegalArgumentException("Old password is incorrect");
        }
        
        // Encrypt and set new password
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }
    
    @Transactional
    public void forgotPassword(String email, String newPassword) {
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        
        // In production, send email with reset link instead
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }
    
    private UserResponseDTO convertToResponseDTO(UserEntity userEntity) {
        return UserResponseDTO.builder()
                .userId(userEntity.getUserId())
                .firstName(userEntity.getFirstName())
                .lastName(userEntity.getLastName())
                .birthdate(userEntity.getBirthdate())
                .email(userEntity.getEmail())
                .build();
    }
}