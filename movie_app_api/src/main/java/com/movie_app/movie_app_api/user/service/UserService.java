package com.movie_app.movie_app_api.user.service;

import com.movie_app.movie_app_api.user.dto.request.UpdateUserRequest;
import com.movie_app.movie_app_api.user.dto.response.UserResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface UserService {
    // Current user account methods
    UserResponse getMe(String keycloakId);
    com.movie_app.movie_app_api.user.dto.response.UserSummaryResponse getUserSummary(String keycloakId);
    UserResponse updateUser(String keycloakId, UpdateUserRequest request);
    void removeAvatar(String keycloakId);
    void deleteAccount(String keycloakId);

    // Administrative user management methods
    UserResponse getUserById(UUID id);
    List<UserResponse> searchUserByEmail(String email);
    Page<UserResponse> getAllUsers(Pageable pageable, String role);
    Page<UserResponse> searchUsers(String query, Pageable pageable);
    void setUserActiveStatus(UUID userId, boolean active);
    UserResponse updateUserRole(UUID userId, String newRole);
    void deleteUserByAdmin(UUID userId);
}