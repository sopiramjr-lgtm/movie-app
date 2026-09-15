package com.movie_app.movie_app_api.catalog.service;

import com.movie_app.movie_app_api.catalog.dto.request.ContentRequest;
import com.movie_app.movie_app_api.catalog.dto.response.ContentResponse;
import org.springframework.data.domain.Page;
import java.util.UUID;

public interface ContentService {
    ContentResponse createContent(ContentRequest request);
    ContentResponse getContentById(UUID id); // Changed to UUID
    Page<ContentResponse> getAllContent(int page, int size, String type);
    ContentResponse updateContent(UUID id, ContentRequest request); // Changed to UUID
    void deleteContent(UUID id); // Changed to UUID
}