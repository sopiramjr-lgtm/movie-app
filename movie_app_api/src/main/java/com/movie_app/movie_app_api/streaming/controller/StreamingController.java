package com.movie_app.movie_app_api.streaming.controller;

import com.movie_app.movie_app_api.core.payload.ApiResponse;
import com.movie_app.movie_app_api.streaming.service.impl.StreamingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/streaming")
@RequiredArgsConstructor
@Tag(name = "[User] Streaming & Playback", description = "Endpoints for initializing and tracking active video streams")
@SecurityRequirement(name = "bearerAuth")
public class StreamingController {

    private final StreamingService streamingService;

    @Operation(summary = "Start video playback", description = "Validates subscription concurrency limits and generates a session token for playback.")
    @PostMapping("/start")
    public ResponseEntity<ApiResponse<String>> startPlayback(
            @Parameter(hidden = true) @AuthenticationPrincipal Jwt jwt,
            @RequestParam UUID profileId,
            @RequestParam UUID contentId,
            @Parameter(hidden = true) HttpServletRequest httpRequest
    ) {
        String keycloakId = jwt.getSubject();
        String ipAddress = httpRequest.getRemoteAddr();
        String userAgent = httpRequest.getHeader("User-Agent");

        String sessionToken = streamingService.startPlayback(keycloakId, profileId, contentId, ipAddress, userAgent);
        return ResponseEntity.ok(ApiResponse.success("Playback started successfully", sessionToken));
    }

    @Operation(summary = "Send stream heartbeat", description = "Pings the server to keep the active streaming session alive.")
    @PostMapping("/heartbeat")
    public ResponseEntity<ApiResponse<Void>> heartbeat(@RequestParam String sessionToken) {
        streamingService.sendHeartbeat(sessionToken);
        return ResponseEntity.ok(ApiResponse.success("Heartbeat received", null));
    }

    @Operation(summary = "Stop playback session", description = "Terminates the streaming session and frees up a concurrent stream slot.")
    @PostMapping("/stop")
    public ResponseEntity<ApiResponse<Void>> stopPlayback(@RequestParam String sessionToken) {
        streamingService.stopPlayback(sessionToken);
        return ResponseEntity.ok(ApiResponse.success("Playback stopped successfully", null));
    }
}