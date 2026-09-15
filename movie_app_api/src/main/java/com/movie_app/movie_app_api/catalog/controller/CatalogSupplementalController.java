package com.movie_app.movie_app_api.catalog.controller;

import com.movie_app.movie_app_api.catalog.dto.response.CastMemberResponse;
import com.movie_app.movie_app_api.catalog.dto.response.EpisodeResponse;
import com.movie_app.movie_app_api.catalog.dto.response.PersonResponse;
import com.movie_app.movie_app_api.catalog.dto.response.SeasonResponse;
import com.movie_app.movie_app_api.catalog.service.CatalogSupplementalService;
import com.movie_app.movie_app_api.core.payload.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/catalog")
@RequiredArgsConstructor
@Tag(name = "[User] Cast & Supplemental", description = "Public endpoints for browsing cast members, persons, seasons, and episodes")
public class CatalogSupplementalController {

    private final CatalogSupplementalService service;

    @Operation(summary = "Get all persons", description = "Retrieves a list of all actors, directors, and creators.")
    @GetMapping("/persons")
    public ResponseEntity<ApiResponse<List<PersonResponse>>> getAllPersons() {
        return ResponseEntity.ok(ApiResponse.success(service.getAllPersons()));
    }

    @Operation(summary = "Get cast for content", description = "Retrieves all cast members associated with a specific movie or series.")
    @GetMapping("/contents/{contentId}/cast")
    public ResponseEntity<ApiResponse<List<CastMemberResponse>>> getCastForContent(@PathVariable UUID contentId) {
        return ResponseEntity.ok(ApiResponse.success(service.getCastByContentId(contentId)));
    }

    @Operation(summary = "Get seasons for series", description = "Retrieves all seasons for a specific TV series.")
    @GetMapping("/contents/{contentId}/seasons")
    public ResponseEntity<ApiResponse<List<SeasonResponse>>> getSeasonsForContent(@PathVariable UUID contentId) {
        return ResponseEntity.ok(ApiResponse.success(service.getSeasonsByContentId(contentId)));
    }

    @Operation(summary = "Get episodes for season", description = "Retrieves all episodes in a given season.")
    @GetMapping("/seasons/{seasonId}/episodes")
    public ResponseEntity<ApiResponse<List<EpisodeResponse>>> getEpisodesForSeason(@PathVariable UUID seasonId) {
        return ResponseEntity.ok(ApiResponse.success(service.getEpisodesBySeasonId(seasonId)));
    }
}