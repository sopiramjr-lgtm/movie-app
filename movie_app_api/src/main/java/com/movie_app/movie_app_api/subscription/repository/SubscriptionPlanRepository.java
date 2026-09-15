package com.movie_app.movie_app_api.subscription.repository;

import com.movie_app.movie_app_api.subscription.entity.SubscriptionPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface SubscriptionPlanRepository extends JpaRepository<SubscriptionPlan, UUID> {
    Optional<SubscriptionPlan> findByNameIgnoreCase(String name);
    boolean existsByNameIgnoreCase(String name);
}