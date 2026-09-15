package com.movie_app.movie_app_api.catalog.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "episodes")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Episode {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "season_id", nullable = false)
    private Season season;

    private int episodeNumber;

    @Column(nullable = false)
    private String title;

    private String description;
    private Integer durationMinutes;
    private String thumbnailUrl;

    @Column(nullable = false)
    private String videoUrl;
}