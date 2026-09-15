package com.movie_app.movie_app_api.user.dto.response;

import lombok.Builder;
import java.time.LocalDateTime;
import java.util.UUID;

@Builder
public record UserResponse(
        UUID id,
        String displayName,
        String email,
        String avatarUrl,
        String role,
        boolean emailVerified,
        boolean active,
        LocalDateTime createdAt
) {}