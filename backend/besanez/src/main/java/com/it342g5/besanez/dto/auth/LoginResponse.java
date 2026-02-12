package com.it342g5.besanez.dto.auth;

import com.it342g5.besanez.dto.user.UserResponseDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {
    private String token;
    private String type = "Bearer";
    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private UserResponseDTO user;
    
    public LoginResponse(String token, Long id, String email, String firstName, String lastName) {
        this.token = token;
        this.id = id;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.user = UserResponseDTO.builder()
                .userId(id)
                .firstName(firstName)
                .lastName(lastName)
                .email(email)
                .build();
    }
}