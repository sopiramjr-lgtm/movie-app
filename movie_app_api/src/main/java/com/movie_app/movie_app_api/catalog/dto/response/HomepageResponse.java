package com.movie_app.movie_app_api.catalog.dto.response;

import lombok.Builder;
import java.util.List;

@Builder
public record HomepageResponse(
        List<ContentResponse> continueWatching,
        List<ContentResponse> newReleases,
        List<ContentResponse> trendingNow,
        List<ContentResponse> myList
) {}