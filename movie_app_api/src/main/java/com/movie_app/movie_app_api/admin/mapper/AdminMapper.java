package com.movie_app.movie_app_api.admin.mapper;

import com.movie_app.movie_app_api.admin.dto.response.AuditLogResponse;
import com.movie_app.movie_app_api.admin.entity.AdminAuditLog;
import org.springframework.stereotype.Component;

@Component
public class AdminMapper {
    public AuditLogResponse toResponse(AdminAuditLog log) {
        if (log == null) return null;

        String adminName = null;
        if (log.getAdmin() != null) {
            adminName = (log.getAdmin().getDisplayName() != null && !log.getAdmin().getDisplayName().isBlank())
                    ? log.getAdmin().getDisplayName()
                    : log.getAdmin().getEmail();
        }

        return AuditLogResponse.builder()
                .id(log.getId())
                .adminId(log.getAdmin() != null ? log.getAdmin().getId() : null)
                .adminEmail(log.getAdmin() != null ? log.getAdmin().getEmail() : "admin@khmerflix.com")
                .adminName(adminName)
                .action(log.getAction())
                .targetType(log.getTargetType())
                .targetId(log.getTargetId())
                .details(log.getDetails())
                .ipAddress(log.getIpAddress() != null ? log.getIpAddress() : "127.0.0.1")
                .status(log.getStatus() != null ? log.getStatus() : "SUCCESS")
                .createdAt(log.getCreatedAt())
                .build();
    }
}