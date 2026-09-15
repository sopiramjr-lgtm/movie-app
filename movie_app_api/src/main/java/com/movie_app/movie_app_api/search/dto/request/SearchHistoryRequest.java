package com.movie_app.movie_app_api.search.dto.request;

import jakarta.validation.constraints.NotBlank;

public record SearchHistoryRequest(
        @NotBlank(message = "Search query cannot be blank") String query
) {}