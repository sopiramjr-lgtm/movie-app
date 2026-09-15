package com.movie_app.movie_app_api.review.controller;

import com.movie_app.movie_app_api.review.dto.request.ReviewRequest;
import com.movie_app.movie_app_api.review.dto.response.ReviewResponse;
import com.movie_app.movie_app_api.review.service.ReviewService;
import com.movie_app.movie_app_api.core.payload.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Tag(name = "[User] Reviews & Ratings", description = "Endpoints for viewing and submitting content reviews")
@SecurityRequirement(name = "bearerAuth")
public class ReviewController {

    private final ReviewService reviewService;

    @Operation(summary = "Get content reviews", description = "Retrieves all reviews submitted for a specific movie or series.")
    @GetMapping("/contents/{contentId}/reviews")
    public ResponseEntity<ApiResponse<List<ReviewResponse>>> getReviews(@PathVariable UUID contentId) {
        return ResponseEntity.ok(ApiResponse.success(reviewService.getReviewsForContent(contentId)));
    }

    @Operation(summary = "Add or update review", description = "Submits a new review or updates an existing one for the profile.")
    @PostMapping("/profiles/{profileId}/reviews")
    public ResponseEntity<ApiResponse<ReviewResponse>> addReview(
            @Parameter(hidden = true) @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID profileId,
            @RequestBody @Valid ReviewRequest request) {

        ReviewResponse review = reviewService.addOrUpdateReview(jwt.getSubject(), profileId, request);
        return ResponseEntity.ok(ApiResponse.success("Review saved successfully", review));
    }

    @Operation(summary = "Delete review", description = "Deletes a review authored by this profile.")
    @DeleteMapping("/profiles/{profileId}/reviews/{reviewId}")
    public ResponseEntity<ApiResponse<Void>> deleteReview(
            @Parameter(hidden = true) @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID profileId,
            @PathVariable UUID reviewId) {

        reviewService.deleteReview(jwt.getSubject(), profileId, reviewId);
        return ResponseEntity.ok(ApiResponse.success("Review deleted successfully", null));
    }
}