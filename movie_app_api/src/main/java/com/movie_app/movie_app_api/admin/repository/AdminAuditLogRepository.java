package com.movie_app.movie_app_api.admin.repository;

import com.movie_app.movie_app_api.admin.entity.AdminAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AdminAuditLogRepository extends JpaRepository<AdminAuditLog, UUID> {
    List<AdminAuditLog> findAllByOrderByCreatedAtDesc();
    List<AdminAuditLog> findByAdminIdOrderByCreatedAtDesc(UUID adminId);
}