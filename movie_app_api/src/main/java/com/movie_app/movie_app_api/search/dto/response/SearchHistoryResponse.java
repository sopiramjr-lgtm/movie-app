package com.movie_app.movie_app_api.search.dto.response;

import lombok.Builder;
import java.time.LocalDateTime;
import java.util.UUID;

@Builder
public record SearchHistoryResponse(
        UUID id,
        UUID profileId,
        String query,
        LocalDateTime searchedAt
) {}