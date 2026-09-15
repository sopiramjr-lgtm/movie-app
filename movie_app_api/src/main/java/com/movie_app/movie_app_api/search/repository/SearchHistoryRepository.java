package com.movie_app.movie_app_api.search.repository;

import com.movie_app.movie_app_api.search.entity.SearchHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SearchHistoryRepository extends JpaRepository<SearchHistory, UUID> {
    List<SearchHistory> findByProfileIdOrderBySearchedAtDesc(UUID profileId);
    void deleteByProfileId(UUID profileId);
}