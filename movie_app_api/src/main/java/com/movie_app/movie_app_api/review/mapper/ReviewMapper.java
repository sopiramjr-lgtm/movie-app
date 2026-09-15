package com.movie_app.movie_app_api.review.mapper;

import com.movie_app.movie_app_api.review.dto.response.ReviewResponse;
import com.movie_app.movie_app_api.review.entity.Review;
import org.springframework.stereotype.Component;

@Component
public class ReviewMapper {
    public ReviewResponse toResponse(Review review) {
        if (review == null) return null;

        return ReviewResponse.builder()
                .id(review.getId())
                .profileId(review.getProfile().getId())
                .profileName(review.getProfile().getName())
                .profileAvatarUrl(review.getProfile().getAvatarUrl())
                .contentId(review.getContent().getId())
                .rating(review.getRating())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .updatedAt(review.getUpdatedAt())
                .build();
    }
}