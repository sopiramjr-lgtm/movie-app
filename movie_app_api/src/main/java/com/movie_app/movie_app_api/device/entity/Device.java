package com.movie_app.movie_app_api.device.entity;

import com.movie_app.movie_app_api.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "devices")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Device {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String deviceName;
    private String deviceType;
    private LocalDateTime lastActiveAt;

    @Column(length = 2000) // Refresh tokens can be long
    private String refreshToken;
}