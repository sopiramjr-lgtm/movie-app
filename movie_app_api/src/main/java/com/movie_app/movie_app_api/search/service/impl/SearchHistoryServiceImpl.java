package com.movie_app.movie_app_api.search.service.impl;

import com.movie_app.movie_app_api.core.exception.ForbiddenException;
import com.movie_app.movie_app_api.core.exception.ResourceNotFoundException;
import com.movie_app.movie_app_api.profile.entity.Profile;
import com.movie_app.movie_app_api.profile.repository.ProfileRepository;
import com.movie_app.movie_app_api.search.dto.request.SearchHistoryRequest;
import com.movie_app.movie_app_api.search.dto.response.SearchHistoryResponse;
import com.movie_app.movie_app_api.search.entity.SearchHistory;
import com.movie_app.movie_app_api.search.mapper.SearchHistoryMapper;
import com.movie_app.movie_app_api.search.repository.SearchHistoryRepository;
import com.movie_app.movie_app_api.search.service.SearchHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SearchHistoryServiceImpl implements SearchHistoryService {

    private final SearchHistoryRepository searchHistoryRepository;
    private final ProfileRepository profileRepository;
    private final SearchHistoryMapper mapper;

    @Override
    @Transactional
    public SearchHistoryResponse saveSearch(String keycloakId, UUID profileId, SearchHistoryRequest request) {
        Profile profile = validateProfileOwnership(keycloakId, profileId);

        SearchHistory searchHistory = SearchHistory.builder()
                .profile(profile)
                .query(request.query())
                .searchedAt(LocalDateTime.now())
                .build();

        return mapper.toResponse(searchHistoryRepository.save(searchHistory));
    }

    @Override
    @Transactional(readOnly = true)
    public List<SearchHistoryResponse> getProfileSearchHistory(String keycloakId, UUID profileId) {
        validateProfileOwnership(keycloakId, profileId);
        return searchHistoryRepository.findByProfileIdOrderBySearchedAtDesc(profileId).stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public void clearProfileSearchHistory(String keycloakId, UUID profileId) {
        validateProfileOwnership(keycloakId, profileId);
        searchHistoryRepository.deleteByProfileId(profileId);
    }

    @Override
    @Transactional
    public void deleteSearchItem(String keycloakId, UUID profileId, UUID searchId) {
        validateProfileOwnership(keycloakId, profileId);
        SearchHistory searchHistory = searchHistoryRepository.findById(searchId)
                .orElseThrow(() -> new ResourceNotFoundException("Search history item not found"));

        if (!searchHistory.getProfile().getId().equals(profileId)) {
            throw new ForbiddenException("Unauthorized action");
        }

        searchHistoryRepository.delete(searchHistory);
    }

    private Profile validateProfileOwnership(String keycloakId, UUID profileId) {
        Profile profile = profileRepository.findById(profileId)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found"));
        if (!profile.getUser().getKeycloakId().equals(keycloakId)) {
            throw new ForbiddenException("Access denied to this profile");
        }
        return profile;
    }
}