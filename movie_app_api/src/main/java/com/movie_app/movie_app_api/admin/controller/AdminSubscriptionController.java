package com.movie_app.movie_app_api.admin.controller;

import com.movie_app.movie_app_api.core.payload.ApiResponse;
import com.movie_app.movie_app_api.subscription.dto.request.SubscriptionPlanRequest;
import com.movie_app.movie_app_api.subscription.dto.response.PaymentResponse;
import com.movie_app.movie_app_api.subscription.dto.response.SubscriptionPlanResponse;
import com.movie_app.movie_app_api.subscription.dto.response.SubscriptionResponse;
import com.movie_app.movie_app_api.subscription.service.SubscriptionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/subscriptions")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "[Admin] Subscriptions & Billing", description = "Administrative endpoints for managing pricing plans, user subscriptions, and payment transaction logs")
@SecurityRequirement(name = "bearerAuth")
public class AdminSubscriptionController {

    private final SubscriptionService subscriptionService;

    @Operation(summary = "Create subscription plan", description = "Creates a new subscription pricing tier.")
    @PostMapping("/plans")
    public ResponseEntity<ApiResponse<SubscriptionPlanResponse>> createPlan(@RequestBody @Valid SubscriptionPlanRequest request) {
        SubscriptionPlanResponse plan = subscriptionService.createPlan(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Plan created successfully", plan));
    }

    @Operation(summary = "Update subscription plan", description = "Updates details and limits of an existing subscription plan.")
    @PutMapping("/plans/{planId}")
    public ResponseEntity<ApiResponse<SubscriptionPlanResponse>> updatePlan(
            @PathVariable UUID planId,
            @RequestBody @Valid SubscriptionPlanRequest request) {
        SubscriptionPlanResponse plan = subscriptionService.updatePlan(planId, request);
        return ResponseEntity.ok(ApiResponse.success("Plan updated successfully", plan));
    }

    @Operation(summary = "Delete subscription plan", description = "Deletes a subscription pricing tier.")
    @DeleteMapping("/plans/{planId}")
    public ResponseEntity<ApiResponse<Void>> deletePlan(@PathVariable UUID planId) {
        subscriptionService.deletePlan(planId);
        return ResponseEntity.ok(ApiResponse.success("Plan deleted successfully", null));
    }

    @Operation(summary = "Get all subscription plans", description = "Retrieves all subscription plans configured in the platform.")
    @GetMapping("/plans")
    public ResponseEntity<ApiResponse<List<SubscriptionPlanResponse>>> getAllPlans() {
        List<SubscriptionPlanResponse> plans = subscriptionService.getAllPlans();
        return ResponseEntity.ok(ApiResponse.success("Plans retrieved successfully", plans));
    }

    @Operation(summary = "List all subscriptions", description = "Retrieves a paginated list of user subscriptions with optional status filter (e.g., ACTIVE, CANCELLED).")
    @GetMapping
    public ResponseEntity<ApiResponse<Page<SubscriptionResponse>>> getAllSubscriptions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String status) {
        Page<SubscriptionResponse> subscriptions = subscriptionService.getAllSubscriptions(
                PageRequest.of(page, size, Sort.by("startedAt").descending()), status);
        return ResponseEntity.ok(ApiResponse.success("Subscriptions retrieved successfully", subscriptions));
    }

    @Operation(summary = "Cancel user subscription", description = "Allows an administrator to immediately cancel a user's active subscription.")
    @PostMapping("/{subscriptionId}/cancel")
    public ResponseEntity<ApiResponse<SubscriptionResponse>> cancelSubscription(@PathVariable UUID subscriptionId) {
        SubscriptionResponse response = subscriptionService.adminCancelSubscription(subscriptionId);
        return ResponseEntity.ok(ApiResponse.success("Subscription cancelled successfully by admin", response));
    }

    @Operation(summary = "List payment transactions", description = "Retrieves paginated audit log of payment transactions.")
    @GetMapping("/payments")
    public ResponseEntity<ApiResponse<Page<PaymentResponse>>> getAllPayments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<PaymentResponse> payments = subscriptionService.getAllPayments(
                PageRequest.of(page, size, Sort.by("paidAt").descending()));
        return ResponseEntity.ok(ApiResponse.success("Payments retrieved successfully", payments));
    }
}