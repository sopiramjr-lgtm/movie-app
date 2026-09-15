package com.movie_app.movie_app_api.subscription.dto.request;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record SubscribeRequest(
        @NotNull(message = "Plan ID is required") UUID planId
) {}