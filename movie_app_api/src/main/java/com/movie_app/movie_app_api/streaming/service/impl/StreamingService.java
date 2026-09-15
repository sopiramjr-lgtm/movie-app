package com.movie_app.movie_app_api.streaming.service.impl;

import com.movie_app.movie_app_api.catalog.entity.Content;
import com.movie_app.movie_app_api.catalog.repository.ContentRepository;
import com.movie_app.movie_app_api.core.exception.ForbiddenException;
import com.movie_app.movie_app_api.core.exception.ResourceNotFoundException;
import com.movie_app.movie_app_api.profile.entity.Profile;
import com.movie_app.movie_app_api.profile.repository.ProfileRepository;
import com.movie_app.movie_app_api.streaming.entity.PlaybackSession;
import com.movie_app.movie_app_api.streaming.repository.PlaybackSessionRepository;
import com.movie_app.movie_app_api.subscription.entity.Subscription;
import com.movie_app.movie_app_api.subscription.repository.SubscriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StreamingService {

    private final PlaybackSessionRepository sessionRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final ProfileRepository profileRepository;
    private final ContentRepository contentRepository;

    @Transactional
    public String startPlayback(String keycloakId, UUID profileId, UUID contentId, String ipAddress, String userAgent) {
        // 1. Get User's Active Subscription
        Subscription sub = subscriptionRepository.findByUser_KeycloakId(keycloakId).stream()
                .filter(s -> "ACTIVE".equalsIgnoreCase(s.getStatus()))
                .findFirst()
                .orElseThrow(() -> new ForbiddenException("No active subscription found"));

        // 2. Validate Profile ownership
        Profile profile = profileRepository.findByIdAndUser_KeycloakId(profileId, keycloakId)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found or access denied"));

        // 3. Validate Content existence
        Content content = contentRepository.findById(contentId)
                .orElseThrow(() -> new ResourceNotFoundException("Content not found"));

        // 4. Check Concurrent Stream Limits
        int activeStreams = sessionRepository.countByUser_KeycloakIdAndIsActiveTrue(keycloakId);
        if (activeStreams >= sub.getPlan().getMaxConcurrentStreams()) {
            throw new ForbiddenException("Too many screens watching at once. Please upgrade your plan or stop another stream.");
        }

        // 5. Create Session Token for video player
        String sessionToken = UUID.randomUUID().toString();

        // 6. Save Playback Session
        PlaybackSession session = PlaybackSession.builder()
                .user(sub.getUser())
                .profile(profile)
                .content(content)
                .sessionToken(sessionToken)
                .ipAddress(ipAddress)
                .userAgent(userAgent)
                .isActive(true)
                .startedAt(LocalDateTime.now())
                .lastHeartbeatAt(LocalDateTime.now())
                .build();

        sessionRepository.save(session);
        return sessionToken;
    }

    @Transactional
    public void sendHeartbeat(String sessionToken) {
        PlaybackSession session = sessionRepository.findBySessionTokenAndIsActiveTrue(sessionToken)
                .orElseThrow(() -> new ResourceNotFoundException("Active streaming session not found"));

        session.setLastHeartbeatAt(LocalDateTime.now());
        sessionRepository.save(session);
    }

    @Transactional
    public void stopPlayback(String sessionToken) {
        sessionRepository.findBySessionTokenAndIsActiveTrue(sessionToken).ifPresent(session -> {
            session.setActive(false);
            sessionRepository.save(session);
        });
    }
}