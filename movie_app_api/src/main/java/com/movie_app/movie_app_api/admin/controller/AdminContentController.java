package com.movie_app.movie_app_api.admin.controller;

import com.movie_app.movie_app_api.catalog.dto.request.ContentRequest;
import com.movie_app.movie_app_api.catalog.dto.response.ContentResponse;
import com.movie_app.movie_app_api.catalog.service.ContentService;
import com.movie_app.movie_app_api.core.payload.ApiResponse;
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
@RequestMapping("/api/v1/admin/contents")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "[Admin] Content Catalog", description = "Admin endpoints for creating, updating, and deleting movies and series")
@SecurityRequirement(name = "bearerAuth")
public class AdminContentController {

    private final ContentService contentService;

    @Operation(summary = "Create content", description = "Creates a new movie or series entry.")
    @PostMapping
    public ResponseEntity<ApiResponse<ContentResponse>> createContent(@RequestBody @Valid ContentRequest request) {
        ContentResponse content = contentService.createContent(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Content created successfully", content));
    }

    @Operation(summary = "Update content", description = "Updates details of an existing movie or series.")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ContentResponse>> updateContent(
            @PathVariable UUID id,
            @RequestBody @Valid ContentRequest request) {
        ContentResponse content = contentService.updateContent(id, request);
        return ResponseEntity.ok(ApiResponse.success("Content updated successfully", content));
    }

    @Operation(summary = "Delete content", description = "Removes a movie or series and all its associated assets.")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteContent(@PathVariable UUID id) {
        contentService.deleteContent(id);
        return ResponseEntity.ok(ApiResponse.success("Content deleted successfully", null));
    }
}