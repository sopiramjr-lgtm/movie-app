package com.movie_app.movie_app_api.notification.service;

import com.movie_app.movie_app_api.notification.dto.response.NotificationResponse;

import java.util.List;
import java.util.UUID;

public interface NotificationService {
    // Methods for the frontend to consume
    List<NotificationResponse> getUserNotifications(String keycloakId);
    int getUnreadCount(String keycloakId);
    void markAsRead(String keycloakId, UUID notificationId);
    void markAllAsRead(String keycloakId);
    void deleteNotification(String keycloakId, UUID notificationId);

    // Internal and administrative notification methods
    void createNotification(UUID userId, String title, String message, String type);
    void sendGlobalNotification(String title, String message, String type);
    void sendNotificationToUser(UUID userId, String title, String message, String type);
}