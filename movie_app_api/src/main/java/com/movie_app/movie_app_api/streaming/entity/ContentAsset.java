package com.movie_app.movie_app_api.streaming.entity;

import com.movie_app.movie_app_api.catalog.entity.Content;
import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "content_assets")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ContentAsset {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "content_id", nullable = false)
    private Content content;

    @Column(nullable = false)
    private String assetType; // SUBTITLE or AUDIO

    @Column(nullable = false)
    private String language;

    @Column(nullable = false)
    private String url;
}