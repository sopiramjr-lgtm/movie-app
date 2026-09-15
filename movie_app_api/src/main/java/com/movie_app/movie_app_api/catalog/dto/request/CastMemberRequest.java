package com.movie_app.movie_app_api.catalog.dto.request;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;
public record CastMemberRequest(
        @NotNull UUID contentId, @NotNull UUID personId,
        @NotBlank String role, String characterName) {}