package com.movie_app.movie_app_api.notification.entity;

import com.movie_app.movie_app_api.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "notifications")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // Tied to the User account (can be seen across profiles, or filtered in the frontend)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(nullable = false)
    private String type; // e.g., BILLING, NEW_RELEASE, WATCHLIST_ALERT, SYSTEM

    @Column(nullable = false)
    private boolean isRead;

    private LocalDateTime createdAt;
}