package com.movie_app.movie_app_api.history.mapper;

import com.movie_app.movie_app_api.history.dto.response.HistoryResponse;
import com.movie_app.movie_app_api.history.entity.WatchHistory;
import org.springframework.stereotype.Component;

@Component
public class HistoryMapper {
    public HistoryResponse toResponse(WatchHistory history) {
        if (history == null) return null;

        return HistoryResponse.builder()
                .id(history.getId())
                .profileId(history.getProfile().getId())
                .contentId(history.getContent().getId())
                .contentTitle(history.getContent().getTitle())
                .episodeId(history.getEpisode() != null ? history.getEpisode().getId() : null)
                .episodeTitle(history.getEpisode() != null ? history.getEpisode().getTitle() : null)
                .progressSeconds(history.getProgressSeconds())
                .completed(history.isCompleted())
                .lastWatchedAt(history.getLastWatchedAt())
                .build();
    }
}