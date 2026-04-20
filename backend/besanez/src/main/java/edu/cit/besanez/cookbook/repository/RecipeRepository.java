package edu.cit.besanez.cookbook.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import edu.cit.besanez.cookbook.entity.RecipeEntity;

@Repository
public interface RecipeRepository extends JpaRepository<RecipeEntity, Long> {

        // ─── Find by owner ────────────────────────────────────────────────────────

        Page<RecipeEntity> findByUserId(long userId, Pageable pageable);

        Optional<RecipeEntity> findByIdAndUserId(Long id, long userId);

        // ─── Search ───────────────────────────────────────────────────────────────

        Page<RecipeEntity> findByUserIdAndNameContainingIgnoreCase(long userId, String name,
                        Pageable pageable);

        Page<RecipeEntity> findByIsPublicTrueAndNameContainingIgnoreCase(String name, Pageable pageable);

        // ─── Find by share token ─────────────────────────────────────────────────
        Optional<RecipeEntity> findByShareToken(String shareToken);

        // ─── Public recipes ───────────────────────────────────────────────────────

        Page<RecipeEntity> findByIsPublicTrue(Pageable pageable);

        // ─── Existence checks ─────────────────────────────────────────────────────

        boolean existsByIdAndUserId(Long id, long userId);

        // ─── Collection-scoped queries ────────────────────────────────────────────

        @Query("""
                        SELECT r FROM RecipeEntity r
                        JOIN r.collections c
                        WHERE c.id = :collectionId
                        AND c.user.id = :userId
                        """)
        Page<RecipeEntity> findByCollectionIdAndUserId(@Param("collectionId") Long collectionId,
                        @Param("userId") long userId,
                        Pageable pageable);

        // ─── Non-paginated (used internally for cascade/membership checks) ────────

        List<RecipeEntity> findByUserId(long userId);

        // ─── Admin queries ────────────────────────────────────────────────────────

        long countByIsPublicTrue();

        long countByCreatedAtAfter(LocalDateTime dateTime);

        List<RecipeEntity> findAllByCreatedAtAfter(LocalDateTime dateTime);

        List<RecipeEntity> findTop10ByOrderByCreatedAtDesc();
}