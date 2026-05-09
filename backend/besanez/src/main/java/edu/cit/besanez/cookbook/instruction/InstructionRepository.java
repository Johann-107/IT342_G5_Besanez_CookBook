package edu.cit.besanez.cookbook.instruction;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InstructionRepository extends JpaRepository<InstructionEntity, Long> {

    List<InstructionEntity> findByRecipeIdOrderByStepNumberAsc(Long recipeId);

    Optional<InstructionEntity> findByIdAndRecipeId(Long id, Long recipeId);

    void deleteByRecipeId(Long recipeId);
}