package com.movie_app.movie_app_api.history.dto.request;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record HistoryRequest(
        @NotNull(message = "Content ID is required") UUID contentId,
        UUID episodeId, // Null if it's a Movie
        @NotNull(message = "Progress seconds is required") Integer progressSeconds,
        @NotNull(message = "Completed status is required") Boolean completed
) {}