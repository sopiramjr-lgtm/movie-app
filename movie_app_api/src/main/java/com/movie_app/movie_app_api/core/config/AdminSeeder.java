package com.movie_app.movie_app_api.core.config;

import com.movie_app.movie_app_api.profile.entity.Profile;
import com.movie_app.movie_app_api.profile.repository.ProfileRepository;
import com.movie_app.movie_app_api.user.entity.User;
import com.movie_app.movie_app_api.user.repository.UserRepository;
import com.movie_app.movie_app_api.subscription.entity.SubscriptionPlan;
import com.movie_app.movie_app_api.subscription.repository.SubscriptionPlanRepository;
import jakarta.ws.rs.core.Response;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.keycloak.admin.client.CreatedResponseUtil;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.resource.UserResource;
import org.keycloak.representations.idm.CredentialRepresentation;
import org.keycloak.representations.idm.RoleRepresentation;
import org.keycloak.representations.idm.UserRepresentation;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class AdminSeeder implements ApplicationRunner {

    private final Keycloak keycloak;
    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final SubscriptionPlanRepository subscriptionPlanRepository;

    @Value("${keycloak.realm:movie-app-realm}")
    private String realm;

    @Value("${app.admin.email:sornsophiram11@gmail.com}")
    private String adminEmail;

    @Value("${app.admin.password:password123}")
    private String adminPassword;

    @Value("${app.admin.name:Sorn Sophiram}")
    private String adminName;

    @Override
    public void run(ApplicationArguments args) {
        try {
            log.info("Checking & seeding default admin: {}", adminEmail);

            // 1. Ensure ROLE_ADMIN and ADMIN roles exist in Keycloak realm
            ensureRealmRole("ROLE_ADMIN");
            ensureRealmRole("ADMIN");
            ensureRealmRole("ROLE_USER");

            // 2. Ensure Keycloak user exists
            String keycloakId = ensureKeycloakAdminUser();

            // 3. Ensure Local Database User exists
            User dbUser = ensureLocalAdminUser(keycloakId);

            // 4. Ensure default Profile exists for this user
            ensureDefaultProfile(dbUser, keycloakId);

            // 5. Ensure default Subscription Plans exist
            ensureDefaultSubscriptionPlans();

            log.info("Default Admin ready: {} (Keycloak ID: {}, Role: {})", adminEmail, keycloakId, dbUser.getRole());
        } catch (Exception ex) {
            log.error("Failed to seed default admin: {}", ex.getMessage(), ex);
        }
    }

    private void ensureRealmRole(String roleName) {
        try {
            keycloak.realm(realm).roles().get(roleName).toRepresentation();
        } catch (Exception ex) {
            try {
                RoleRepresentation role = new RoleRepresentation();
                role.setName(roleName);
                role.setDescription("Auto-created role " + roleName);
                keycloak.realm(realm).roles().create(role);
                log.info("Created realm role: {}", roleName);
            } catch (Exception createEx) {
                log.warn("Could not create role {}: {}", roleName, createEx.getMessage());
            }
        }
    }

    private String ensureKeycloakAdminUser() {
        List<UserRepresentation> existing = keycloak.realm(realm).users().searchByEmail(adminEmail, true);
        String keycloakId;

        if (existing.isEmpty()) {
            UserRepresentation user = new UserRepresentation();
            user.setUsername(adminEmail);
            user.setEmail(adminEmail);
            String[] names = adminName.trim().split("\\s+", 2);
            user.setFirstName(names[0]);
            user.setLastName(names.length > 1 ? names[1] : "");
            user.setEnabled(true);
            user.setEmailVerified(true);

            try (Response response = keycloak.realm(realm).users().create(user)) {
                if (response.getStatus() == 201) {
                    keycloakId = CreatedResponseUtil.getCreatedId(response);
                    log.info("Created Keycloak admin user: {} (ID: {})", adminEmail, keycloakId);
                } else {
                    throw new RuntimeException("Failed to create admin in Keycloak. HTTP " + response.getStatus());
                }
            }
        } else {
            keycloakId = existing.get(0).getId();
            UserResource userResource = keycloak.realm(realm).users().get(keycloakId);
            UserRepresentation userRep = existing.get(0);
            userRep.setEmailVerified(true);
            userRep.setEnabled(true);
            userResource.update(userRep);
        }

        // Set password
        CredentialRepresentation credential = new CredentialRepresentation();
        credential.setType(CredentialRepresentation.PASSWORD);
        credential.setValue(adminPassword);
        credential.setTemporary(false);
        keycloak.realm(realm).users().get(keycloakId).resetPassword(credential);

        // Assign roles: ROLE_ADMIN, ADMIN, ROLE_USER
        assignRoleToUser(keycloakId, "ROLE_ADMIN");
        assignRoleToUser(keycloakId, "ADMIN");
        assignRoleToUser(keycloakId, "ROLE_USER");

        return keycloakId;
    }

    private void assignRoleToUser(String userId, String roleName) {
        try {
            UserResource user = keycloak.realm(realm).users().get(userId);
            RoleRepresentation role = keycloak.realm(realm).roles().get(roleName).toRepresentation();
            user.roles().realmLevel().add(Collections.singletonList(role));
        } catch (Exception ex) {
            log.warn("Could not assign role {} to user {}: {}", roleName, userId, ex.getMessage());
        }
    }

    private User ensureLocalAdminUser(String keycloakId) {
        return userRepository.findByEmail(adminEmail)
                .map(existing -> {
                    existing.setKeycloakId(keycloakId);
                    existing.setRole("ROLE_ADMIN");
                    existing.setEmailVerified(true);
                    existing.setActive(true);
                    if (existing.getDisplayName() == null || existing.getDisplayName().isBlank()) {
                        existing.setDisplayName(adminName);
                    }
                    return userRepository.saveAndFlush(existing);
                })
                .orElseGet(() -> {
                    User newAdmin = User.builder()
                            .keycloakId(keycloakId)
                            .email(adminEmail)
                            .displayName(adminName)
                            .role("ROLE_ADMIN")
                            .emailVerified(true)
                            .active(true)
                            .build();
                    return userRepository.saveAndFlush(newAdmin);
                });
    }

    private void ensureDefaultProfile(User user, String keycloakId) {
        List<Profile> profiles = profileRepository.findByUser_KeycloakId(keycloakId);
        if (profiles.isEmpty()) {
            Profile adminProfile = Profile.builder()
                    .user(user)
                    .name(adminName != null && !adminName.isBlank() ? adminName : "Admin")
                    .isKids(false)
                    .preferredLanguage("en")
                    .build();
            profileRepository.saveAndFlush(adminProfile);
            log.info("Created default profile for admin user");
        }
    }

    private void ensureDefaultSubscriptionPlans() {
        List<SubscriptionPlan> defaultPlans = List.of(
                SubscriptionPlan.builder()
                        .name("Basic Single-Screen")
                        .priceCents(499)
                        .maxVideoQuality("720p HD")
                        .maxConcurrentStreams(1)
                        .build(),
                SubscriptionPlan.builder()
                        .name("Standard Cinema HD")
                        .priceCents(999)
                        .maxVideoQuality("1080p FHD")
                        .maxConcurrentStreams(2)
                        .build(),
                SubscriptionPlan.builder()
                        .name("VIP Ultra 4K Premiere")
                        .priceCents(1499)
                        .maxVideoQuality("4K UHD + HDR")
                        .maxConcurrentStreams(4)
                        .build(),
                SubscriptionPlan.builder()
                        .name("Family & Friends Pass")
                        .priceCents(1999)
                        .maxVideoQuality("4K UHD + Dolby Atmos")
                        .maxConcurrentStreams(6)
                        .build()
        );

        for (SubscriptionPlan plan : defaultPlans) {
            if (!subscriptionPlanRepository.existsByNameIgnoreCase(plan.getName())) {
                subscriptionPlanRepository.save(plan);
                log.info("Seeded default subscription plan: {}", plan.getName());
            }
        }
    }
}
