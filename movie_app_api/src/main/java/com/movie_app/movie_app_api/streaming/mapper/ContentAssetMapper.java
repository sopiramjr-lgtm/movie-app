package com.movie_app.movie_app_api.streaming.mapper;

import com.movie_app.movie_app_api.streaming.dto.response.ContentAssetResponse;
import com.movie_app.movie_app_api.streaming.entity.ContentAsset;
import org.springframework.stereotype.Component;

@Component
public class ContentAssetMapper {
    public ContentAssetResponse toResponse(ContentAsset asset) {
        if (asset == null) return null;

        return ContentAssetResponse.builder()
                .id(asset.getId())
                .contentId(asset.getContent().getId())
                .assetType(asset.getAssetType())
                .language(asset.getLanguage())
                .url(asset.getUrl())
                .build();
    }
}