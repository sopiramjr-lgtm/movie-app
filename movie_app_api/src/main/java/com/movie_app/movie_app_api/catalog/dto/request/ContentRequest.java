package com.movie_app.movie_app_api.catalog.dto.request;

import jakarta.validation.constraints.NotBlank;
import java.util.Set;
import java.util.UUID;

public record ContentRequest(
        @NotBlank(message = "Content type is required (MOVIE/SERIES)") String contentType,
        @NotBlank(message = "Title is required") String title,
        String description,
        Integer releaseYear,
        String maturityRating,
        Integer durationMinutes,
        String posterUrl,
        String videoUrl,
        String trailerUrl,
        Set<UUID> genreIds // Changed to UUID
) {}