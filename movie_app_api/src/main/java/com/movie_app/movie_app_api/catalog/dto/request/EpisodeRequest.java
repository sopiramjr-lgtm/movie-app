package com.movie_app.movie_app_api.catalog.dto.request;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;
public record EpisodeRequest(
        @NotNull UUID seasonId, @NotNull Integer episodeNumber,
        @NotBlank String title, String description,
        Integer durationMinutes, String thumbnailUrl, @NotBlank String videoUrl) {}