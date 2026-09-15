package com.movie_app.movie_app_api.catalog.dto.response;

import lombok.Builder;
import java.util.Set;
import java.util.UUID;

@Builder
public record ContentResponse(
        UUID id,
        String contentType,
        String title,
        String description,
        Integer releaseYear,
        String maturityRating,
        Integer durationMinutes,
        String posterUrl,
        String videoUrl,
        String trailerUrl,
        Double averageRating,
        Set<String> genres
) {}