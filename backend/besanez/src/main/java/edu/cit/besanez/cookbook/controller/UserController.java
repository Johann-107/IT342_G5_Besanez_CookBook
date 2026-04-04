package edu.cit.besanez.cookbook.controller;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

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
     * Returns the full user profile including profileImage, birthdate, and
     * cookingLevel.
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

            Map<String, Object> response = new HashMap<>();
            response.put("userId", user.getUserId());
            response.put("email", user.getEmail());
            response.put("firstName", user.getFirstName());
            response.put("lastName", user.getLastName());
            response.put("birthdate", user.getBirthdate()); // ← now included
            response.put("profileImage", user.getProfileImage());
            response.put("cookingLevel", user.getCookingLevel()); // ← now included

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid or expired token"));
        }
    }

    /**
     * PATCH /api/user/me/profile-image
     * Updates (or clears) the current user's profile image via a URL string.
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

    /**
     * POST /api/user/me/profile-image/upload
     * Accepts a multipart image file, encodes it to a base64 data URL, and persists
     * it.
     *
     * Form field name: "file"
     * Accepted types: image/jpeg, image/png, image/gif, image/webp
     * Max size: 5 MB (also enforced in UserService)
     *
     * NOTE: For production, replace the base64 approach in UserService with an
     * upload to S3 / Cloudinary and store the returned CDN URL instead.
     */
    @PostMapping(value = "/me/profile-image/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadProfileImage(
            HttpServletRequest request,
            @RequestParam("file") MultipartFile file) {
        try {
            if (file == null || file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "No file provided."));
            }

            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Only image files are accepted (JPEG, PNG, GIF, WEBP)."));
            }

            long userId = extractUserId(request);
            UserResponseDTO updated = userService.uploadProfileImage(userId, file.getBytes(), contentType);
            return ResponseEntity.ok(updated);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Failed to upload image."));
        }
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