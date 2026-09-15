package com.movie_app.movie_app_api.history.service.impl;

import com.movie_app.movie_app_api.catalog.entity.Content;
import com.movie_app.movie_app_api.catalog.entity.Episode;
import com.movie_app.movie_app_api.catalog.repository.ContentRepository;
import com.movie_app.movie_app_api.catalog.repository.EpisodeRepository;
import com.movie_app.movie_app_api.core.exception.ForbiddenException;
import com.movie_app.movie_app_api.core.exception.ResourceNotFoundException;
import com.movie_app.movie_app_api.history.dto.request.HistoryRequest;
import com.movie_app.movie_app_api.history.dto.response.HistoryResponse;
import com.movie_app.movie_app_api.history.entity.WatchHistory;
import com.movie_app.movie_app_api.history.mapper.HistoryMapper;
import com.movie_app.movie_app_api.history.repository.WatchHistoryRepository;
import com.movie_app.movie_app_api.history.service.HistoryService;
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
public class HistoryServiceImpl implements HistoryService {

    private final WatchHistoryRepository historyRepository;
    private final ProfileRepository profileRepository;
    private final ContentRepository contentRepository;
    private final EpisodeRepository episodeRepository;
    private final HistoryMapper historyMapper;

    @Override
    @Transactional
    public HistoryResponse saveProgress(String keycloakId, UUID profileId, HistoryRequest request) {
        Profile profile = validateProfileOwnership(keycloakId, profileId);

        Content content = contentRepository.findById(request.contentId())
                .orElseThrow(() -> new ResourceNotFoundException("Content not found"));

        Episode episode = null;
        if (request.episodeId() != null) {
            episode = episodeRepository.findById(request.episodeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Episode not found"));
        }

        // Check if a history record already exists for this exact movie/episode to update it
        WatchHistory history = historyRepository
                .findByProfileIdAndContentIdAndEpisodeId(profileId, request.contentId(), request.episodeId())
                .orElse(WatchHistory.builder()
                        .profile(profile)
                        .content(content)
                        .episode(episode)
                        .build());

        history.setProgressSeconds(request.progressSeconds());
        history.setCompleted(request.completed());
        history.setLastWatchedAt(LocalDateTime.now());

        return historyMapper.toResponse(historyRepository.save(history));
    }

    @Override
    @Transactional(readOnly = true)
    public List<HistoryResponse> getProfileHistory(String keycloakId, UUID profileId) {
        validateProfileOwnership(keycloakId, profileId);
        return historyRepository.findAllByProfileIdOrderByLastWatchedAtDesc(profileId).stream()
                .map(historyMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public void clearHistory(String keycloakId, UUID profileId) {
        validateProfileOwnership(keycloakId, profileId);
        historyRepository.deleteByProfileId(profileId);
    }

    // Helper method to ensure users can only modify their own profiles' history
    private Profile validateProfileOwnership(String keycloakId, UUID profileId) {
        Profile profile = profileRepository.findById(profileId)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found"));
        if (!profile.getUser().getKeycloakId().equals(keycloakId)) {
            throw new ForbiddenException("Access denied to this profile");
        }
        return profile;
    }
}