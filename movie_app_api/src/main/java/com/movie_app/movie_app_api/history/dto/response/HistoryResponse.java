package com.movie_app.movie_app_api.history.dto.response;

import lombok.Builder;
import java.time.LocalDateTime;
import java.util.UUID;

@Builder
public record HistoryResponse(
        UUID id,
        UUID profileId,
        UUID contentId,
        String contentTitle,
        UUID episodeId,
        String episodeTitle,
        int progressSeconds,
        boolean completed,
        LocalDateTime lastWatchedAt
) {}