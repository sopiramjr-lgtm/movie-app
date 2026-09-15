package com.movie_app.movie_app_api.catalog.dto.response;
import lombok.Builder;
import java.util.List;
import java.util.UUID;
@Builder public record SeasonResponse(
        UUID id, UUID contentId, int seasonNumber, String title, List<EpisodeResponse> episodes) {}