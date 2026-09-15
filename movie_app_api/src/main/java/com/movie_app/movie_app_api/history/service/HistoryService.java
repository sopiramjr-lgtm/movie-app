package com.movie_app.movie_app_api.history.service;

import com.movie_app.movie_app_api.history.dto.request.HistoryRequest;
import com.movie_app.movie_app_api.history.dto.response.HistoryResponse;

import java.util.List;
import java.util.UUID;

public interface HistoryService {
    HistoryResponse saveProgress(String keycloakId, UUID profileId, HistoryRequest request);
    List<HistoryResponse> getProfileHistory(String keycloakId, UUID profileId);
    void clearHistory(String keycloakId, UUID profileId);
}