package com.movie_app.movie_app_api.review.dto.response;
import lombok.Builder;
import java.time.LocalDateTime;
import java.util.UUID;

@Builder
public record ReviewResponse(
        UUID id,
        UUID profileId,
        String profileName,
        String profileAvatarUrl,
        UUID contentId,
        int rating,
        String comment,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}