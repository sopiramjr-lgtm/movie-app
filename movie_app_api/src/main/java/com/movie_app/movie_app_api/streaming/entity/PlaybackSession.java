package com.movie_app.movie_app_api.streaming.entity;

import com.movie_app.movie_app_api.catalog.entity.Content;
import com.movie_app.movie_app_api.profile.entity.Profile;
import com.movie_app.movie_app_api.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "playback_sessions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PlaybackSession {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user; // Tied to User to check Subscription limits

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profile_id", nullable = false)
    private Profile profile; // The specific person watching

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "content_id", nullable = false)
    private Content content;

    @Column(nullable = false, unique = true)
    private String sessionToken; // Passed to the video player

    private String ipAddress;
    private String userAgent;

    private boolean isActive;
    private LocalDateTime startedAt;
    private LocalDateTime lastHeartbeatAt;
}