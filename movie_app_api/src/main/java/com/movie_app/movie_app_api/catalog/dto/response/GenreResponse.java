package com.movie_app.movie_app_api.catalog.dto.response;
import lombok.Builder;
import java.util.UUID;

@Builder
public record GenreResponse(
        UUID id,
        String name) {}