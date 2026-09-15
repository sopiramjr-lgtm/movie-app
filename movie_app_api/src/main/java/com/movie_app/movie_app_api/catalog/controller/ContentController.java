package com.movie_app.movie_app_api.catalog.controller;

import com.movie_app.movie_app_api.catalog.dto.response.ContentResponse;
import com.movie_app.movie_app_api.catalog.service.ContentService;
import com.movie_app.movie_app_api.core.payload.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/contents")
@RequiredArgsConstructor
@Tag(name = "[User] Content Catalog", description = "Public endpoints for browsing movies and TV series catalog")
public class ContentController {

    private final ContentService contentService;

    @Operation(summary = "Browse catalog", description = "Retrieves paginated content. Optionally filter by type (MOVIE/SERIES).")
    @GetMapping
    public ResponseEntity<ApiResponse<Page<ContentResponse>>> getAllContent(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String type) {
        Page<ContentResponse> contents = contentService.getAllContent(page, size, type);
        return ResponseEntity.ok(ApiResponse.success(contents));
    }

    @Operation(summary = "Get content details", description = "Retrieves details of a specific movie or series by ID.")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ContentResponse>> getContentById(@PathVariable UUID id) {
        ContentResponse content = contentService.getContentById(id);
        return ResponseEntity.ok(ApiResponse.success(content));
    }
}