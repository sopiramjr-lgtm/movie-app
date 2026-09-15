package com.movie_app.movie_app_api.catalog.dto.response;
import lombok.Builder;
import java.util.UUID;
@Builder public record CastMemberResponse(
        UUID id, UUID contentId, PersonResponse person, String role, String characterName) {}