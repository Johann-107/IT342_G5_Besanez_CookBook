package edu.cit.besanez.cookbook.controller;

import edu.cit.besanez.cookbook.service.CloudinaryService;
import edu.cit.besanez.cookbook.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.Map;

@RestController
@RequestMapping("/api/image")
@RequiredArgsConstructor
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:5173" })
public class ImageController {

    private final CloudinaryService cloudinaryService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadImage(
            HttpServletRequest request,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "folder", defaultValue = "recipes") String folder) {
        try {
            // ── Validate file ──────────────────────────────────────────────────
            if (file == null || file.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "No file provided."));
            }

            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Only image files are accepted (JPEG, PNG, GIF, WEBP)."));
            }

            if (file.getSize() > 5 * 1024 * 1024) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Image must be smaller than 5 MB."));
            }

            String sanitizedFolder = sanitizeFolder(folder);
            if (sanitizedFolder == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message",
                                "Invalid folder. Expected format: users/{userId}/recipes or users/{userId}/profiles"));
            }

            // ── Upload ─────────────────────────────────────────────────────────
            String url = cloudinaryService.uploadImage(file, sanitizedFolder);
            return ResponseEntity.ok(Map.of("url", url));

        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(Map.of("message", "Upload failed: " + e.getMessage()));
        }
    }

    private String sanitizeFolder(String folder) {
        if (folder == null || folder.isBlank())
            return null;

        if (folder.equals("recipes") || folder.equals("profiles")) {
            return folder;
        }

        if (folder.matches("^users/\\d+/(recipes|profiles)$")) {
            return folder;
        }

        return null;
    }
}