package com.movie_app.movie_app_api.history.dto.response;
import lombok.Builder;
import java.time.LocalDateTime;
import java.util.UUID;

@Builder
public record WatchlistResponse(
        UUID id,
        UUID profileId,
        UUID contentId,
        String contentTitle,
        String posterUrl,
        LocalDateTime addedAt
) {}