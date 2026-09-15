package com.movie_app.movie_app_api.history.repository;

import com.movie_app.movie_app_api.history.entity.Watchlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface WatchlistRepository extends JpaRepository<Watchlist, UUID> {
    List<Watchlist> findByProfileIdOrderByAddedAtDesc(UUID profileId);
    boolean existsByProfileIdAndContentId(UUID profileId, UUID contentId);
    Optional<Watchlist> findByProfileIdAndContentId(UUID profileId, UUID contentId);
}