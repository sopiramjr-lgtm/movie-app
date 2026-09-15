package com.movie_app.movie_app_api.profile.mapper;

import com.movie_app.movie_app_api.profile.dto.response.ProfileResponse;
import com.movie_app.movie_app_api.profile.entity.Profile;
import org.springframework.stereotype.Component;

@Component
public class ProfileMapper {
    public ProfileResponse toResponse(Profile profile) {
        if (profile == null) return null;
        return ProfileResponse.builder()
                .id(profile.getId())
                .name(profile.getName())
                .avatarUrl(profile.getAvatarUrl())
                .isKids(profile.isKids())
                .preferredLanguage(profile.getPreferredLanguage())
                .build();
    }
}