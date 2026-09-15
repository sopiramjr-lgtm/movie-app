package com.movie_app.movie_app_api.admin.service.impl;

import com.movie_app.movie_app_api.admin.dto.response.AdminDashboardResponse;
import com.movie_app.movie_app_api.admin.dto.response.AuditLogResponse;
import com.movie_app.movie_app_api.admin.entity.AdminAuditLog;
import com.movie_app.movie_app_api.admin.mapper.AdminMapper;
import com.movie_app.movie_app_api.admin.repository.AdminAuditLogRepository;
import com.movie_app.movie_app_api.admin.service.AdminService;
import com.movie_app.movie_app_api.catalog.repository.ContentRepository;
import com.movie_app.movie_app_api.core.exception.ResourceNotFoundException;
import com.movie_app.movie_app_api.subscription.repository.PaymentRepository;
import com.movie_app.movie_app_api.subscription.repository.SubscriptionRepository;
import com.movie_app.movie_app_api.user.entity.User;
import com.movie_app.movie_app_api.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final AdminAuditLogRepository auditLogRepository;
    private final UserRepository userRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final ContentRepository contentRepository;
    private final PaymentRepository paymentRepository;
    private final com.movie_app.movie_app_api.review.repository.ReviewRepository reviewRepository;
    private final AdminMapper adminMapper;

    @Override
    @Transactional(readOnly = true)
    public AdminDashboardResponse getDashboardStats() {
        long totalUsers = userRepository.count();
        long totalContent = contentRepository.count();
        long totalMovies = contentRepository.countByContentType("MOVIE");
        long totalSeries = contentRepository.countByContentType("SERIES");
        long totalReviews = reviewRepository.count();

        // Count only ACTIVE subscriptions for accurate dashboard stats
        long activeSubscriptions = subscriptionRepository.countByStatus("ACTIVE");

        long totalRevenueCents = paymentRepository.calculateTotalRevenueCents();

        return AdminDashboardResponse.builder()
                .totalUsers(totalUsers)
                .activeSubscriptions(activeSubscriptions)
                .totalContentItems(totalContent)
                .totalMovies(totalMovies)
                .totalSeries(totalSeries)
                .totalReviews(totalReviews)
                .totalRevenueCents(totalRevenueCents)
                .build();
    }

    @Override
    @Transactional
    public void logAction(String keycloakId, String action, String targetType, UUID targetId) {
        User admin = userRepository.findByKeycloakId(keycloakId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin user not found"));

        AdminAuditLog log = AdminAuditLog.builder()
                .admin(admin)
                .action(action)
                .targetType(targetType)
                .targetId(targetId)
                .createdAt(LocalDateTime.now())
                .build();

        auditLogRepository.save(log);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AuditLogResponse> getRecentAuditLogs() {
        return auditLogRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(adminMapper::toResponse)
                .toList();
    }
}