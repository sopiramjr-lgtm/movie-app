package com.movie_app.movie_app_api.profile.repository;

import com.movie_app.movie_app_api.profile.entity.Profile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProfileRepository extends JpaRepository<Profile, UUID> {
    List<Profile> findByUser_KeycloakId(String keycloakId);
    Optional<Profile> findByIdAndUser_KeycloakId(UUID id, String keycloakId);
}