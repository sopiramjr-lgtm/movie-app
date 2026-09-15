package com.movie_app.movie_app_api.profile.dto.response;

import lombok.Builder;
import java.util.UUID;

@Builder
public record ProfileResponse(
        UUID id,
        String name,
        String avatarUrl,
        boolean isKids,
        String preferredLanguage
) {}