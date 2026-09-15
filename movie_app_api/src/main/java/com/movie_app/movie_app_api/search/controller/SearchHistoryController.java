package com.movie_app.movie_app_api.search.controller;

import com.movie_app.movie_app_api.core.payload.ApiResponse;
import com.movie_app.movie_app_api.search.dto.request.SearchHistoryRequest;
import com.movie_app.movie_app_api.search.dto.response.SearchHistoryResponse;
import com.movie_app.movie_app_api.search.service.SearchHistoryService;
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
@RequestMapping("/api/v1/profiles/{profileId}/search-history")
@RequiredArgsConstructor
@Tag(name = "[User] Search History", description = "Endpoints for managing recent search terms per profile")
@SecurityRequirement(name = "bearerAuth")
public class SearchHistoryController {

    private final SearchHistoryService searchHistoryService;

    @Operation(summary = "Get search history", description = "Retrieves recent searches made by this profile.")
    @GetMapping
    public ResponseEntity<ApiResponse<List<SearchHistoryResponse>>> getSearchHistory(
            @Parameter(hidden = true) @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID profileId) {
        List<SearchHistoryResponse> history = searchHistoryService.getProfileSearchHistory(jwt.getSubject(), profileId);
        return ResponseEntity.ok(ApiResponse.success("Search history retrieved successfully", history));
    }

    @Operation(summary = "Save search query", description = "Saves a new search query to the profile's history.")
    @PostMapping
    public ResponseEntity<ApiResponse<SearchHistoryResponse>> saveSearch(
            @Parameter(hidden = true) @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID profileId,
            @RequestBody @Valid SearchHistoryRequest request) {
        SearchHistoryResponse response = searchHistoryService.saveSearch(jwt.getSubject(), profileId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Search saved successfully", response));
    }

    @Operation(summary = "Delete specific search item", description = "Removes a specific search term from the history.")
    @DeleteMapping("/{searchId}")
    public ResponseEntity<ApiResponse<Void>> deleteSearchItem(
            @Parameter(hidden = true) @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID profileId,
            @PathVariable UUID searchId) {
        searchHistoryService.deleteSearchItem(jwt.getSubject(), profileId, searchId);
        return ResponseEntity.ok(ApiResponse.success("Search item deleted successfully", null));
    }

    @Operation(summary = "Clear all search history", description = "Wipes the entire search history for the profile.")
    @DeleteMapping
    public ResponseEntity<ApiResponse<Void>> clearSearchHistory(
            @Parameter(hidden = true) @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID profileId) {
        searchHistoryService.clearProfileSearchHistory(jwt.getSubject(), profileId);
        return ResponseEntity.ok(ApiResponse.success("Search history cleared successfully", null));
    }
}