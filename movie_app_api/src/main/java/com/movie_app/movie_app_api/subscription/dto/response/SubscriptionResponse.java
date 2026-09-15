package com.movie_app.movie_app_api.subscription.dto.response;

import lombok.Builder;
import java.time.LocalDateTime;
import java.util.UUID;

@Builder
public record SubscriptionResponse(
        UUID id,
        UUID userId,
        SubscriptionPlanResponse plan,
        String status,
        LocalDateTime startedAt,
        LocalDateTime currentPeriodEnd,
        LocalDateTime cancelledAt
) {}