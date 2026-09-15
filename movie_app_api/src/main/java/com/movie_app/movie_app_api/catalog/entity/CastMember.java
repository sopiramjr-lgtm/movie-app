package com.movie_app.movie_app_api.catalog.entity;

import com.movie_app.movie_app_api.core.audit.BaseAuditEntity;
import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "cast_members")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CastMember extends BaseAuditEntity {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "content_id", nullable = false)
    private Content content;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "person_id", nullable = false)
    private Person person;

    @Column(nullable = false) private String role; // "Actor", "Director", "Writer"
    private String characterName;
}