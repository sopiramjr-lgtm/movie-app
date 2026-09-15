package com.movie_app.movie_app_api.catalog.dto.request;
import jakarta.validation.constraints.NotBlank;
public record PersonRequest(@NotBlank String name, String profileImageUrl, String biography) {}