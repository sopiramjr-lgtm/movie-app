package com.movie_app.movie_app_api.profile.dto.request;

import jakarta.validation.constraints.NotBlank;

public record ProfileRequest(
        @NotBlank(message = "Profile name is required") String name,
        String avatarUrl,
        boolean isKids,
        String preferredLanguage
) {}