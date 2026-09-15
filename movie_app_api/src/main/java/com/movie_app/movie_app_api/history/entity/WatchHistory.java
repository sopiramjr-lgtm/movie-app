package com.movie_app.movie_app_api.history.entity;

import com.movie_app.movie_app_api.profile.entity.Profile;
import com.movie_app.movie_app_api.catalog.entity.Content;
import com.movie_app.movie_app_api.catalog.entity.Episode;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "watch_history")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class WatchHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profile_id", nullable = false)
    private Profile profile;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "content_id", nullable = false)
    private Content content;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "episode_id")
    private Episode episode; // Nullable for movies

    private int progressSeconds;
    private boolean completed;
    private LocalDateTime lastWatchedAt;
}