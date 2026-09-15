package com.movie_app.movie_app_api.profile.service;

import com.movie_app.movie_app_api.profile.dto.request.ProfileRequest;
import com.movie_app.movie_app_api.profile.dto.response.ProfileResponse;
import java.util.List;
import java.util.UUID;

public interface ProfileService {
    ProfileResponse createProfile(String keycloakId, ProfileRequest request);
    List<ProfileResponse> getUserProfiles(String keycloakId);
    ProfileResponse updateProfile(String keycloakId, UUID profileId, ProfileRequest request);
    void deleteProfile(String keycloakId, UUID profileId);
}