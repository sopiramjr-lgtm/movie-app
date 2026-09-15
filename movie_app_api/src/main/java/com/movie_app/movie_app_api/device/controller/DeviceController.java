package com.movie_app.movie_app_api.device.controller;

import com.movie_app.movie_app_api.core.payload.ApiResponse;
import com.movie_app.movie_app_api.device.dto.response.DeviceResponse;
import com.movie_app.movie_app_api.device.service.DeviceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
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
@RequestMapping("/api/v1/devices")
@RequiredArgsConstructor
@Tag(name = "[User] Devices", description = "Endpoints for viewing and revoking logged-in devices")
@SecurityRequirement(name = "bearerAuth")
public class DeviceController {

    private final DeviceService deviceService;

    @Operation(summary = "Get user devices", description = "Retrieves all devices currently logged into the user's account.")
    @GetMapping
    public ResponseEntity<ApiResponse<List<DeviceResponse>>> getUserDevices(
            @Parameter(hidden = true) @AuthenticationPrincipal Jwt jwt) {
        List<DeviceResponse> devices = deviceService.getUserDevices(jwt.getSubject());
        return ResponseEntity.ok(ApiResponse.success("Devices retrieved successfully", devices));
    }

    @Operation(summary = "Remove a device", description = "Logs out and removes a specific device from the user's account.")
    @DeleteMapping("/{deviceId}")
    public ResponseEntity<ApiResponse<Void>> removeDevice(
            @Parameter(hidden = true) @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID deviceId) {
        deviceService.removeDevice(jwt.getSubject(), deviceId);
        return ResponseEntity.ok(ApiResponse.success("Device removed successfully", null));
    }
}