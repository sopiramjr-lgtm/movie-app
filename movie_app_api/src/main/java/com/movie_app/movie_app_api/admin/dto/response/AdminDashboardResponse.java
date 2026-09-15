package com.movie_app.movie_app_api.admin.dto.response;

import lombok.Builder;

@Builder
public record AdminDashboardResponse(
        long totalUsers,
        long activeSubscriptions,
        long totalContentItems,
        long totalMovies,
        long totalSeries,
        long totalReviews,
        long totalRevenueCents
) {}