package com.movie_app.movie_app_api.catalog.entity;

import com.movie_app.movie_app_api.core.audit.BaseAuditEntity;
import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "seasons")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Season extends BaseAuditEntity {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "content_id", nullable = false)
    private Content content;

    private int seasonNumber;
    private String title;

    @OneToMany(mappedBy = "season", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default private List<Episode> episodes = new ArrayList<>();
}