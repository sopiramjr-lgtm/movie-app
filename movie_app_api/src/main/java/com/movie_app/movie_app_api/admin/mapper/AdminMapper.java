package com.movie_app.movie_app_api.admin.mapper;

import com.movie_app.movie_app_api.admin.dto.response.AuditLogResponse;
import com.movie_app.movie_app_api.admin.entity.AdminAuditLog;
import org.springframework.stereotype.Component;

@Component
public class AdminMapper {
    public AuditLogResponse toResponse(AdminAuditLog log) {
        if (log == null) return null;

        return AuditLogResponse.builder()
                .id(log.getId())
                .adminId(log.getAdmin().getId())
                .adminEmail(log.getAdmin().getEmail())
                .action(log.getAction())
                .targetType(log.getTargetType())
                .targetId(log.getTargetId())
                .createdAt(log.getCreatedAt())
                .build();
    }
}