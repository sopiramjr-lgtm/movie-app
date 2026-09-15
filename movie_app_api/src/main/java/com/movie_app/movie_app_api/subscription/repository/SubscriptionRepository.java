package com.movie_app.movie_app_api.subscription.repository;

import com.movie_app.movie_app_api.subscription.entity.Subscription;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, UUID> {
    List<Subscription> findByUser_KeycloakId(String keycloakId);

    Page<Subscription> findByStatus(String status, Pageable pageable);

    long countByStatus(String status);
}