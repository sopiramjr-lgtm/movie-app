package com.movie_app.movie_app_api.subscription.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record SubscriptionPlanRequest(
        @NotBlank(message = "Plan name is required") String name,
        @NotNull(message = "Price is required") Integer priceCents,
        @NotBlank(message = "Max video quality is required") String maxVideoQuality,
        @NotNull(message = "Max concurrent streams required") Integer maxConcurrentStreams
) {}