package com.movie_app.movie_app_api.notification.controller;

import com.movie_app.movie_app_api.core.payload.ApiResponse;
import com.movie_app.movie_app_api.notification.dto.response.NotificationResponse;
import com.movie_app.movie_app_api.notification.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
@Tag(name = "[User] Notifications", description = "Endpoints for retrieving and managing user notifications")
@SecurityRequirement(name = "bearerAuth")
public class NotificationController {

    private final NotificationService notificationService;

    @Operation(summary = "Get all user notifications", description = "Retrieves a chronological list of all notifications for the authenticated user.")
    @GetMapping
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getNotifications(
            @Parameter(hidden = true) @AuthenticationPrincipal Jwt jwt) {
        List<NotificationResponse> notifications = notificationService.getUserNotifications(jwt.getSubject());
        return ResponseEntity.ok(ApiResponse.success("Notifications retrieved", notifications));
    }

    @Operation(summary = "Get unread notification count", description = "Retrieves the total number of unread notifications for the authenticated user.")
    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Integer>> getUnreadCount(
            @Parameter(hidden = true) @AuthenticationPrincipal Jwt jwt) {
        int count = notificationService.getUnreadCount(jwt.getSubject());
        return ResponseEntity.ok(ApiResponse.success("Unread count retrieved", count));
    }

    @Operation(summary = "Mark a notification as read", description = "Updates the status of a specific notification to read.")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Notification marked as read")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Access denied to this notification")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Notification not found")
    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(
            @Parameter(hidden = true) @AuthenticationPrincipal Jwt jwt,
            @Parameter(description = "The UUID of the notification", required = true) @PathVariable UUID id) {
        notificationService.markAsRead(jwt.getSubject(), id);
        return ResponseEntity.ok(ApiResponse.success("Notification marked as read", null));
    }

    @Operation(summary = "Mark all notifications as read", description = "Updates the status of all unread notifications to read for the authenticated user.")
    @PutMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead(
            @Parameter(hidden = true) @AuthenticationPrincipal Jwt jwt) {
        notificationService.markAllAsRead(jwt.getSubject());
        return ResponseEntity.ok(ApiResponse.success("All notifications marked as read", null));
    }

    @Operation(summary = "Delete a notification", description = "Permanently removes a specific notification from the user's history.")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Notification deleted successfully")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Access denied to this notification")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Notification not found")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteNotification(
            @Parameter(hidden = true) @AuthenticationPrincipal Jwt jwt,
            @Parameter(description = "The UUID of the notification", required = true) @PathVariable UUID id) {
        notificationService.deleteNotification(jwt.getSubject(), id);
        return ResponseEntity.ok(ApiResponse.success("Notification deleted", null));
    }
}