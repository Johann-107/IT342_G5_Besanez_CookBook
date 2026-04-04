package edu.cit.besanez.cookbook.controller;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import edu.cit.besanez.cookbook.dto.user.ProfileImageRequestDTO;
import edu.cit.besanez.cookbook.dto.user.UserRequestDTO;
import edu.cit.besanez.cookbook.dto.user.UserResponseDTO;
import edu.cit.besanez.cookbook.service.UserService;
import edu.cit.besanez.cookbook.util.JwtUtil;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:5173" })
public class UserController {

    private final UserService userService;
    private final JwtUtil jwtUtil;

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private long extractUserId(HttpServletRequest request) {
        String token = request.getHeader("Authorization").substring(7);
        return jwtUtil.extractUserId(token);
    }

    private String extractEmail(HttpServletRequest request) {
        String token = request.getHeader("Authorization").substring(7);
        return jwtUtil.extractEmail(token);
    }

    // ─── Current user ─────────────────────────────────────────────────────────

    /**
     * GET /api/user/me
     * Returns the full user profile including profileImage.
     */
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(HttpServletRequest request) {
        try {
            String authHeader = request.getHeader("Authorization");

            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(401).body(Map.of("error", "No token provided"));
            }

            String email = extractEmail(request);
            UserResponseDTO user = userService.getUserByEmail(email);

            // Return the full DTO so the frontend gets profileImage too
            Map<String, Object> response = new HashMap<>();
            response.put("userId", user.getUserId());
            response.put("email", user.getEmail());
            response.put("firstName", user.getFirstName());
            response.put("lastName", user.getLastName());
            response.put("birthdate", user.getBirthdate());
            response.put("profileImage", user.getProfileImage()); // may be null

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid or expired token"));
        }
    }

    /**
     * PATCH /api/user/me/profile-image
     * Updates (or clears) the current user's profile image URL.
     * Body: { "profileImage": "https://..." } — send null or "" to clear.
     */
    @PatchMapping("/me/profile-image")
    public ResponseEntity<UserResponseDTO> updateProfileImage(
            HttpServletRequest request,
            @Valid @RequestBody ProfileImageRequestDTO dto) {
        long userId = extractUserId(request);
        UserResponseDTO updated = userService.updateProfileImage(userId, dto.getProfileImage());
        return ResponseEntity.ok(updated);
    }

    // ─── Admin / general endpoints ────────────────────────────────────────────

    @GetMapping("/{id}")
    public ResponseEntity<UserResponseDTO> getUserById(@PathVariable long id) {
        UserResponseDTO user = userService.getUserById(id);
        return ResponseEntity.ok(user);
    }

    @GetMapping
    public ResponseEntity<List<UserResponseDTO>> getAllUsers() {
        List<UserResponseDTO> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/email")
    public ResponseEntity<UserResponseDTO> getUserByEmail(@RequestParam String email) {
        UserResponseDTO user = userService.getUserByEmail(email);
        return ResponseEntity.ok(user);
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserResponseDTO> updateUser(
            @PathVariable long id,
            @Valid @RequestBody UserRequestDTO userRequestDTO) {
        UserResponseDTO updatedUser = userService.updateUser(id, userRequestDTO);
        return ResponseEntity.ok(updatedUser);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}