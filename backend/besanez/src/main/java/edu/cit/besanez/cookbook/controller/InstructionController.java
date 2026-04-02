package edu.cit.besanez.cookbook.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import edu.cit.besanez.cookbook.dto.instruction.InstructionRequestDTO;
import edu.cit.besanez.cookbook.dto.instruction.InstructionResponseDTO;
import edu.cit.besanez.cookbook.service.InstructionService;
import edu.cit.besanez.cookbook.util.JwtUtil;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/recipe/{recipeId}/instruction")
@RequiredArgsConstructor
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:5173" })
public class InstructionController {

    private final InstructionService instructionService;
    private final JwtUtil jwtUtil;

    private long extractUserId(HttpServletRequest request) {
        String token = request.getHeader("Authorization").substring(7);
        return jwtUtil.extractUserId(token);
    }

    @PostMapping
    public ResponseEntity<InstructionResponseDTO> addInstruction(
            HttpServletRequest request,
            @PathVariable Long recipeId,
            @Valid @RequestBody InstructionRequestDTO requestDTO) {
        long userId = extractUserId(request);
        InstructionResponseDTO created = instructionService.addInstruction(userId, recipeId, requestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping
    public ResponseEntity<List<InstructionResponseDTO>> getInstructions(
            HttpServletRequest request,
            @PathVariable Long recipeId) {
        long userId = extractUserId(request);
        List<InstructionResponseDTO> instructions = instructionService.getInstructionsByRecipe(userId, recipeId);
        return ResponseEntity.ok(instructions);
    }

    @GetMapping("/{id}")
    public ResponseEntity<InstructionResponseDTO> getInstructionById(
            HttpServletRequest request,
            @PathVariable Long recipeId,
            @PathVariable Long id) {
        long userId = extractUserId(request);
        InstructionResponseDTO instruction = instructionService.getInstructionById(userId, recipeId, id);
        return ResponseEntity.ok(instruction);
    }

    @PutMapping("/{id}")
    public ResponseEntity<InstructionResponseDTO> updateInstruction(
            HttpServletRequest request,
            @PathVariable Long recipeId,
            @PathVariable Long id,
            @Valid @RequestBody InstructionRequestDTO requestDTO) {
        long userId = extractUserId(request);
        InstructionResponseDTO updated = instructionService.updateInstruction(userId, recipeId, id, requestDTO);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInstruction(
            HttpServletRequest request,
            @PathVariable Long recipeId,
            @PathVariable Long id) {
        long userId = extractUserId(request);
        instructionService.deleteInstruction(userId, recipeId, id);
        return ResponseEntity.noContent().build();
    }
}