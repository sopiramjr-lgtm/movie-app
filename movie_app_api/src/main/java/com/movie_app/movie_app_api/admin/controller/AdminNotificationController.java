package com.movie_app.movie_app_api.admin.controller;

import com.movie_app.movie_app_api.core.payload.ApiResponse;
import com.movie_app.movie_app_api.notification.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/notifications")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "[Admin] Notifications & Broadcast", description = "Administrative endpoints for broadcasting system notifications or messaging specific users")
@SecurityRequirement(name = "bearerAuth")
public class AdminNotificationController {

    private final NotificationService notificationService;

    @Operation(summary = "Broadcast global notification", description = "Dispatches an alert to all registered users across the platform.")
    @PostMapping("/broadcast")
    public ResponseEntity<ApiResponse<Void>> sendGlobalNotification(
            @RequestParam String title,
            @RequestParam String message,
            @RequestParam(defaultValue = "SYSTEM") String type) {
        notificationService.sendGlobalNotification(title, message, type);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Global notification broadcast successfully", null));
    }

    @Operation(summary = "Send notification to specific user", description = "Dispatches a targeted notification alert to a specific user account.")
    @PostMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<Void>> sendNotificationToUser(
            @PathVariable UUID userId,
            @RequestParam String title,
            @RequestParam String message,
            @RequestParam(defaultValue = "SYSTEM") String type) {
        notificationService.sendNotificationToUser(userId, title, message, type);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Notification sent to user successfully", null));
    }
}