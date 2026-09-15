package com.movie_app.movie_app_api.catalog.entity;

import com.movie_app.movie_app_api.core.audit.BaseAuditEntity;
import com.movie_app.movie_app_api.streaming.entity.ContentAsset;
import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "content")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Content extends BaseAuditEntity {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false) private String contentType; // MOVIE or SERIES
    @Column(nullable = false) private String title;
    @Column(columnDefinition = "TEXT") private String description;

    private Integer releaseYear;
    private String maturityRating;
    private Integer durationMinutes;
    private String posterUrl;
    private String videoUrl;
    private String trailerUrl;
    private Double averageRating;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "content_genres",
            joinColumns = @JoinColumn(name = "content_id"),
            inverseJoinColumns = @JoinColumn(name = "genre_id"))
    @Builder.Default private Set<Genre> genres = new HashSet<>();

    @OneToMany(mappedBy = "content", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default private List<Season> seasons = new ArrayList<>();

    @OneToMany(mappedBy = "content", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default private List<ContentAsset> assets = new ArrayList<>();
}