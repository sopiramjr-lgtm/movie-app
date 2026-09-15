package com.movie_app.movie_app_api.catalog.controller;

import com.movie_app.movie_app_api.catalog.dto.response.GenreResponse;
import com.movie_app.movie_app_api.catalog.service.GenreService;
import com.movie_app.movie_app_api.core.payload.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/genres")
@RequiredArgsConstructor
@Tag(name = "[User] Genres", description = "Public endpoints for exploring film and TV series genres")
public class GenreController {

    private final GenreService genreService;

    @Operation(summary = "Get all genres", description = "Retrieves a list of all available genres in the system.")
    @GetMapping
    public ResponseEntity<ApiResponse<List<GenreResponse>>> getAllGenres() {
        List<GenreResponse> genres = genreService.getAllGenres();
        return ResponseEntity.ok(ApiResponse.success("Genres fetched successfully", genres));
    }
}