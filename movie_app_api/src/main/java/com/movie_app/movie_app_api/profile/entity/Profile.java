package com.movie_app.movie_app_api.profile.entity;

import com.movie_app.movie_app_api.core.audit.BaseAuditEntity;
import com.movie_app.movie_app_api.user.entity.User;
import com.movie_app.movie_app_api.history.entity.WatchHistory;
import com.movie_app.movie_app_api.history.entity.Watchlist;
import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "profiles")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Profile extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String name;

    private String avatarUrl;
    private boolean isKids;
    private String preferredLanguage;

    @OneToMany(mappedBy = "profile", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default private List<Watchlist> watchlists = new ArrayList<>();

    @OneToMany(mappedBy = "profile", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default private List<WatchHistory> watchHistories = new ArrayList<>();
}