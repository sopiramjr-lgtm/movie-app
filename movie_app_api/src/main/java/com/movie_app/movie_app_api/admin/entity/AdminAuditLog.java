package com.movie_app.movie_app_api.admin.entity;

import com.movie_app.movie_app_api.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "admin_audit_log")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AdminAuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_id", nullable = false)
    private User admin;

    @Column(nullable = false)
    private String action; // e.g., "CREATED_MOVIE", "DELETED_USER", "UPDATED_PLAN"

    @Column(nullable = false)
    private String targetType; // e.g., "CONTENT", "USER", "SUBSCRIPTION"

    private UUID targetId;

    private LocalDateTime createdAt;
}