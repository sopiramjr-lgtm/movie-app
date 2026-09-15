package com.movie_app.movie_app_api.subscription.dto.response;

import lombok.Builder;
import java.util.UUID;

@Builder
public record SubscriptionPlanResponse(
        UUID id,
        String name,
        int priceCents,
        String maxVideoQuality,
        int maxConcurrentStreams
) {}