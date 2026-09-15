package com.movie_app.movie_app_api.catalog.service.impl;

import com.movie_app.movie_app_api.catalog.dto.response.ContentResponse;
import com.movie_app.movie_app_api.catalog.dto.response.HomepageResponse;
import com.movie_app.movie_app_api.catalog.mapper.ContentMapper;
import com.movie_app.movie_app_api.catalog.repository.ContentRepository;
import com.movie_app.movie_app_api.core.exception.ForbiddenException;
import com.movie_app.movie_app_api.core.exception.ResourceNotFoundException;
import com.movie_app.movie_app_api.history.entity.Watchlist;
import com.movie_app.movie_app_api.history.repository.WatchHistoryRepository;
import com.movie_app.movie_app_api.history.repository.WatchlistRepository;
import com.movie_app.movie_app_api.profile.entity.Profile;
import com.movie_app.movie_app_api.profile.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class HomepageService {

    private final ContentRepository contentRepository;
    private final WatchHistoryRepository watchHistoryRepository;
    private final WatchlistRepository watchlistRepository;
    private final ProfileRepository profileRepository;
    private final ContentMapper contentMapper;

    @Transactional(readOnly = true)
    public HomepageResponse getHomepageData(String keycloakId, UUID profileId) {
        // Validate access
        Profile profile = profileRepository.findById(profileId)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found"));
        if (!profile.getUser().getKeycloakId().equals(keycloakId)) {
            throw new ForbiddenException("Access denied");
        }

        // 1. Continue Watching (Unfinished watch history)
        List<ContentResponse> continueWatching = watchHistoryRepository
                .findAllByProfileIdOrderByLastWatchedAtDesc(profileId).stream()
                .filter(history -> !history.isCompleted())
                .map(history -> contentMapper.toResponse(history.getContent()))
                .limit(10)
                .toList();

        // 2. My List
        List<ContentResponse> myList = watchlistRepository
                .findByProfileIdOrderByAddedAtDesc(profileId).stream()
                .map(Watchlist::getContent)
                .map(contentMapper::toResponse)
                .limit(10)
                .toList();

        // 3. New Releases
        List<ContentResponse> newReleases = contentRepository
                .findTop10ByOrderByCreatedAtDesc().stream()
                .map(contentMapper::toResponse)
                .toList();

        // 4. Trending Now
        List<ContentResponse> trendingNow = contentRepository
                .findTop10ByOrderByAverageRatingDesc().stream()
                .map(contentMapper::toResponse)
                .toList();

        return HomepageResponse.builder()
                .continueWatching(continueWatching)
                .myList(myList)
                .newReleases(newReleases)
                .trendingNow(trendingNow)
                .build();
    }
}