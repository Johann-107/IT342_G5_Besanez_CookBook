package edu.cit.besanez.cookbook.dto.auth;

import edu.cit.besanez.cookbook.dto.user.UserResponseDTO;
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
    private String type;
    private Long id;
    private String email;
    private String firstName;
    private String lastName;

    // Full user object — includes profileImage and all other fields
    private UserResponseDTO user;
}