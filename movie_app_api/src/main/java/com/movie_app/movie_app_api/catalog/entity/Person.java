package com.movie_app.movie_app_api.catalog.entity;

import com.movie_app.movie_app_api.core.audit.BaseAuditEntity;
import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "persons")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Person extends BaseAuditEntity {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false) private String name;
    private String profileImageUrl;
    @Column(columnDefinition = "TEXT") private String biography;
}