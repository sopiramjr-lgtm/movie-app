package com.movie_app.movie_app_api.auth.service.impl;

import com.movie_app.movie_app_api.core.exception.BadRequestException;
import com.movie_app.movie_app_api.core.exception.ResourceNotFoundException;
import com.movie_app.movie_app_api.core.exception.UnauthorizedException;
import com.movie_app.movie_app_api.auth.dto.request.*;
import com.movie_app.movie_app_api.auth.dto.response.KeycloakTokenResponse;
import com.movie_app.movie_app_api.auth.dto.response.LoginResponse;
import com.movie_app.movie_app_api.auth.dto.response.SignUpResponse;
import com.movie_app.movie_app_api.auth.service.AuthService;
import com.movie_app.movie_app_api.user.entity.User;
import com.movie_app.movie_app_api.user.mapper.UserMapper;
import com.movie_app.movie_app_api.user.repository.UserRepository;
import jakarta.ws.rs.core.Response;
import org.keycloak.admin.client.CreatedResponseUtil;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.resource.UserResource;
import org.keycloak.representations.idm.CredentialRepresentation;
import org.keycloak.representations.idm.UserRepresentation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {

    private final Keycloak keycloak;
    private final RestClient keycloakRestClient;
    private final UserRepository userRepository;
    private final UserMapper userMapper;

    @Value("${keycloak.realm}")
    private String realm;

    @Value("${keycloak.client-id}")
    private String clientId;

    @Value("${keycloak.client-secret}")
    private String clientSecret;

    @Value("${keycloak.default-role:ROLE_USER}")
    private String defaultRole;

    @Override
    @Transactional
    public SignUpResponse signup(SignUpRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new BadRequestException("Email is already registered");
        }
        
        UserRepresentation userRepresentation = buildUserRepresentation(request);

        try (Response response = keycloak.realm(realm).users().create(userRepresentation)) {
            if (response.getStatus() == 409) {
                // If Keycloak user exists but local DB record is missing (orphaned), repair and complete registration
                var localUserOpt = userRepository.findByEmail(request.email());
                if (localUserOpt.isEmpty()) {
                    var kcUsers = keycloak.realm(realm).users().searchByEmail(request.email(), true);
                    if (!kcUsers.isEmpty()) {
                        String existingKcId = kcUsers.get(0).getId();
                        log.info("Repairing registration for orphaned Keycloak user: {} ({})", request.email(), existingKcId);
                        setUserPassword(existingKcId, request.password());
                        User newUser = User.builder()
                                .keycloakId(existingKcId)
                                .displayName(request.fullName())
                                .email(request.email())
                                .role("ROLE_USER")
                                .emailVerified(true)
                                .active(true)
                                .build();
                        userRepository.saveAndFlush(newUser);
                        assignDefaultRole(existingKcId);

                        return SignUpResponse.builder()
                                .id(existingKcId)
                                .name(request.fullName())
                                .email(request.email())
                                .build();
                    }
                }
                throw new BadRequestException("Email is already registered");
            }

            if (response.getStatus() != 201) {
                throw new RuntimeException("Keycloak returned status: " + response.getStatus());
            }

            String keycloakId = CreatedResponseUtil.getCreatedId(response);

            User user = User.builder()
                    .keycloakId(keycloakId)
                    .displayName(request.fullName())
                    .email(request.email())
                    .role("ROLE_USER")
                    .emailVerified(false)
                    .active(true)
                    .build();

            try {
                userRepository.saveAndFlush(user);
                setUserPassword(keycloakId, request.password());
                assignDefaultRole(keycloakId);
                sendKeycloakVerifyEmail(keycloakId);
            } catch (Exception ex) {
                // Rollback: remove Keycloak user to avoid orphaned accounts
                log.error("Signup post-processing failed for keycloakId={}, rolling back Keycloak user", keycloakId, ex);
                try {
                    keycloak.realm(realm).users().delete(keycloakId);
                } catch (Exception cleanupEx) {
                    log.error("Failed to clean up Keycloak user {} after signup failure", keycloakId, cleanupEx);
                }
                throw new RuntimeException("Cannot create account. Please try again: " + ex.getMessage());
            }

            return SignUpResponse.builder()
                    .id(keycloakId)
                    .name(request.fullName())
                    .email(request.email())
                    .build();

        } catch (BadRequestException ex) {
            throw ex;
        } catch (Exception ex) {
            log.error("Create user failed", ex);
            throw new RuntimeException("Cannot create account: " + ex.getMessage());
        }
    }

    private UserRepresentation buildUserRepresentation(SignUpRequest request) {
        String[] names = request.fullName().trim().split("\\s+", 2);
        UserRepresentation user = new UserRepresentation();
        user.setUsername(request.email());
        user.setEmail(request.email());
        user.setFirstName(names[0]);
        user.setLastName(names.length > 1 ? names[1] : "");
        user.setEnabled(true);
        user.setEmailVerified(false);
        return user;
    }

    private void sendKeycloakVerifyEmail(String userId) {
        try {
            keycloak.realm(realm).users().get(userId).executeActionsEmail(List.of("VERIFY_EMAIL"));
            log.info("Dispatched verification email for Keycloak user {}", userId);
        } catch (Exception ex) {
            log.warn("Could not dispatch Keycloak verification email to user {}: {}", userId, ex.getMessage());
        }
    }

    private void assignDefaultRole(String userId) {
        try {
            UserResource user = keycloak.realm(realm).users().get(userId);
            var role = keycloak.realm(realm).roles().get(defaultRole).toRepresentation();
            user.roles().realmLevel().add(List.of(role));
        } catch (Exception ex) {
            try {
                String fallback = defaultRole.startsWith("ROLE_") ? defaultRole.substring(5) : "ROLE_" + defaultRole;
                UserResource user = keycloak.realm(realm).users().get(userId);
                var role = keycloak.realm(realm).roles().get(fallback).toRepresentation();
                user.roles().realmLevel().add(List.of(role));
            } catch (Exception fallbackEx) {
                log.warn("Cannot assign default role {} to user {}: {}", defaultRole, userId, ex.getMessage());
            }
        }
    }

    @Override
    public LoginResponse login(LoginRequest request) {
        UserRepresentation user = keycloak.realm(realm).users().searchByEmail(request.email(), true)
                .stream().findFirst()
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        if (!Boolean.TRUE.equals(user.isEmailVerified())) {
            throw new UnauthorizedException("Please verify your email first");
        }

        KeycloakTokenResponse token = requestToken("password", Map.of(
                "username", request.email(),
                "password", request.password()
        ));

        // Ensure user is provisioned in local database so user queries never fail
        User localUser = userRepository.findByKeycloakId(user.getId())
                .or(() -> userRepository.findByEmail(request.email()))
                .map(existing -> {
                    if (existing.getKeycloakId() == null) {
                        existing.setKeycloakId(user.getId());
                    }
                    if (existing.getDisplayName() == null && user.getFirstName() != null) {
                        String name = (user.getFirstName() + " " + (user.getLastName() != null ? user.getLastName() : "")).trim();
                        if (!name.isEmpty()) existing.setDisplayName(name);
                    }
                    return userRepository.save(existing);
                })
                .orElseGet(() -> {
                    String fullName = (user.getFirstName() != null ? (user.getFirstName() + " " + (user.getLastName() != null ? user.getLastName() : "")) : request.email()).trim();
                    User newUser = User.builder()
                            .keycloakId(user.getId())
                            .email(request.email())
                            .displayName(fullName.isEmpty() ? request.email() : fullName)
                            .role("ROLE_USER")
                            .emailVerified(true)
                            .active(true)
                            .build();
                    return userRepository.save(newUser);
                });

        return LoginResponse.builder()
                .accessToken(token.accessToken())
                .refreshToken(token.refreshToken())
                .expiresIn(token.expiresIn())
                .refreshExpiresIn(token.refreshExpiresIn())
                .tokenType(token.tokenType())
                .user(userMapper.toResponse(localUser))
                .build();
    }

    private KeycloakTokenResponse requestToken(String grantType, Map<String, String> params) {
        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("grant_type", grantType);
        form.add("client_id", clientId);
        form.add("client_secret", clientSecret);
        params.forEach(form::add);

        try {
            return keycloakRestClient.post()
                    .uri("/realms/{realm}/protocol/openid-connect/token", realm)
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .body(form)
                    .retrieve()
                    .body(KeycloakTokenResponse.class);
        } catch (RestClientResponseException ex) {
            throw new UnauthorizedException("Invalid email or password");
        }
    }

    @Override
    public void forgotPassword(ForgotPasswordRequest request) {
        UserRepresentation user = keycloak.realm(realm).users().searchByEmail(request.email(), true)
                .stream().findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        keycloak.realm(realm).users().get(user.getId()).executeActionsEmail(List.of("UPDATE_PASSWORD"));
    }

    @Override
    public void changePassword(String keycloakId, ChangePasswordRequest request) {
        if (!request.newPassword().equals(request.confirmedPassword())) {
            throw new BadRequestException("Passwords do not match");
        }

        UserResource userResource = keycloak.realm(realm).users().get(keycloakId);
        UserRepresentation user = userResource.toRepresentation();

        // Verify current password via Token endpoint
        requestToken("password", Map.of(
                "username", user.getUsername(),
                "password", request.currentPassword()
        ));

        setUserPassword(keycloakId, request.newPassword());
    }

    @Override
    public void verifyEmail(VerifyEmailRequest request) {
        UserRepresentation user = keycloak.realm(realm).users().searchByEmail(request.email(), true)
                .stream().findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (Boolean.TRUE.equals(user.isEmailVerified())) {
            throw new BadRequestException("Email already verified");
        }

        sendKeycloakVerifyEmail(user.getId());
    }

    @Override
    public void logout(String refreshToken) {
        MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
        form.add("client_id", clientId);
        form.add("client_secret", clientSecret);
        form.add("refresh_token", refreshToken);

        try {
            keycloakRestClient.post()
                    .uri("/realms/{realm}/protocol/openid-connect/revoke", realm)
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .body(form)
                    .retrieve()
                    .toBodilessEntity();
        } catch (Exception ex) {
            log.warn("Failed to revoke token in Keycloak: {}", ex.getMessage());
        }
    }

    private void setUserPassword(String userId, String password) {
        CredentialRepresentation credential = new CredentialRepresentation();
        credential.setType(CredentialRepresentation.PASSWORD);
        credential.setValue(password);
        credential.setTemporary(false);
        keycloak.realm(realm).users().get(userId).resetPassword(credential);
    }
}