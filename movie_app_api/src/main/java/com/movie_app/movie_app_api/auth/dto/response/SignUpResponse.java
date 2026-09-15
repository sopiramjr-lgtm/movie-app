package com.movie_app.movie_app_api.auth.dto.response;

import lombok.Builder;

@Builder
public record SignUpResponse(
        String id,
        String name,
        String email
) {}