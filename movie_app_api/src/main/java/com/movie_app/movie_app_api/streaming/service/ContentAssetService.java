package com.movie_app.movie_app_api.streaming.service;

import com.movie_app.movie_app_api.streaming.dto.request.ContentAssetRequest;
import com.movie_app.movie_app_api.streaming.dto.response.ContentAssetResponse;

import java.util.List;
import java.util.UUID;

public interface ContentAssetService {
    ContentAssetResponse addAsset(ContentAssetRequest request);
    List<ContentAssetResponse> getAssetsByContentId(UUID contentId);
    void deleteAsset(UUID id);
}