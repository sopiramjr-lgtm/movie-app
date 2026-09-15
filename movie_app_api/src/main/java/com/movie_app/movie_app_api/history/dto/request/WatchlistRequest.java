package com.movie_app.movie_app_api.history.dto.request;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record WatchlistRequest(@NotNull(message = "Content ID is required") UUID contentId) {}