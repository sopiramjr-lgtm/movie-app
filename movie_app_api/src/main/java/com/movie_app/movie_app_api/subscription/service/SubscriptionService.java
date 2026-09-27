package com.movie_app.movie_app_api.subscription.service;

import com.movie_app.movie_app_api.subscription.dto.request.SubscribeRequest;
import com.movie_app.movie_app_api.subscription.dto.request.SubscriptionPlanRequest;
import com.movie_app.movie_app_api.subscription.dto.response.PaymentResponse;
import com.movie_app.movie_app_api.subscription.dto.response.SubscriptionPlanResponse;
import com.movie_app.movie_app_api.subscription.dto.response.SubscriptionResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface SubscriptionService {
    // Plans (Admin & Public)
    SubscriptionPlanResponse createPlan(SubscriptionPlanRequest request);
    SubscriptionPlanResponse updatePlan(UUID planId, SubscriptionPlanRequest request);
    void deletePlan(UUID planId);
    List<SubscriptionPlanResponse> getAllPlans();

    // Subscriptions (User)
    SubscriptionResponse subscribe(String keycloakId, SubscribeRequest request);
    SubscriptionResponse verifyPayment(String keycloakId, UUID subscriptionId);
    SubscriptionResponse getSubscriptionStatus(String keycloakId, UUID subscriptionId);
    List<SubscriptionResponse> getUserSubscriptions(String keycloakId);
    SubscriptionResponse cancelSubscription(String keycloakId, UUID subscriptionId);

    // Administrative Management
    Page<SubscriptionResponse> getAllSubscriptions(Pageable pageable, String status);
    SubscriptionResponse adminCancelSubscription(UUID subscriptionId);
    Page<PaymentResponse> getAllPayments(Pageable pageable);
}