package com.movie_app.movie_app_api.streaming.service.impl;

import com.movie_app.movie_app_api.catalog.entity.Content;
import com.movie_app.movie_app_api.catalog.repository.ContentRepository;
import com.movie_app.movie_app_api.core.exception.ResourceNotFoundException;
import com.movie_app.movie_app_api.streaming.dto.request.ContentAssetRequest;
import com.movie_app.movie_app_api.streaming.dto.response.ContentAssetResponse;
import com.movie_app.movie_app_api.streaming.entity.ContentAsset;
import com.movie_app.movie_app_api.streaming.mapper.ContentAssetMapper;
import com.movie_app.movie_app_api.streaming.repository.ContentAssetRepository;
import com.movie_app.movie_app_api.streaming.service.ContentAssetService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ContentAssetServiceImpl implements ContentAssetService {

    private final ContentAssetRepository assetRepository;
    private final ContentRepository contentRepository;
    private final ContentAssetMapper mapper;

    @Override
    @Transactional
    public ContentAssetResponse addAsset(ContentAssetRequest request) {
        Content content = contentRepository.findById(request.contentId())
                .orElseThrow(() -> new ResourceNotFoundException("Content not found"));

        ContentAsset asset = ContentAsset.builder()
                .content(content)
                .assetType(request.assetType())
                .language(request.language())
                .url(request.url())
                .build();

        return mapper.toResponse(assetRepository.save(asset));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ContentAssetResponse> getAssetsByContentId(UUID contentId) {
        return assetRepository.findByContentId(contentId).stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public void deleteAsset(UUID id) {
        ContentAsset asset = assetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Content asset not found"));
        assetRepository.delete(asset);
    }
}