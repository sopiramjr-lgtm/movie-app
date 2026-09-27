package com.movie_app.movie_app_api.subscription.service.impl;

import com.movie_app.movie_app_api.core.exception.BadRequestException;
import com.movie_app.movie_app_api.core.exception.ForbiddenException;
import com.movie_app.movie_app_api.core.exception.ResourceNotFoundException;
import com.movie_app.movie_app_api.subscription.dto.request.SubscribeRequest;
import com.movie_app.movie_app_api.subscription.dto.request.SubscriptionPlanRequest;
import com.movie_app.movie_app_api.subscription.dto.response.PaymentResponse;
import com.movie_app.movie_app_api.subscription.dto.response.SubscriptionPlanResponse;
import com.movie_app.movie_app_api.subscription.dto.response.SubscriptionResponse;
import com.movie_app.movie_app_api.subscription.entity.Subscription;
import com.movie_app.movie_app_api.subscription.entity.SubscriptionPlan;
import com.movie_app.movie_app_api.subscription.mapper.SubscriptionMapper;
import com.movie_app.movie_app_api.subscription.repository.PaymentRepository;
import com.movie_app.movie_app_api.subscription.repository.SubscriptionPlanRepository;
import com.movie_app.movie_app_api.subscription.repository.SubscriptionRepository;
import com.movie_app.movie_app_api.subscription.service.SubscriptionService;
import com.movie_app.movie_app_api.user.entity.User;
import com.movie_app.movie_app_api.user.repository.UserRepository;
import com.movie_app.movie_app_api.payment.service.KhqrService;
import com.movie_app.movie_app_api.subscription.entity.Payment;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SubscriptionServiceImpl implements SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;
    private final SubscriptionPlanRepository planRepository;
    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;
    private final SubscriptionMapper mapper;
    private final KhqrService khqrService;
    private final com.movie_app.movie_app_api.core.service.CurrentUserService currentUserService;

    @Override
    @Transactional
    public SubscriptionPlanResponse createPlan(SubscriptionPlanRequest request) {
        if (planRepository.existsByNameIgnoreCase(request.name())) {
            throw new BadRequestException("Plan with this name already exists");
        }

        SubscriptionPlan plan = SubscriptionPlan.builder()
                .name(request.name())
                .priceCents(request.priceCents())
                .maxVideoQuality(request.maxVideoQuality())
                .maxConcurrentStreams(request.maxConcurrentStreams())
                .build();

        return mapper.toPlanResponse(planRepository.save(plan));
    }

    @Override
    @Transactional
    public SubscriptionPlanResponse updatePlan(UUID planId, SubscriptionPlanRequest request) {
        SubscriptionPlan plan = planRepository.findById(planId)
                .orElseThrow(() -> new ResourceNotFoundException("Plan not found"));

        if (!plan.getName().equalsIgnoreCase(request.name()) && planRepository.existsByNameIgnoreCase(request.name())) {
            throw new BadRequestException("Plan with name '" + request.name() + "' already exists");
        }

        plan.setName(request.name());
        plan.setPriceCents(request.priceCents());
        plan.setMaxVideoQuality(request.maxVideoQuality());
        plan.setMaxConcurrentStreams(request.maxConcurrentStreams());

        return mapper.toPlanResponse(planRepository.save(plan));
    }

    @Override
    @Transactional
    public void deletePlan(UUID planId) {
        if (!planRepository.existsById(planId)) {
            throw new ResourceNotFoundException("Plan not found with id: " + planId);
        }
        planRepository.deleteById(planId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SubscriptionPlanResponse> getAllPlans() {
        return planRepository.findAll().stream()
                .map(mapper::toPlanResponse)
                .toList();
    }

    @Override
    @Transactional
    public SubscriptionResponse subscribe(String keycloakId, SubscribeRequest request) {
        User user = userRepository.findByKeycloakId(keycloakId)
                .orElseGet(() -> currentUserService.requireCurrentUser());

        // Guard: prevent duplicate active subscriptions
        boolean hasActiveSubscription = subscriptionRepository.findByUser_KeycloakId(keycloakId)
                .stream()
                .anyMatch(s -> "ACTIVE".equalsIgnoreCase(s.getStatus()));
        if (hasActiveSubscription) {
            throw new BadRequestException("You already have an active subscription. Please cancel it before subscribing to a new plan.");
        }

        SubscriptionPlan plan = planRepository.findById(request.planId())
                .orElseThrow(() -> new ResourceNotFoundException("Plan not found"));

        // Create pending subscription with QR expiry of 30 minutes
        LocalDateTime qrExpiry = LocalDateTime.now().plusMinutes(30);
        Subscription subscription = Subscription.builder()
                .user(user)
                .plan(plan)
                .status("PENDING_PAYMENT")
                .startedAt(LocalDateTime.now())
                .currentPeriodEnd(LocalDateTime.now().plusMonths(1))
                .qrExpiresAt(qrExpiry)
                .build();
        subscription = subscriptionRepository.save(subscription);

        // Generate KHQR Payment (Bakong billNumber max 25 chars)
        double amountUsd = plan.getPriceCents() / 100.0;
        String safeBill = "SUB" + subscription.getId().toString().replace("-", "").substring(0, 20);
        String qrString = khqrService.generateQrString(amountUsd, safeBill);

        // Create Payment record
        Payment payment = Payment.builder()
                .subscription(subscription)
                .amountCents(plan.getPriceCents())
                .status("PENDING")
                .providerRef(subscription.getId().toString())
                .build();
        paymentRepository.save(payment);

        SubscriptionResponse response = mapper.toSubscriptionResponse(subscription);
        return SubscriptionResponse.builder()
                .id(response.id())
                .userId(response.userId())
                .plan(response.plan())
                .status(response.status())
                .startedAt(response.startedAt())
                .currentPeriodEnd(response.currentPeriodEnd())
                .cancelledAt(response.cancelledAt())
                .paymentQrCode(qrString)
                .qrExpiresAt(qrExpiry)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public SubscriptionResponse getSubscriptionStatus(String keycloakId, UUID subscriptionId) {
        Subscription subscription = subscriptionRepository.findById(subscriptionId)
                .orElseThrow(() -> new ResourceNotFoundException("Subscription not found"));

        if (!subscription.getUser().getKeycloakId().equals(keycloakId)) {
            throw new ForbiddenException("You do not have permission to view this subscription");
        }

        return mapper.toSubscriptionResponse(subscription);
    }

    @Override
    @Transactional
    public SubscriptionResponse verifyPayment(String keycloakId, UUID subscriptionId) {
        Subscription subscription = subscriptionRepository.findById(subscriptionId)
                .orElseThrow(() -> new ResourceNotFoundException("Subscription not found"));

        if (!subscription.getUser().getKeycloakId().equals(keycloakId)) {
            throw new ForbiddenException("You do not have permission to verify this subscription");
        }

        if ("ACTIVE".equalsIgnoreCase(subscription.getStatus())) {
            return mapper.toSubscriptionResponse(subscription);
        }

        // Check if QR has expired
        if (subscription.getQrExpiresAt() != null && LocalDateTime.now().isAfter(subscription.getQrExpiresAt())) {
            subscription.setStatus("EXPIRED");
            subscriptionRepository.save(subscription);
            throw new BadRequestException("QR code has expired. Please subscribe again to get a new payment code.");
        }

        // Activate subscription (in production: call Bakong Check Transaction API here)
        subscription.setStatus("ACTIVE");
        subscription.setStartedAt(LocalDateTime.now());
        subscription.setCurrentPeriodEnd(LocalDateTime.now().plusMonths(1));

        List<Payment> payments = paymentRepository.findAll();
        for (Payment payment : payments) {
            if (payment.getSubscription().getId().equals(subscription.getId())) {
                payment.setStatus("COMPLETED");
                payment.setPaidAt(LocalDateTime.now());
                paymentRepository.save(payment);
                break;
            }
        }

        return mapper.toSubscriptionResponse(subscriptionRepository.save(subscription));
    }

    @Override
    @Transactional(readOnly = true)
    public List<SubscriptionResponse> getUserSubscriptions(String keycloakId) {
        return subscriptionRepository.findByUser_KeycloakId(keycloakId).stream()
                .map(mapper::toSubscriptionResponse)
                .toList();
    }

    @Override
    @Transactional
    public SubscriptionResponse cancelSubscription(String keycloakId, UUID subscriptionId) {
        Subscription subscription = subscriptionRepository.findById(subscriptionId)
                .orElseThrow(() -> new ResourceNotFoundException("Subscription not found"));

        if (!subscription.getUser().getKeycloakId().equals(keycloakId)) {
            throw new ForbiddenException("You do not have permission to cancel this subscription");
        }

        subscription.setStatus("CANCELLED");
        subscription.setCancelledAt(LocalDateTime.now());

        return mapper.toSubscriptionResponse(subscriptionRepository.save(subscription));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<SubscriptionResponse> getAllSubscriptions(Pageable pageable, String status) {
        Page<Subscription> page = (status != null && !status.isBlank())
                ? subscriptionRepository.findByStatus(status.toUpperCase(), pageable)
                : subscriptionRepository.findAll(pageable);

        return page.map(mapper::toSubscriptionResponse);
    }

    @Override
    @Transactional
    public SubscriptionResponse adminCancelSubscription(UUID subscriptionId) {
        Subscription subscription = subscriptionRepository.findById(subscriptionId)
                .orElseThrow(() -> new ResourceNotFoundException("Subscription not found"));

        subscription.setStatus("CANCELLED");
        subscription.setCancelledAt(LocalDateTime.now());

        return mapper.toSubscriptionResponse(subscriptionRepository.save(subscription));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PaymentResponse> getAllPayments(Pageable pageable) {
        return paymentRepository.findAll(pageable)
                .map(mapper::toPaymentResponse);
    }
}