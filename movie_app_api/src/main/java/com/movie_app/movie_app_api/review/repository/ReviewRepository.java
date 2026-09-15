package com.movie_app.movie_app_api.review.repository;

import com.movie_app.movie_app_api.review.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ReviewRepository extends JpaRepository<Review, UUID> {
    List<Review> findByContentIdOrderByCreatedAtDesc(UUID contentId);

    // Check if a profile already reviewed a specific movie
    Optional<Review> findByProfileIdAndContentId(UUID profileId, UUID contentId);

    // Automatically calculate the new average rating
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.content.id = :contentId")
    Double getAverageRatingForContent(@Param("contentId") UUID contentId);
}