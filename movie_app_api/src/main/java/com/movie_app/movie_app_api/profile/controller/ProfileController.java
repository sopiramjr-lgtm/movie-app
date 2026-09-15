package com.movie_app.movie_app_api.profile.controller;

import com.movie_app.movie_app_api.core.payload.ApiResponse;
import com.movie_app.movie_app_api.profile.dto.request.ProfileRequest;
import com.movie_app.movie_app_api.profile.dto.response.ProfileResponse;
import com.movie_app.movie_app_api.profile.service.ProfileService;
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
@RequestMapping("/api/v1/profiles")
@RequiredArgsConstructor
@Tag(name = "[User] Profiles (Sub-accounts)", description = "Endpoints for managing sub-profiles (e.g. Kids, Parents) within a user account")
@SecurityRequirement(name = "bearerAuth")
public class ProfileController {

    private final ProfileService profileService;

    @Operation(summary = "Get user profiles", description = "Retrieves all profiles associated with the authenticated user.")
    @GetMapping
    public ResponseEntity<ApiResponse<List<ProfileResponse>>> getUserProfiles(
            @Parameter(hidden = true) @AuthenticationPrincipal Jwt jwt) {
        List<ProfileResponse> profiles = profileService.getUserProfiles(jwt.getSubject());
        return ResponseEntity.ok(ApiResponse.success("Profiles retrieved successfully", profiles));
    }

    @Operation(summary = "Create a profile", description = "Creates a new profile for the authenticated user account.")
    @PostMapping
    public ResponseEntity<ApiResponse<ProfileResponse>> createProfile(
            @Parameter(hidden = true) @AuthenticationPrincipal Jwt jwt,
            @RequestBody @Valid ProfileRequest request) {
        ProfileResponse profile = profileService.createProfile(jwt.getSubject(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Profile created successfully", profile));
    }

    @Operation(summary = "Update a profile", description = "Updates settings (name, avatar, kids mode) of a specific profile.")
    @PutMapping("/{profileId}")
    public ResponseEntity<ApiResponse<ProfileResponse>> updateProfile(
            @Parameter(hidden = true) @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID profileId,
            @RequestBody @Valid ProfileRequest request) {
        ProfileResponse profile = profileService.updateProfile(jwt.getSubject(), profileId, request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", profile));
    }

    @Operation(summary = "Delete a profile", description = "Removes a specific profile and all its associated history/watchlists.")
    @DeleteMapping("/{profileId}")
    public ResponseEntity<ApiResponse<Void>> deleteProfile(
            @Parameter(hidden = true) @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID profileId) {
        profileService.deleteProfile(jwt.getSubject(), profileId);
        return ResponseEntity.ok(ApiResponse.success("Profile deleted successfully", null));
    }
}