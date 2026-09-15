package com.movie_app.movie_app_api.streaming.controller;

import com.movie_app.movie_app_api.core.payload.ApiResponse;
import com.movie_app.movie_app_api.streaming.dto.response.ContentAssetResponse;
import com.movie_app.movie_app_api.streaming.service.ContentAssetService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/content-assets")
@RequiredArgsConstructor
@Tag(name = "[User] Media Assets", description = "Endpoints for retrieving playable video files, audio tracks, and subtitles linked to content")
@SecurityRequirement(name = "bearerAuth")
public class ContentAssetController {

    private final ContentAssetService assetService;

    @Operation(summary = "Get assets by content", description = "Retrieves all media assets attached to a specific movie or series.")
    @GetMapping("/content/{contentId}")
    public ResponseEntity<ApiResponse<List<ContentAssetResponse>>> getAssetsByContent(@PathVariable UUID contentId) {
        return ResponseEntity.ok(ApiResponse.success(assetService.getAssetsByContentId(contentId)));
    }
}