package com.movie_app.movie_app_api.admin.dto.request;

import jakarta.validation.constraints.NotBlank;
import java.util.UUID;

public record CreateAuditLogRequest(
        @NotBlank(message = "Action is required")
        String action,

        @NotBlank(message = "Target type is required")
        String targetType,

        UUID targetId,

        String details,

        String status
) {}
