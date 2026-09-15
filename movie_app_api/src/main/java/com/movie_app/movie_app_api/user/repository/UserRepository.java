package com.movie_app.movie_app_api.user.repository;

import com.movie_app.movie_app_api.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByKeycloakId(String keycloakId);
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);

    List<User> findByEmailContainingIgnoreCase(String email);

    Page<User> findByRole(String role, Pageable pageable);

    Page<User> findByEmailContainingIgnoreCaseOrDisplayNameContainingIgnoreCase(String email, String displayName, Pageable pageable);
}