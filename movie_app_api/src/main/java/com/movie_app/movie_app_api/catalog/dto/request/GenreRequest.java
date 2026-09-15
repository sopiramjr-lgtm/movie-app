package com.movie_app.movie_app_api.catalog.dto.request;
import jakarta.validation.constraints.NotBlank;

public record GenreRequest(
        @NotBlank(message = "Genre name is required")
        String name) {
}