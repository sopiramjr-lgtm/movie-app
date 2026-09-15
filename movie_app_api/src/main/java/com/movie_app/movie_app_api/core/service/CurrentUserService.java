package com.movie_app.movie_app_api.core.service;

import com.movie_app.movie_app_api.core.exception.UnauthorizedException;
import com.movie_app.movie_app_api.user.entity.User;
import com.movie_app.movie_app_api.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.representations.idm.UserRepresentation;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class CurrentUserService {

    private final UserRepository userRepository;
    private final Keycloak keycloak;

    @Value("${keycloak.realm}")
    private String realm;

    public User requireCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new UnauthorizedException("User is not authenticated");
        }

        String keycloakId;
        if (authentication.getPrincipal() instanceof Jwt jwt) {
            keycloakId = jwt.getSubject();
        } else {
            keycloakId = authentication.getName();
        }

        return userRepository.findByKeycloakId(keycloakId)
                .orElseGet(() -> provisionUserFromKeycloak(keycloakId));
    }

    private User provisionUserFromKeycloak(String keycloakId) {
        log.info("User not found in local DB, provisioning from Keycloak: {}", keycloakId);

        UserRepresentation kcUser;
        try {
            kcUser = keycloak.realm(realm).users().get(keycloakId).toRepresentation();
        } catch (Exception e) {
            log.error("Failed to fetch user {} from Keycloak", keycloakId, e);
            throw new UnauthorizedException("Authenticated user profile does not exist locally.");
        }

        String email = kcUser.getEmail() != null ? kcUser.getEmail() : keycloakId + "@placeholder.com";
        String displayName = kcUser.getUsername() != null ? kcUser.getUsername() : email;

        return userRepository.findByEmail(email).map(existingUser -> {
            existingUser.setKeycloakId(keycloakId);
            return userRepository.save(existingUser);
        }).orElseGet(() -> {
            User newUser = User.builder()
                    .keycloakId(keycloakId)
                    .email(email)
                    .displayName(displayName)
                    .role("ROLE_USER")
                    .emailVerified(kcUser.isEmailVerified() != null ? kcUser.isEmailVerified() : false)
                    .build();
            userRepository.save(newUser);
            log.info("Successfully provisioned user in DB: {} ({})", email, keycloakId);
            return newUser;
        });
    }

    public boolean isAdmin() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null && authentication.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equalsIgnoreCase("ROLE_ADMIN"));
    }
}
