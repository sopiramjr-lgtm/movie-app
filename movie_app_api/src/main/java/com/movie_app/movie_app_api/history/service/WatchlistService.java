package com.movie_app.movie_app_api.history.service;

import com.movie_app.movie_app_api.history.dto.request.WatchlistRequest;
import com.movie_app.movie_app_api.history.dto.response.WatchlistResponse;
import java.util.List;
import java.util.UUID;

public interface WatchlistService {
    WatchlistResponse addToWatchlist(String keycloakId, UUID profileId, WatchlistRequest request);
    List<WatchlistResponse> getWatchlist(String keycloakId, UUID profileId);
    void removeFromWatchlist(String keycloakId, UUID profileId, UUID contentId);
}