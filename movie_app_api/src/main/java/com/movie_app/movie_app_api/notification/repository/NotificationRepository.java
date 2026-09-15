package com.movie_app.movie_app_api.notification.repository;

import com.movie_app.movie_app_api.notification.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, UUID> {

    List<Notification> findByUser_KeycloakIdOrderByCreatedAtDesc(String keycloakId);

    int countByUser_KeycloakIdAndIsReadFalse(String keycloakId);

    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.user.id = :userId AND n.isRead = false")
    void markAllAsReadForUser(@Param("userId") UUID userId);
}