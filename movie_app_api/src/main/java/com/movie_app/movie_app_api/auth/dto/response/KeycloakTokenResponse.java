package com.movie_app.movie_app_api.auth.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;

@Builder
public record KeycloakTokenResponse(
        @JsonProperty("access_token")
        String accessToken,

        @JsonProperty("refresh_token")
        String refreshToken,

        @JsonProperty("expires_in")
        Long expiresIn,

        @JsonProperty("refresh_expires_in")
        Long refreshExpiresIn,

        @JsonProperty("token_type")
        String tokenType
) {}