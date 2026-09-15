package com.movie_app.movie_app_api.admin.controller;

import com.movie_app.movie_app_api.core.payload.ApiResponse;
import com.movie_app.movie_app_api.streaming.dto.request.ContentAssetRequest;
import com.movie_app.movie_app_api.streaming.dto.response.ContentAssetResponse;
import com.movie_app.movie_app_api.streaming.service.ContentAssetService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/content-assets")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "[Admin] Media Assets", description = "Admin endpoints for managing video files, audio tracks, and subtitles")
@SecurityRequirement(name = "bearerAuth")
public class AdminContentAssetController {

    private final ContentAssetService assetService;

    @Operation(summary = "Add an asset", description = "Uploads metadata/URL for a video, audio, or subtitle track.")
    @PostMapping
    public ResponseEntity<ApiResponse<ContentAssetResponse>> addAsset(@RequestBody @Valid ContentAssetRequest request) {
        ContentAssetResponse response = assetService.addAsset(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Asset added successfully", response));
    }

    @Operation(summary = "Delete an asset", description = "Removes a media asset from the platform.")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAsset(@PathVariable UUID id) {
        assetService.deleteAsset(id);
        return ResponseEntity.ok(ApiResponse.success("Asset deleted successfully", null));
    }
}