package com.movie_app.movie_app_api.review.service.impl;

import com.movie_app.movie_app_api.catalog.entity.Content;
import com.movie_app.movie_app_api.catalog.repository.ContentRepository;
import com.movie_app.movie_app_api.review.dto.request.ReviewRequest;
import com.movie_app.movie_app_api.review.dto.response.ReviewResponse;
import com.movie_app.movie_app_api.review.entity.Review;
import com.movie_app.movie_app_api.review.mapper.ReviewMapper;
import com.movie_app.movie_app_api.review.repository.ReviewRepository;
import com.movie_app.movie_app_api.review.service.ReviewService;
import com.movie_app.movie_app_api.core.exception.ForbiddenException;
import com.movie_app.movie_app_api.core.exception.ResourceNotFoundException;
import com.movie_app.movie_app_api.profile.entity.Profile;
import com.movie_app.movie_app_api.profile.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProfileRepository profileRepository;
    private final ContentRepository contentRepository;
    private final ReviewMapper reviewMapper;

    @Override
    @Transactional
    public ReviewResponse addOrUpdateReview(String keycloakId, UUID profileId, ReviewRequest request) {
        Profile profile = validateProfileOwnership(keycloakId, profileId);
        Content content = contentRepository.findById(request.contentId())
                .orElseThrow(() -> new ResourceNotFoundException("Content not found"));

        // Update if exists, otherwise create new
        Review review = reviewRepository.findByProfileIdAndContentId(profileId, request.contentId())
                .orElse(Review.builder()
                        .profile(profile)
                        .content(content)
                        .createdAt(LocalDateTime.now())
                        .build());

        review.setRating(request.rating());
        review.setComment(request.comment());
        review.setUpdatedAt(LocalDateTime.now());

        Review savedReview = reviewRepository.save(review);

        updateContentAverageRating(content);

        return reviewMapper.toResponse(savedReview);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReviewResponse> getReviewsForContent(UUID contentId) {
        return reviewRepository.findByContentIdOrderByCreatedAtDesc(contentId).stream()
                .map(reviewMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public void deleteReview(String keycloakId, UUID profileId, UUID reviewId) {
        validateProfileOwnership(keycloakId, profileId);

        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));

        if (!review.getProfile().getId().equals(profileId)) {
            throw new ForbiddenException("You cannot delete someone else's review");
        }

        Content content = review.getContent();
        reviewRepository.delete(review);

        // Recalculate average after deletion
        updateContentAverageRating(content);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ReviewResponse> getAllReviews(Pageable pageable) {
        return reviewRepository.findAll(pageable)
                .map(reviewMapper::toResponse);
    }

    @Override
    @Transactional
    public void adminDeleteReview(UUID reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));

        Content content = review.getContent();
        reviewRepository.delete(review);

        // Recalculate average after deletion
        updateContentAverageRating(content);
    }

    // --- Helper Methods ---

    private Profile validateProfileOwnership(String keycloakId, UUID profileId) {
        Profile profile = profileRepository.findById(profileId)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found"));
        if (!profile.getUser().getKeycloakId().equals(keycloakId)) {
            throw new ForbiddenException("Access denied to this profile");
        }
        return profile;
    }

    private void updateContentAverageRating(Content content) {
        Double newAvg = reviewRepository.getAverageRatingForContent(content.getId());
        content.setAverageRating(newAvg != null ? Math.round(newAvg * 10.0) / 10.0 : 0.0); // Rounds to 1 decimal place
        contentRepository.save(content);
    }
}