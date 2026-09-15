package com.movie_app.movie_app_api.catalog.controller;

import com.movie_app.movie_app_api.catalog.dto.response.HomepageResponse;
import com.movie_app.movie_app_api.catalog.service.impl.HomepageService;
import com.movie_app.movie_app_api.core.payload.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/home")
@RequiredArgsConstructor
@Tag(name = "[User] Home Feed", description = "Consolidated endpoints aggregating featured, trending, and personalized content")
@SecurityRequirement(name = "bearerAuth")
public class HomepageController {

    private final HomepageService homepageService;

    @Operation(summary = "Get homepage data", description = "Returns combined lists of Continue Watching, Trending, New Releases, and My List in a single response.")
    @GetMapping
    public ResponseEntity<ApiResponse<HomepageResponse>> getHomepage(
            @Parameter(hidden = true) @AuthenticationPrincipal Jwt jwt,
            @RequestParam UUID profileId) {
        HomepageResponse data = homepageService.getHomepageData(jwt.getSubject(), profileId);
        return ResponseEntity.ok(ApiResponse.success("Homepage data retrieved successfully", data));
    }
}