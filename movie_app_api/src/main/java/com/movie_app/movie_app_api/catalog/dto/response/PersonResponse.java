package com.movie_app.movie_app_api.catalog.dto.response;
import lombok.Builder;
import java.util.UUID;
@Builder public record PersonResponse(UUID id, String name, String profileImageUrl, String biography) {}