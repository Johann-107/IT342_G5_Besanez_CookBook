package edu.cit.besanez.cookbook.dto.user;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProfileImageRequestDTO {

    // Nullable — passing null or empty string clears the profile image
    @Size(max = 1000, message = "Profile image URL must not exceed 1000 characters")
    private String profileImage;
}