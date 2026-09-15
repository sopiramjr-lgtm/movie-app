package com.movie_app.movie_app_api.user.controller;

import com.movie_app.movie_app_api.core.payload.ApiResponse;
import com.movie_app.movie_app_api.user.dto.request.UpdateUserRequest;
import com.movie_app.movie_app_api.user.dto.response.UserResponse;
import com.movie_app.movie_app_api.user.dto.response.UserSummaryResponse;
import com.movie_app.movie_app_api.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Tag(name = "[User] Profile & Account", description = "Endpoints for managing the current user's profile and account settings")
@SecurityRequirement(name = "bearerAuth")
public class UserController {

    private final UserService userService;

    @Operation(summary = "Get current user info", description = "Retrieves the account details of the currently authenticated user.")
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getMe(
            @Parameter(hidden = true) @AuthenticationPrincipal Jwt jwt) {
        String keycloakId = jwt.getSubject();
        UserResponse user = userService.getMe(keycloakId);
        return ResponseEntity.ok(ApiResponse.success("User account retrieved successfully", user));
    }

    @Operation(summary = "Get current user summary & status", description = "Aggregates account details, active subscription tier, profiles count, and unread notifications into a single response for frontend app bootstrap.")
    @GetMapping("/me/summary")
    public ResponseEntity<ApiResponse<UserSummaryResponse>> getMySummary(
            @Parameter(hidden = true) @AuthenticationPrincipal Jwt jwt) {
        String keycloakId = jwt.getSubject();
        UserSummaryResponse summary = userService.getUserSummary(keycloakId);
        return ResponseEntity.ok(ApiResponse.success("User summary retrieved successfully", summary));
    }

    @Operation(summary = "Update current user", description = "Updates settings like display name and avatar for the authenticated user.")
    @PutMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> updateUser(
            @Parameter(hidden = true) @AuthenticationPrincipal Jwt jwt,
            @RequestBody UpdateUserRequest request
    ) {
        String keycloakId = jwt.getSubject();
        UserResponse user = userService.updateUser(keycloakId, request);
        return ResponseEntity.ok(ApiResponse.success("Account updated successfully", user));
    }

    @Operation(summary = "Remove user avatar", description = "Deletes the avatar URL of the current user.")
    @DeleteMapping("/me/avatar")
    public ResponseEntity<ApiResponse<Void>> removeAvatar(
            @Parameter(hidden = true) @AuthenticationPrincipal Jwt jwt) {
        String keycloakId = jwt.getSubject();
        userService.removeAvatar(keycloakId);
        return ResponseEntity.ok(ApiResponse.success("Avatar removed successfully", null));
    }

    @Operation(summary = "Delete account", description = "Permanently deletes the user's account and all associated data.")
    @DeleteMapping("/me")
    public ResponseEntity<ApiResponse<Void>> deleteAccount(
            @Parameter(hidden = true) @AuthenticationPrincipal Jwt jwt) {
        String keycloakId = jwt.getSubject();
        userService.deleteAccount(keycloakId);
        return ResponseEntity.ok(ApiResponse.success("Account deleted successfully", null));
    }
}