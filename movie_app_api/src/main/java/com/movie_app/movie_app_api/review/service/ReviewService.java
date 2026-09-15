package com.movie_app.movie_app_api.review.service;

import com.movie_app.movie_app_api.review.dto.request.ReviewRequest;
import com.movie_app.movie_app_api.review.dto.response.ReviewResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface ReviewService {
    ReviewResponse addOrUpdateReview(String keycloakId, UUID profileId, ReviewRequest request);
    List<ReviewResponse> getReviewsForContent(UUID contentId);
    void deleteReview(String keycloakId, UUID profileId, UUID reviewId);

    // Administrative moderation methods
    Page<ReviewResponse> getAllReviews(Pageable pageable);
    void adminDeleteReview(UUID reviewId);
}