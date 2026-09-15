package com.movie_app.movie_app_api.history.controller;

import com.movie_app.movie_app_api.core.payload.ApiResponse;
import com.movie_app.movie_app_api.history.dto.request.HistoryRequest;
import com.movie_app.movie_app_api.history.dto.response.HistoryResponse;
import com.movie_app.movie_app_api.history.service.HistoryService;
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
@RequestMapping("/api/v1/profiles/{profileId}/history")
@RequiredArgsConstructor
@Tag(name = "[User] Watch History", description = "Endpoints for managing a profile's watch history and progress")
@SecurityRequirement(name = "bearerAuth")
public class HistoryController {

    private final HistoryService historyService;

    @Operation(summary = "Get profile watch history", description = "Retrieves the watch history for a specific profile.")
    @GetMapping
    public ResponseEntity<ApiResponse<List<HistoryResponse>>> getHistory(
            @Parameter(hidden = true) @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID profileId) {
        return ResponseEntity.ok(ApiResponse.success(historyService.getProfileHistory(jwt.getSubject(), profileId)));
    }

    @Operation(summary = "Save watch progress", description = "Updates or creates the watch progress (timestamp) for a specific movie or episode.")
    @PostMapping
    public ResponseEntity<ApiResponse<HistoryResponse>> saveProgress(
            @Parameter(hidden = true) @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID profileId,
            @RequestBody @Valid HistoryRequest request) {
        HistoryResponse response = historyService.saveProgress(jwt.getSubject(), profileId, request);
        return ResponseEntity.ok(ApiResponse.success("Progress saved", response));
    }

    @Operation(summary = "Clear profile history", description = "Deletes all watch history records for a specific profile.")
    @DeleteMapping
    public ResponseEntity<ApiResponse<Void>> clearHistory(
            @Parameter(hidden = true) @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID profileId) {
        historyService.clearHistory(jwt.getSubject(), profileId);
        return ResponseEntity.ok(ApiResponse.success("Watch history cleared", null));
    }
}