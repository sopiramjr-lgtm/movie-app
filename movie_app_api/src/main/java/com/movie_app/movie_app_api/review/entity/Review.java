package com.movie_app.movie_app_api.review.entity;

import com.movie_app.movie_app_api.catalog.entity.Content;
import com.movie_app.movie_app_api.profile.entity.Profile;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "reviews")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profile_id", nullable = false)
    private Profile profile;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "content_id", nullable = false)
    private Content content;

    @Column(nullable = false)
    private int rating; // e.g., 1 to 5 stars

    @Column(columnDefinition = "TEXT")
    private String comment;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}