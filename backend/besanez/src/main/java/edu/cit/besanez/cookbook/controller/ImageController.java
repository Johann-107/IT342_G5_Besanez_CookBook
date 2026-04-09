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
import java.util.Set;

@RestController
@RequestMapping("/api/image")
@RequiredArgsConstructor
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:5173" })
public class ImageController {

    private final CloudinaryService cloudinaryService;
    private final JwtUtil jwtUtil;
    private static final Set<String> ALLOWED_FOLDERS = Set.of("recipes", "profiles");

    /**
     * POST /api/image/upload
     * Uploads an image to Cloudinary and returns the secure URL.
     * Form field: "file"
     * Query param: "folder" (optional, defaults to "recipes")
     */
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadImage(
            HttpServletRequest request,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "folder", defaultValue = "recipes") String folder) {
        try {
            if (file == null || file.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "No file provided."));
            }

            if (!ALLOWED_FOLDERS.contains(folder)) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Invalid folder."));
            }

            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Only image files are accepted."));
            }

            if (file.getSize() > 5 * 1024 * 1024) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Image must be smaller than 5 MB."));
            }

            String url = cloudinaryService.uploadImage(file, folder);
            return ResponseEntity.ok(Map.of("url", url));

        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body(Map.of("message", "Upload failed: " + e.getMessage()));
        }
    }
}