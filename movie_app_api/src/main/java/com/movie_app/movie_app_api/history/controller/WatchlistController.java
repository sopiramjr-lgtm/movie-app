package com.movie_app.movie_app_api.history.controller;

import com.movie_app.movie_app_api.core.payload.ApiResponse;
import com.movie_app.movie_app_api.history.dto.request.WatchlistRequest;
import com.movie_app.movie_app_api.history.dto.response.WatchlistResponse;
import com.movie_app.movie_app_api.history.service.WatchlistService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/profiles/{profileId}/watchlist")
@RequiredArgsConstructor
@Tag(name = "[User] Watchlist", description = "Endpoints for managing a profile's saved content (My List)")
@SecurityRequirement(name = "bearerAuth")
public class WatchlistController {

    private final WatchlistService watchlistService;

    @Operation(summary = "Get watchlist", description = "Retrieves all content saved to the profile's watchlist.")
    @GetMapping
    public ResponseEntity<ApiResponse<List<WatchlistResponse>>> getWatchlist(
            @Parameter(hidden = true) @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID profileId) {
        return ResponseEntity.ok(ApiResponse.success(watchlistService.getWatchlist(jwt.getSubject(), profileId)));
    }

    @Operation(summary = "Add to watchlist", description = "Saves a movie or series to the profile's watchlist.")
    @PostMapping
    public ResponseEntity<ApiResponse<WatchlistResponse>> addToWatchlist(
            @Parameter(hidden = true) @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID profileId,
            @RequestBody @Valid WatchlistRequest request) {
        WatchlistResponse response = watchlistService.addToWatchlist(jwt.getSubject(), profileId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Added to watchlist", response));
    }

    @Operation(summary = "Remove from watchlist", description = "Removes a specific content item from the profile's watchlist.")
    @DeleteMapping("/{contentId}")
    public ResponseEntity<ApiResponse<Void>> removeFromWatchlist(
            @Parameter(hidden = true) @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID profileId,
            @PathVariable UUID contentId) {
        watchlistService.removeFromWatchlist(jwt.getSubject(), profileId, contentId);
        return ResponseEntity.ok(ApiResponse.success("Removed from watchlist", null));
    }
}