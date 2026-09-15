package com.movie_app.movie_app_api.subscription.controller;

import com.movie_app.movie_app_api.core.payload.ApiResponse;
import com.movie_app.movie_app_api.subscription.dto.request.SubscribeRequest;
import com.movie_app.movie_app_api.subscription.dto.response.SubscriptionPlanResponse;
import com.movie_app.movie_app_api.subscription.dto.response.SubscriptionResponse;
import com.movie_app.movie_app_api.subscription.service.SubscriptionService;
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
@RequestMapping("/api/v1/subscriptions")
@RequiredArgsConstructor
@Tag(name = "[User] Subscriptions & Billing", description = "Endpoints for exploring subscription tiers, subscribing, and managing personal subscriptions")
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    @Operation(summary = "Get available subscription plans", description = "Retrieves pricing and features for all active subscription tiers.")
    @GetMapping("/plans")
    public ResponseEntity<ApiResponse<List<SubscriptionPlanResponse>>> getAllPlans() {
        return ResponseEntity.ok(ApiResponse.success(subscriptionService.getAllPlans()));
    }

    @Operation(summary = "Get my subscriptions", description = "Retrieves current and past subscription records for the authenticated user.")
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<List<SubscriptionResponse>>> getMySubscriptions(
            @Parameter(hidden = true) @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(ApiResponse.success(subscriptionService.getUserSubscriptions(jwt.getSubject())));
    }

    @Operation(summary = "Subscribe to a plan", description = "Enrolls the authenticated user into a new subscription tier.")
    @SecurityRequirement(name = "bearerAuth")
    @PostMapping("/subscribe")
    public ResponseEntity<ApiResponse<SubscriptionResponse>> subscribe(
            @Parameter(hidden = true) @AuthenticationPrincipal Jwt jwt,
            @RequestBody @Valid SubscribeRequest request) {
        SubscriptionResponse subscription = subscriptionService.subscribe(jwt.getSubject(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Successfully subscribed", subscription));
    }

    @Operation(summary = "Cancel subscription", description = "Cancels auto-renewal on an active personal subscription.")
    @SecurityRequirement(name = "bearerAuth")
    @PostMapping("/{subscriptionId}/cancel")
    public ResponseEntity<ApiResponse<SubscriptionResponse>> cancelSubscription(
            @Parameter(hidden = true) @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID subscriptionId) {
        SubscriptionResponse subscription = subscriptionService.cancelSubscription(jwt.getSubject(), subscriptionId);
        return ResponseEntity.ok(ApiResponse.success("Subscription cancelled successfully", subscription));
    }
}