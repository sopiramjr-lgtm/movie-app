package com.movie_app.movie_app_api.admin.controller;

import com.movie_app.movie_app_api.admin.dto.response.AdminDashboardResponse;
import com.movie_app.movie_app_api.admin.dto.response.AuditLogResponse;
import com.movie_app.movie_app_api.admin.service.AdminService;
import com.movie_app.movie_app_api.core.payload.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "[Admin] Dashboard & Analytics", description = "High-level metrics, statistics, and audit activity logs for administrators")
@SecurityRequirement(name = "bearerAuth")
public class AdminController {

    private final AdminService adminService;

    @Operation(summary = "Get platform dashboard statistics", description = "Retrieves aggregated counts of users, active subscriptions, movies, series, reviews, and revenue.")
    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<AdminDashboardResponse>> getDashboardStats() {
        AdminDashboardResponse stats = adminService.getDashboardStats();
        return ResponseEntity.ok(ApiResponse.success("Dashboard stats retrieved", stats));
    }

    @Operation(summary = "Get recent audit activity logs", description = "Retrieves recent administrative action logs recorded across the system.")
    @GetMapping("/audit-logs")
    public ResponseEntity<ApiResponse<List<AuditLogResponse>>> getAuditLogs() {
        List<AuditLogResponse> logs = adminService.getRecentAuditLogs();
        return ResponseEntity.ok(ApiResponse.success("Audit logs retrieved", logs));
    }
}