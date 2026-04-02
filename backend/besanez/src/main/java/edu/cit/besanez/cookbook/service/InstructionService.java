package edu.cit.besanez.cookbook.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import edu.cit.besanez.cookbook.dto.instruction.InstructionRequestDTO;
import edu.cit.besanez.cookbook.dto.instruction.InstructionResponseDTO;
import edu.cit.besanez.cookbook.entity.InstructionEntity;
import edu.cit.besanez.cookbook.entity.RecipeEntity;
import edu.cit.besanez.cookbook.exception.ResourceNotFoundException;
import edu.cit.besanez.cookbook.repository.InstructionRepository;
import edu.cit.besanez.cookbook.repository.RecipeRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class InstructionService {

    private final InstructionRepository instructionRepository;
    private final RecipeRepository recipeRepository;

    @Transactional
    public InstructionResponseDTO addInstruction(long userId, Long recipeId,
            InstructionRequestDTO requestDTO) {
        RecipeEntity recipe = recipeRepository.findByIdAndUserId(recipeId, userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Recipe not found with id: " + recipeId));

        InstructionEntity instruction = InstructionEntity.builder()
                .stepNumber(requestDTO.getStepNumber())
                .description(requestDTO.getDescription())
                .recipe(recipe)
                .build();

        InstructionEntity saved = instructionRepository.save(instruction);

        return convertToResponseDTO(saved);
    }

    @Transactional(readOnly = true)
    public List<InstructionResponseDTO> getInstructionsByRecipe(long userId, Long recipeId) {
        if (!recipeRepository.existsByIdAndUserId(recipeId, userId)) {
            throw new ResourceNotFoundException("Recipe not found with id: " + recipeId);
        }

        return instructionRepository.findByRecipeIdOrderByStepNumberAsc(recipeId)
                .stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public InstructionResponseDTO getInstructionById(long userId, Long recipeId,
            Long instructionId) {
        if (!recipeRepository.existsByIdAndUserId(recipeId, userId)) {
            throw new ResourceNotFoundException("Recipe not found with id: " + recipeId);
        }

        InstructionEntity instruction = instructionRepository
                .findByIdAndRecipeId(instructionId, recipeId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Instruction not found with id: " + instructionId));

        return convertToResponseDTO(instruction);
    }

    @Transactional
    public InstructionResponseDTO updateInstruction(long userId, Long recipeId, Long instructionId,
            InstructionRequestDTO requestDTO) {
        if (!recipeRepository.existsByIdAndUserId(recipeId, userId)) {
            throw new ResourceNotFoundException("Recipe not found with id: " + recipeId);
        }

        InstructionEntity instruction = instructionRepository
                .findByIdAndRecipeId(instructionId, recipeId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Instruction not found with id: " + instructionId));

        instruction.setStepNumber(requestDTO.getStepNumber());
        instruction.setDescription(requestDTO.getDescription());

        InstructionEntity updated = instructionRepository.save(instruction);

        return convertToResponseDTO(updated);
    }

    @Transactional
    public void deleteInstruction(long userId, Long recipeId, Long instructionId) {
        if (!recipeRepository.existsByIdAndUserId(recipeId, userId)) {
            throw new ResourceNotFoundException("Recipe not found with id: " + recipeId);
        }

        if (instructionRepository.findByIdAndRecipeId(instructionId, recipeId).isEmpty()) {
            throw new ResourceNotFoundException("Instruction not found with id: " + instructionId);
        }

        instructionRepository.deleteById(instructionId);
    }

    private InstructionResponseDTO convertToResponseDTO(InstructionEntity instruction) {
        return InstructionResponseDTO.builder()
                .id(instruction.getId())
                .stepNumber(instruction.getStepNumber())
                .description(instruction.getDescription())
                .recipeId(instruction.getRecipe().getId())
                .build();
    }
}