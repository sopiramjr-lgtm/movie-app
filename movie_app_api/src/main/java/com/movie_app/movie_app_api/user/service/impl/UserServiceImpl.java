package com.movie_app.movie_app_api.user.service.impl;

import com.movie_app.movie_app_api.core.exception.BadRequestException;
import com.movie_app.movie_app_api.core.exception.ResourceNotFoundException;
import com.movie_app.movie_app_api.user.dto.request.UpdateUserRequest;
import com.movie_app.movie_app_api.user.dto.response.UserResponse;
import com.movie_app.movie_app_api.user.entity.User;
import com.movie_app.movie_app_api.user.mapper.UserMapper;
import com.movie_app.movie_app_api.user.repository.UserRepository;
import com.movie_app.movie_app_api.user.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.keycloak.admin.client.Keycloak;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final Keycloak keycloak;
    private final com.movie_app.movie_app_api.subscription.repository.SubscriptionRepository subscriptionRepository;
    private final com.movie_app.movie_app_api.profile.repository.ProfileRepository profileRepository;
    private final com.movie_app.movie_app_api.notification.repository.NotificationRepository notificationRepository;

    @Value("${keycloak.realm}")
    private String realm;

    @Override
    @Transactional(readOnly = true)
    public UserResponse getMe(String keycloakId) {
        User user = userRepository.findByKeycloakId(keycloakId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return userMapper.toResponse(user);
    }

    @Override
    @Transactional(readOnly = true)
    public com.movie_app.movie_app_api.user.dto.response.UserSummaryResponse getUserSummary(String keycloakId) {
        User user = userRepository.findByKeycloakId(keycloakId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        var subscriptions = subscriptionRepository.findByUser_KeycloakId(keycloakId);
        var activeSubOpt = subscriptions.stream()
                .filter(s -> "ACTIVE".equalsIgnoreCase(s.getStatus()))
                .findFirst();

        String activePlanName = activeSubOpt.map(s -> s.getPlan() != null ? s.getPlan().getName() : null).orElse(null);
        boolean hasActiveSubscription = activeSubOpt.isPresent();

        int profileCount = profileRepository.findByUser_KeycloakId(keycloakId).size();
        int unreadNotifications = notificationRepository.countByUser_KeycloakIdAndIsReadFalse(keycloakId);

        return com.movie_app.movie_app_api.user.dto.response.UserSummaryResponse.builder()
                .user(userMapper.toResponse(user))
                .activePlanName(activePlanName)
                .hasActiveSubscription(hasActiveSubscription)
                .profileCount(profileCount)
                .unreadNotificationsCount(unreadNotifications)
                .build();
    }

    @Override
    @Transactional
    public UserResponse updateUser(String keycloakId, UpdateUserRequest request) {
        User user = userRepository.findByKeycloakId(keycloakId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setDisplayName(request.displayName());
        user.setAvatarUrl(request.avatarUrl());
        userRepository.save(user);

        return userMapper.toResponse(user);
    }

    @Override
    @Transactional
    public void removeAvatar(String keycloakId) {
        User user = userRepository.findByKeycloakId(keycloakId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setAvatarUrl(null);
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void deleteAccount(String keycloakId) {
        User user = userRepository.findByKeycloakId(keycloakId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        userRepository.delete(user);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserById(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));
        return userMapper.toResponse(user);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> searchUserByEmail(String email) {
        return userRepository.findByEmailContainingIgnoreCase(email)
                .stream()
                .map(userMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UserResponse> getAllUsers(Pageable pageable, String role) {
        Page<User> users;
        if (role != null && !role.isBlank()) {
            users = userRepository.findByRole(role.toUpperCase().startsWith("ROLE_") ? role.toUpperCase() : "ROLE_" + role.toUpperCase(), pageable);
        } else {
            users = userRepository.findAll(pageable);
        }
        return users.map(userMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UserResponse> searchUsers(String query, Pageable pageable) {
        if (query == null || query.isBlank()) {
            return userRepository.findAll(pageable).map(userMapper::toResponse);
        }
        return userRepository.findByEmailContainingIgnoreCaseOrDisplayNameContainingIgnoreCase(query, query, pageable)
                .map(userMapper::toResponse);
    }

    @Override
    @Transactional
    public void setUserActiveStatus(UUID userId, boolean active) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        user.setActive(active);
        userRepository.save(user);

        // Synchronize with Keycloak enabled state
        if (user.getKeycloakId() != null) {
            try {
                var userResource = keycloak.realm(realm).users().get(user.getKeycloakId());
                var rep = userResource.toRepresentation();
                rep.setEnabled(active);
                userResource.update(rep);
                log.info("Keycloak account status updated to enabled={} for user {}", active, user.getKeycloakId());
            } catch (Exception ex) {
                log.warn("Could not sync user status to Keycloak for user {}: {}", user.getKeycloakId(), ex.getMessage());
            }
        }
    }

    @Override
    @Transactional
    public UserResponse updateUserRole(UUID userId, String newRole) {
        if (newRole == null || newRole.isBlank()) {
            throw new BadRequestException("Role cannot be empty");
        }
        String formattedRole = newRole.toUpperCase().startsWith("ROLE_") ? newRole.toUpperCase() : "ROLE_" + newRole.toUpperCase();

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        user.setRole(formattedRole);
        user = userRepository.save(user);

        // Sync role in Keycloak
        if (user.getKeycloakId() != null) {
            try {
                var userResource = keycloak.realm(realm).users().get(user.getKeycloakId());
                var roleRep = keycloak.realm(realm).roles().get(formattedRole).toRepresentation();
                userResource.roles().realmLevel().add(List.of(roleRep));
                log.info("Assigned Keycloak role {} to user {}", formattedRole, user.getKeycloakId());
            } catch (Exception ex) {
                log.warn("Could not sync Keycloak role for user {}: {}", user.getKeycloakId(), ex.getMessage());
            }
        }

        return userMapper.toResponse(user);
    }

    @Override
    @Transactional
    public void deleteUserByAdmin(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        String keycloakId = user.getKeycloakId();
        userRepository.delete(user);

        if (keycloakId != null) {
            try {
                keycloak.realm(realm).users().delete(keycloakId);
                log.info("Deleted user from Keycloak: {}", keycloakId);
            } catch (Exception ex) {
                log.warn("Could not delete user from Keycloak {}: {}", keycloakId, ex.getMessage());
            }
        }
    }
}