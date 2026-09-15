package com.movie_app.movie_app_api.admin.controller;

import com.movie_app.movie_app_api.catalog.dto.request.GenreRequest;
import com.movie_app.movie_app_api.catalog.dto.response.GenreResponse;
import com.movie_app.movie_app_api.catalog.service.GenreService;
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
@RequestMapping("/api/v1/admin/genres")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "[Admin] Genres", description = "Admin endpoints for creating and managing content genres")
@SecurityRequirement(name = "bearerAuth")
public class AdminGenreController {

    private final GenreService genreService;

    @Operation(summary = "Create genre", description = "Adds a new genre to the platform.")
    @PostMapping
    public ResponseEntity<ApiResponse<GenreResponse>> createGenre(@RequestBody @Valid GenreRequest request) {
        GenreResponse genre = genreService.createGenre(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Genre created successfully", genre));
    }

    @Operation(summary = "Delete genre", description = "Removes a genre from the platform.")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteGenre(@PathVariable UUID id) {
        genreService.deleteGenre(id);
        return ResponseEntity.ok(ApiResponse.success("Genre deleted successfully", null));
    }
}