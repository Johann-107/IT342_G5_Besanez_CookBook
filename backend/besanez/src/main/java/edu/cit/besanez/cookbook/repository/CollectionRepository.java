package edu.cit.besanez.cookbook.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import edu.cit.besanez.cookbook.entity.CollectionEntity;

@Repository
public interface CollectionRepository extends JpaRepository<CollectionEntity, Long> {

    List<CollectionEntity> findByUserId(long userId);

    Optional<CollectionEntity> findByIdAndUserId(Long id, long userId);

    List<CollectionEntity> findByUserIdAndNameContainingIgnoreCase(long userId, String name);

    boolean existsByIdAndUserId(Long id, long userId);

    @Query("""
            SELECT c FROM CollectionEntity c
            JOIN c.recipes r
            WHERE c.user.id = :userId
            AND r.id = :recipeId
            """)
    List<CollectionEntity> findByUserIdAndRecipesId(@Param("userId") long userId,
            @Param("recipeId") Long recipeId);
}