package com.movie_app.movie_app_api.subscription.mapper;

import com.movie_app.movie_app_api.subscription.dto.response.SubscriptionPlanResponse;
import com.movie_app.movie_app_api.subscription.dto.response.SubscriptionResponse;
import com.movie_app.movie_app_api.subscription.entity.Subscription;
import com.movie_app.movie_app_api.subscription.entity.SubscriptionPlan;
import org.springframework.stereotype.Component;

@Component
public class SubscriptionMapper {

    public SubscriptionPlanResponse toPlanResponse(SubscriptionPlan plan) {
        if (plan == null) return null;
        return SubscriptionPlanResponse.builder()
                .id(plan.getId())
                .name(plan.getName())
                .priceCents(plan.getPriceCents())
                .maxVideoQuality(plan.getMaxVideoQuality())
                .maxConcurrentStreams(plan.getMaxConcurrentStreams())
                .build();
    }

    public SubscriptionResponse toSubscriptionResponse(Subscription subscription) {
        if (subscription == null) return null;
        return SubscriptionResponse.builder()
                .id(subscription.getId())
                .userId(subscription.getUser().getId())
                .plan(toPlanResponse(subscription.getPlan()))
                .status(subscription.getStatus())
                .startedAt(subscription.getStartedAt())
                .currentPeriodEnd(subscription.getCurrentPeriodEnd())
                .cancelledAt(subscription.getCancelledAt())
                .qrExpiresAt(subscription.getQrExpiresAt())
                .build();
    }

    public com.movie_app.movie_app_api.subscription.dto.response.PaymentResponse toPaymentResponse(com.movie_app.movie_app_api.subscription.entity.Payment payment) {
        if (payment == null) return null;
        return com.movie_app.movie_app_api.subscription.dto.response.PaymentResponse.builder()
                .id(payment.getId())
                .subscriptionId(payment.getSubscription() != null ? payment.getSubscription().getId() : null)
                .userEmail(payment.getSubscription() != null && payment.getSubscription().getUser() != null
                        ? payment.getSubscription().getUser().getEmail() : null)
                .planName(payment.getSubscription() != null && payment.getSubscription().getPlan() != null
                        ? payment.getSubscription().getPlan().getName() : null)
                .amountCents(payment.getAmountCents())
                .status(payment.getStatus())
                .providerRef(payment.getProviderRef())
                .paidAt(payment.getPaidAt())
                .build();
    }
}