package com.movie_app.movie_app_api.user.dto.request;

public record UpdateUserRequest(
        String displayName,
        String avatarUrl
) {}