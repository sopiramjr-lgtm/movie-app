package com.movie_app.movie_app_api.streaming.repository;

import com.movie_app.movie_app_api.streaming.entity.PlaybackSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PlaybackSessionRepository extends JpaRepository<PlaybackSession, UUID> {
    // Count active streams to enforce subscription limits
    int countByUser_KeycloakIdAndIsActiveTrue(String keycloakId);

    Optional<PlaybackSession> findBySessionTokenAndIsActiveTrue(String sessionToken);
}