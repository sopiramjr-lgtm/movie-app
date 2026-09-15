package com.movie_app.movie_app_api.admin.controller;

import com.movie_app.movie_app_api.core.payload.ApiResponse;
import com.movie_app.movie_app_api.user.dto.response.UserResponse;
import com.movie_app.movie_app_api.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "[Admin] User Management", description = "Administrative endpoints for moderating, searching, and managing user accounts")
@SecurityRequirement(name = "bearerAuth")
public class AdminUserController {

    private final UserService userService;

    @Operation(summary = "List all users", description = "Retrieves a paginated list of registered users with optional role filtering.")
    @GetMapping
    public ResponseEntity<ApiResponse<Page<UserResponse>>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String role) {
        Page<UserResponse> users = userService.getAllUsers(PageRequest.of(page, size, Sort.by("createdAt").descending()), role);
        return ResponseEntity.ok(ApiResponse.success("Users retrieved successfully", users));
    }

    @Operation(summary = "Search users", description = "Searches users by email or display name with pagination.")
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Page<UserResponse>>> searchUsers(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<UserResponse> users = userService.searchUsers(query, PageRequest.of(page, size, Sort.by("createdAt").descending()));
        return ResponseEntity.ok(ApiResponse.success("Search results", users));
    }

    @Operation(summary = "Get user details by ID", description = "Retrieves complete account details for a specific user ID.")
    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(@PathVariable UUID userId) {
        UserResponse user = userService.getUserById(userId);
        return ResponseEntity.ok(ApiResponse.success("User retrieved successfully", user));
    }

    @Operation(summary = "Ban/Deactivate user", description = "Deactivates a user account in PostgreSQL and disables it in Keycloak.")
    @PostMapping("/{userId}/ban")
    public ResponseEntity<ApiResponse<Void>> banUser(@PathVariable UUID userId) {
        userService.setUserActiveStatus(userId, false);
        return ResponseEntity.ok(ApiResponse.success("User banned successfully", null));
    }

    @Operation(summary = "Unban/Reactivate user", description = "Reactivates a user account in PostgreSQL and enables it in Keycloak.")
    @PostMapping("/{userId}/unban")
    public ResponseEntity<ApiResponse<Void>> unbanUser(@PathVariable UUID userId) {
        userService.setUserActiveStatus(userId, true);
        return ResponseEntity.ok(ApiResponse.success("User unbanned successfully", null));
    }

    @Operation(summary = "Update user role", description = "Assigns a new role to the user (e.g., ROLE_ADMIN, ROLE_USER) and syncs with Keycloak.")
    @PutMapping("/{userId}/role")
    public ResponseEntity<ApiResponse<UserResponse>> updateUserRole(
            @PathVariable UUID userId,
            @RequestParam String role) {
        UserResponse response = userService.updateUserRole(userId, role);
        return ResponseEntity.ok(ApiResponse.success("User role updated successfully", response));
    }

    @Operation(summary = "Delete user", description = "Permanently deletes a user from PostgreSQL and removes their Keycloak identity.")
    @DeleteMapping("/{userId}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable UUID userId) {
        userService.deleteUserByAdmin(userId);
        return ResponseEntity.ok(ApiResponse.success("User deleted successfully by admin", null));
    }
}