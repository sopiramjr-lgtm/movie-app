package com.movie_app.movie_app_api.subscription.repository;

import com.movie_app.movie_app_api.subscription.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, UUID> {

    List<Payment> findBySubscriptionId(UUID subscriptionId);

    // This is the missing method! It tells PostgreSQL to sum up the amountCents column.
    @Query("SELECT COALESCE(SUM(p.amountCents), 0) FROM Payment p WHERE p.status = 'SUCCESS'")
    long calculateTotalRevenueCents();
}