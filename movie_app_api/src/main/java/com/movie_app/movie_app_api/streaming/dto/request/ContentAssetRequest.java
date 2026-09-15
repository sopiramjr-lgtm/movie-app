package com.movie_app.movie_app_api.streaming.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record ContentAssetRequest(
        @NotNull(message = "Content ID is required") UUID contentId,
        @NotBlank(message = "Asset type is required (SUBTITLE/AUDIO)") String assetType,
        @NotBlank(message = "Language is required") String language,
        @NotBlank(message = "URL is required") String url
) {}