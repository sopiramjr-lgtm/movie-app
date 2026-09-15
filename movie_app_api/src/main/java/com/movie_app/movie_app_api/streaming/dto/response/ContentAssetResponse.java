package com.movie_app.movie_app_api.streaming.dto.response;

import lombok.Builder;
import java.util.UUID;

@Builder
public record ContentAssetResponse(
        UUID id,
        UUID contentId,
        String assetType,
        String language,
        String url
) {}