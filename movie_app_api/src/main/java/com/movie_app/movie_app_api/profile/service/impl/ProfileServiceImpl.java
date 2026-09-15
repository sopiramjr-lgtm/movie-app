package com.movie_app.movie_app_api.profile.service.impl;

import com.movie_app.movie_app_api.core.exception.ResourceNotFoundException;
import com.movie_app.movie_app_api.profile.dto.request.ProfileRequest;
import com.movie_app.movie_app_api.profile.dto.response.ProfileResponse;
import com.movie_app.movie_app_api.profile.entity.Profile;
import com.movie_app.movie_app_api.profile.mapper.ProfileMapper;
import com.movie_app.movie_app_api.profile.repository.ProfileRepository;
import com.movie_app.movie_app_api.profile.service.ProfileService;
import com.movie_app.movie_app_api.user.entity.User;
import com.movie_app.movie_app_api.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProfileServiceImpl implements ProfileService {

    private final ProfileRepository profileRepository;
    private final UserRepository userRepository;
    private final ProfileMapper profileMapper;

    @Override
    @Transactional
    public ProfileResponse createProfile(String keycloakId, ProfileRequest request) {
        User user = userRepository.findByKeycloakId(keycloakId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Profile profile = Profile.builder()
                .user(user)
                .name(request.name())
                .avatarUrl(request.avatarUrl())
                .isKids(request.isKids())
                .preferredLanguage(request.preferredLanguage())
                .build();

        return profileMapper.toResponse(profileRepository.save(profile));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProfileResponse> getUserProfiles(String keycloakId) {
        return profileRepository.findByUser_KeycloakId(keycloakId).stream()
                .map(profileMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public ProfileResponse updateProfile(String keycloakId, UUID profileId, ProfileRequest request) {
        Profile profile = profileRepository.findByIdAndUser_KeycloakId(profileId, keycloakId)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found or access denied"));

        profile.setName(request.name());
        profile.setAvatarUrl(request.avatarUrl());
        profile.setKids(request.isKids());
        profile.setPreferredLanguage(request.preferredLanguage());

        return profileMapper.toResponse(profileRepository.save(profile));
    }

    @Override
    @Transactional
    public void deleteProfile(String keycloakId, UUID profileId) {
        Profile profile = profileRepository.findByIdAndUser_KeycloakId(profileId, keycloakId)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found or access denied"));

        profileRepository.delete(profile);
    }
}