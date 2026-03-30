package edu.cit.besanez.cookbook.dto.user;

import java.time.LocalDate;
import java.time.Period;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponseDTO {
    private long userId;
    private String firstName;
    private String lastName;
    private LocalDate birthdate;
    private String email;
    
    public int getAge() {
        if (this.birthdate == null) {
            return 0;
        }
        return Period.between(this.birthdate, LocalDate.now()).getYears();
    }
}