package edu.cit.besanez.cookbook.user;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<UserEntity, Long> {

    Optional<UserEntity> findByEmail(String email);

    boolean existsByEmail(String email);

    // ─── Admin queries ────────────────────────────────────────────────────────

    long countByCreatedAtAfter(LocalDateTime dateTime);

    List<UserEntity> findAllByCreatedAtAfter(LocalDateTime dateTime);

    List<UserEntity> findTop10ByOrderByCreatedAtDesc();

    Page<UserEntity> findByEmailContainingIgnoreCaseOrFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(
            String email, String firstName, String lastName, Pageable pageable);

}