package com.movie_app.movie_app_api.notification.service.impl;

import com.movie_app.movie_app_api.core.exception.ForbiddenException;
import com.movie_app.movie_app_api.core.exception.ResourceNotFoundException;
import com.movie_app.movie_app_api.notification.dto.response.NotificationResponse;
import com.movie_app.movie_app_api.notification.entity.Notification;
import com.movie_app.movie_app_api.notification.mapper.NotificationMapper;
import com.movie_app.movie_app_api.notification.repository.NotificationRepository;
import com.movie_app.movie_app_api.notification.service.NotificationService;
import com.movie_app.movie_app_api.user.entity.User;
import com.movie_app.movie_app_api.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final NotificationMapper mapper;

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponse> getUserNotifications(String keycloakId) {
        return notificationRepository.findByUser_KeycloakIdOrderByCreatedAtDesc(keycloakId).stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public int getUnreadCount(String keycloakId) {
        return notificationRepository.countByUser_KeycloakIdAndIsReadFalse(keycloakId);
    }

    @Override
    @Transactional
    public void markAsRead(String keycloakId, UUID notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));

        if (!notification.getUser().getKeycloakId().equals(keycloakId)) {
            throw new ForbiddenException("Access denied");
        }

        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Override
    @Transactional
    public void markAllAsRead(String keycloakId) {
        User user = userRepository.findByKeycloakId(keycloakId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        notificationRepository.markAllAsReadForUser(user.getId());
    }

    @Override
    @Transactional
    public void deleteNotification(String keycloakId, UUID notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));

        if (!notification.getUser().getKeycloakId().equals(keycloakId)) {
            throw new ForbiddenException("Access denied");
        }

        notificationRepository.delete(notification);
    }

    @Override
    @Transactional
    public void createNotification(UUID userId, String title, String message, String type) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Notification notification = Notification.builder()
                .user(user)
                .title(title)
                .message(message)
                .type(type)
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();

        notificationRepository.save(notification);
    }

    @Override
    @Transactional
    public void sendGlobalNotification(String title, String message, String type) {
        List<User> users = userRepository.findAll();
        List<Notification> notifications = users.stream()
                .map(user -> Notification.builder()
                        .user(user)
                        .title(title)
                        .message(message)
                        .type(type != null ? type : "SYSTEM")
                        .isRead(false)
                        .createdAt(LocalDateTime.now())
                        .build())
                .toList();

        if (!notifications.isEmpty()) {
            notificationRepository.saveAll(notifications);
        }
    }

    @Override
    @Transactional
    public void sendNotificationToUser(UUID userId, String title, String message, String type) {
        createNotification(userId, title, message, type != null ? type : "SYSTEM");
    }
}