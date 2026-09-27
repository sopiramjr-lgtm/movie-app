package com.movie_app.movie_app_api.admin.service;

import com.movie_app.movie_app_api.admin.dto.response.AdminDashboardResponse;
import com.movie_app.movie_app_api.admin.dto.response.AuditLogResponse;

import java.util.List;
import java.util.UUID;

public interface AdminService {
    AdminDashboardResponse getDashboardStats();
    void logAction(String keycloakId, String action, String targetType, UUID targetId);
    void logAction(String keycloakId, String action, String targetType, UUID targetId, String details, String ipAddress, String status);
    List<AuditLogResponse> getRecentAuditLogs();
    void clearAuditLogs();
}