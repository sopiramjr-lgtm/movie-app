package com.movie_app.movie_app_api.review.dto.request;


import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record ReviewRequest(
        @NotNull(message = "Content ID is required") UUID contentId,
        @Min(value = 1, message = "Rating must be at least 1")
        @Max(value = 10, message = "Rating cannot exceed 10")
        Integer rating,
        String comment
) {}
