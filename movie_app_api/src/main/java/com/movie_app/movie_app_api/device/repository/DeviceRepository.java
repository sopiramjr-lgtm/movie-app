package com.movie_app.movie_app_api.device.repository;

import com.movie_app.movie_app_api.device.entity.Device;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DeviceRepository extends JpaRepository<Device, UUID> {
    List<Device> findByUser_KeycloakIdOrderByLastActiveAtDesc(String keycloakId);
    Optional<Device> findByRefreshToken(String refreshToken);
}