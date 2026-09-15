package com.movie_app.movie_app_api.search.service;

import com.movie_app.movie_app_api.search.dto.request.SearchHistoryRequest;
import com.movie_app.movie_app_api.search.dto.response.SearchHistoryResponse;

import java.util.List;
import java.util.UUID;

public interface SearchHistoryService {
    SearchHistoryResponse saveSearch(String keycloakId, UUID profileId, SearchHistoryRequest request);
    List<SearchHistoryResponse> getProfileSearchHistory(String keycloakId, UUID profileId);
    void clearProfileSearchHistory(String keycloakId, UUID profileId);
    void deleteSearchItem(String keycloakId, UUID profileId, UUID searchId);
}