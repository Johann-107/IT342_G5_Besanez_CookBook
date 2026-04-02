package edu.cit.besanez.cookbook.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import edu.cit.besanez.cookbook.entity.RecipeEntity;

@Repository
public interface RecipeRepository extends JpaRepository<RecipeEntity, Long> {

    List<RecipeEntity> findByUserId(long userId);

    Optional<RecipeEntity> findByIdAndUserId(Long id, long userId);

    List<RecipeEntity> findByUserIdAndNameContainingIgnoreCase(long userId, String name);

    List<RecipeEntity> findByIsPublicTrueAndNameContainingIgnoreCase(String name);

    List<RecipeEntity> findByIsPublicTrue();

    boolean existsByIdAndUserId(Long id, long userId);

    @Query("""
            SELECT r FROM RecipeEntity r
            JOIN r.collections c
            WHERE c.id = :collectionId
            AND c.user.id = :userId
            """)
    List<RecipeEntity> findByCollectionIdAndUserId(@Param("collectionId") Long collectionId,
            @Param("userId") long userId);
}