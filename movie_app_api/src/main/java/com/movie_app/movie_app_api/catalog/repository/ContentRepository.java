package com.movie_app.movie_app_api.catalog.repository;

import com.movie_app.movie_app_api.catalog.entity.Content;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ContentRepository extends JpaRepository<Content, UUID> {
    Page<Content> findByContentType(String contentType, Pageable pageable);
    Page<Content> findByTitleContainingIgnoreCase(String title, Pageable pageable);

    // Add to ContentRepository.java
    List<Content> findTop10ByOrderByCreatedAtDesc(); // New Releases
    List<Content> findTop10ByOrderByAverageRatingDesc(); // Trending/Top Rated

    long countByContentType(String contentType);
}