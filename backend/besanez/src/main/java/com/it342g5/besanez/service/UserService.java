package com.it342g5.besanez.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.it342g5.besanez.dto.userdto.UserRequestDTO;
import com.it342g5.besanez.dto.userdto.UserResponseDTO;
import com.it342g5.besanez.entity.UserEntity;
import com.it342g5.besanez.exception.ResourceNotFoundException;
import com.it342g5.besanez.repository.UserRepository;
import com.it342g5.besanez.service.UserService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {
    
    private final UserRepository userRepository;
    
    public UserResponseDTO createUser(UserRequestDTO userRequestDTO) {
        // Check if email already exists
        if (userRepository.existsByEmail(userRequestDTO.getEmail())) {
            throw new IllegalArgumentException("Email already exists: " + userRequestDTO.getEmail());
        }
        
        UserEntity userEntity = convertRequestToEntity(userRequestDTO);
        UserEntity savedUser = userRepository.save(userEntity);
        
        return convertToResponseDTO(savedUser);
    }
    
    public UserResponseDTO getUserById(long userId) {
        UserEntity userEntity = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        
        return convertToResponseDTO(userEntity);
    }
    
    public List<UserResponseDTO> getAllUsers() {
        List<UserEntity> users = userRepository.findAll();
        
        return users.stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }
    
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
        userEntity.setPassword(userRequestDTO.getPassword()); // In real app, encrypt password
        
        UserEntity updatedUser = userRepository.save(userEntity);
        
        return convertToResponseDTO(updatedUser);
    }
    
    public void deleteUser(long userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found with id: " + userId);
        }
        
        userRepository.deleteById(userId);
    }
    
    public UserResponseDTO getUserByEmail(String email) {
        UserEntity userEntity = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        
        return convertToResponseDTO(userEntity);
    }

    private UserEntity convertRequestToEntity(UserRequestDTO userRequestDTO) {
        return UserEntity.builder()
                .firstName(userRequestDTO.getFirstName())
                .lastName(userRequestDTO.getLastName())
                .birthdate(userRequestDTO.getBirthdate())
                .email(userRequestDTO.getEmail())
                .password(userRequestDTO.getPassword()) // In real app, encrypt password
                .build();
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
