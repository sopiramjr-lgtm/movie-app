package com.movie_app.movie_app_api.notification.dto.response;

import lombok.Builder;
import java.time.LocalDateTime;
import java.util.UUID;

@Builder
public record NotificationResponse(
        UUID id,
        String title,
        String message,
        String type,
        boolean isRead,
        LocalDateTime createdAt
) {}