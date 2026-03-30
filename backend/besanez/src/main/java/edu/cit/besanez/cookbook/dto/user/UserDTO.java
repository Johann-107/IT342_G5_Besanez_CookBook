package edu.cit.besanez.cookbook.dto.user;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    private long userId;
    private String firstName;
    private String lastName;
    private LocalDate birthdate;
    private int age;
    private String email;
    private String password;
}