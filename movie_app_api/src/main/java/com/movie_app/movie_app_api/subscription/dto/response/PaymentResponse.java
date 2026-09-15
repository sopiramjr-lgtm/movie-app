package com.movie_app.movie_app_api.subscription.dto.response;

import lombok.Builder;

import java.time.LocalDateTime;
import java.util.UUID;

@Builder
public record PaymentResponse(
        UUID id,
        UUID subscriptionId,
        String userEmail,
        String planName,
        int amountCents,
        String status,
        String providerRef,
        LocalDateTime paidAt
) {}
