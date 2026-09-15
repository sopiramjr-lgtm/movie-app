package com.movie_app.movie_app_api.admin.controller;

import com.movie_app.movie_app_api.catalog.dto.request.*;
import com.movie_app.movie_app_api.catalog.dto.response.*;
import com.movie_app.movie_app_api.catalog.service.CatalogSupplementalService;
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

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/catalog")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "[Admin] Seasons, Episodes & Cast", description = "Administrative endpoints for managing TV series seasons, episodes, persons, and cast assignments")
@SecurityRequirement(name = "bearerAuth")
public class AdminCatalogSupplementalController {

    private final CatalogSupplementalService service;

    @Operation(summary = "Create a person (actor/director)", description = "Adds a new person to the catalog.")
    @PostMapping("/persons")
    public ResponseEntity<ApiResponse<PersonResponse>> createPerson(@RequestBody @Valid PersonRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(service.createPerson(request)));
    }

    @Operation(summary = "Delete a person", description = "Removes a person from the catalog.")
    @DeleteMapping("/persons/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePerson(@PathVariable UUID id) {
        service.deleteEntity(id, "PERSON");
        return ResponseEntity.ok(ApiResponse.success("Person deleted successfully", null));
    }

    @Operation(summary = "Get seasons for content", description = "Retrieves all seasons for a specific series.")
    @GetMapping("/contents/{contentId}/seasons")
    public ResponseEntity<ApiResponse<List<SeasonResponse>>> getSeasonsByContent(@PathVariable UUID contentId) {
        return ResponseEntity.ok(ApiResponse.success(service.getSeasonsByContentId(contentId)));
    }

    @Operation(summary = "Create a season", description = "Adds a new season to an existing TV series.")
    @PostMapping("/seasons")
    public ResponseEntity<ApiResponse<SeasonResponse>> createSeason(@RequestBody @Valid SeasonRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(service.createSeason(request)));
    }

    @Operation(summary = "Delete a season", description = "Removes a season and all its episodes.")
    @DeleteMapping("/seasons/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSeason(@PathVariable UUID id) {
        service.deleteEntity(id, "SEASON");
        return ResponseEntity.ok(ApiResponse.success("Season deleted successfully", null));
    }

    @Operation(summary = "Get episodes for season", description = "Retrieves all episodes belonging to a specific season.")
    @GetMapping("/seasons/{seasonId}/episodes")
    public ResponseEntity<ApiResponse<List<EpisodeResponse>>> getEpisodesBySeason(@PathVariable UUID seasonId) {
        return ResponseEntity.ok(ApiResponse.success(service.getEpisodesBySeasonId(seasonId)));
    }

    @Operation(summary = "Create an episode", description = "Adds a new episode to an existing season.")
    @PostMapping("/episodes")
    public ResponseEntity<ApiResponse<EpisodeResponse>> createEpisode(@RequestBody @Valid EpisodeRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(service.createEpisode(request)));
    }

    @Operation(summary = "Delete an episode", description = "Removes a specific episode.")
    @DeleteMapping("/episodes/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteEpisode(@PathVariable UUID id) {
        service.deleteEntity(id, "EPISODE");
        return ResponseEntity.ok(ApiResponse.success("Episode deleted successfully", null));
    }

    @Operation(summary = "Add a cast member", description = "Links a person to a movie or series.")
    @PostMapping("/cast-members")
    public ResponseEntity<ApiResponse<CastMemberResponse>> addCastMember(@RequestBody @Valid CastMemberRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(service.addCastMember(request)));
    }

    @Operation(summary = "Remove a cast member", description = "Unlinks a cast member from a content item.")
    @DeleteMapping("/cast-members/{id}")
    public ResponseEntity<ApiResponse<Void>> removeCastMember(@PathVariable UUID id) {
        service.deleteEntity(id, "CAST");
        return ResponseEntity.ok(ApiResponse.success("Cast member removed successfully", null));
    }
}