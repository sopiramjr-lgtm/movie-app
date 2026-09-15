package com.movie_app.movie_app_api.history.repository;

import com.movie_app.movie_app_api.history.entity.WatchHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface WatchHistoryRepository extends JpaRepository<WatchHistory, UUID> {
    List<WatchHistory> findAllByProfileIdOrderByLastWatchedAtDesc(UUID profileId);

    // Finds existing progress for a specific movie or episode
    Optional<WatchHistory> findByProfileIdAndContentIdAndEpisodeId(UUID profileId, UUID contentId, UUID episodeId);

    // Bulk delete for efficient clearHistory — avoids N+1 individual DELETE statements
    void deleteByProfileId(UUID profileId);
}