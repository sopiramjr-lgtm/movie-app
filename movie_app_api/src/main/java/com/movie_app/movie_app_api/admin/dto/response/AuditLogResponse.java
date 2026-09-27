package com.movie_app.movie_app_api.admin.dto.response;

import lombok.Builder;
import java.time.LocalDateTime;
import java.util.UUID;

@Builder
public record AuditLogResponse(
        UUID id,
        UUID adminId,
        String adminEmail,
        String adminName,
        String action,
        String targetType,
        UUID targetId,
        String details,
        String ipAddress,
        String status,
        LocalDateTime createdAt
) {}