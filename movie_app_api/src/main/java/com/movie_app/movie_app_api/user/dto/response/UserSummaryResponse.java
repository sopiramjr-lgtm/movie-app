package com.movie_app.movie_app_api.user.dto.response;

import lombok.Builder;

@Builder
public record UserSummaryResponse(
        UserResponse user,
        String activePlanName,
        boolean hasActiveSubscription,
        int profileCount,
        int unreadNotificationsCount
) {}
