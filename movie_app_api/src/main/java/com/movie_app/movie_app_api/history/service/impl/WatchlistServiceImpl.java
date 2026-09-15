package com.movie_app.movie_app_api.history.service.impl;

import com.movie_app.movie_app_api.catalog.entity.Content;
import com.movie_app.movie_app_api.catalog.repository.ContentRepository;
import com.movie_app.movie_app_api.core.exception.BadRequestException;
import com.movie_app.movie_app_api.core.exception.ForbiddenException;
import com.movie_app.movie_app_api.core.exception.ResourceNotFoundException;
import com.movie_app.movie_app_api.history.dto.request.WatchlistRequest;
import com.movie_app.movie_app_api.history.dto.response.WatchlistResponse;
import com.movie_app.movie_app_api.history.entity.Watchlist;
import com.movie_app.movie_app_api.history.repository.WatchlistRepository;
import com.movie_app.movie_app_api.history.service.WatchlistService;
import com.movie_app.movie_app_api.profile.entity.Profile;
import com.movie_app.movie_app_api.profile.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class WatchlistServiceImpl implements WatchlistService {

    private final WatchlistRepository watchlistRepository;
    private final ProfileRepository profileRepository;
    private final ContentRepository contentRepository;

    @Override
    @Transactional
    public WatchlistResponse addToWatchlist(String keycloakId, UUID profileId, WatchlistRequest request) {
        Profile profile = validateProfileOwnership(keycloakId, profileId);
        Content content = contentRepository.findById(request.contentId())
                .orElseThrow(() -> new ResourceNotFoundException("Content not found"));

        if (watchlistRepository.existsByProfileIdAndContentId(profileId, request.contentId())) {
            throw new BadRequestException("Content is already in your watchlist");
        }

        Watchlist watchlist = Watchlist.builder()
                .profile(profile)
                .content(content)
                .addedAt(LocalDateTime.now())
                .build();

        watchlist = watchlistRepository.save(watchlist);

        return mapToResponse(watchlist);
    }

    @Override
    @Transactional(readOnly = true)
    public List<WatchlistResponse> getWatchlist(String keycloakId, UUID profileId) {
        validateProfileOwnership(keycloakId, profileId);
        return watchlistRepository.findByProfileIdOrderByAddedAtDesc(profileId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional
    public void removeFromWatchlist(String keycloakId, UUID profileId, UUID contentId) {
        validateProfileOwnership(keycloakId, profileId);
        Watchlist watchlist = watchlistRepository.findByProfileIdAndContentId(profileId, contentId)
                .orElseThrow(() -> new ResourceNotFoundException("Content not found in watchlist"));

        watchlistRepository.delete(watchlist);
    }

    private Profile validateProfileOwnership(String keycloakId, UUID profileId) {
        Profile profile = profileRepository.findById(profileId)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found"));
        if (!profile.getUser().getKeycloakId().equals(keycloakId)) {
            throw new ForbiddenException("Access denied to this profile");
        }
        return profile;
    }

    private WatchlistResponse mapToResponse(Watchlist w) {
        return WatchlistResponse.builder()
                .id(w.getId())
                .profileId(w.getProfile().getId())
                .contentId(w.getContent().getId())
                .contentTitle(w.getContent().getTitle())
                .posterUrl(w.getContent().getPosterUrl())
                .addedAt(w.getAddedAt())
                .build();
    }
}