package com.movie_app.movie_app_api.catalog.service.impl;

import com.movie_app.movie_app_api.catalog.dto.request.ContentRequest;
import com.movie_app.movie_app_api.catalog.dto.response.ContentResponse;
import com.movie_app.movie_app_api.catalog.entity.Content;
import com.movie_app.movie_app_api.catalog.entity.Genre;
import com.movie_app.movie_app_api.catalog.mapper.ContentMapper;
import com.movie_app.movie_app_api.catalog.repository.ContentRepository;
import com.movie_app.movie_app_api.catalog.repository.GenreRepository;
import com.movie_app.movie_app_api.catalog.service.ContentService;
import com.movie_app.movie_app_api.core.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ContentServiceImpl implements ContentService {

    private final ContentRepository contentRepository;
    private final GenreRepository genreRepository;
    private final ContentMapper contentMapper;

    @Override
    @Transactional
    public ContentResponse createContent(ContentRequest request) {
        Content content = Content.builder()
                .contentType(request.contentType())
                .title(request.title())
                .description(request.description())
                .releaseYear(request.releaseYear())
                .maturityRating(request.maturityRating())
                .durationMinutes(request.durationMinutes())
                .posterUrl(request.posterUrl())
                .videoUrl(request.videoUrl())
                .trailerUrl(request.trailerUrl())
                .averageRating(0.0) // Default rating
                .build();

        if (request.genreIds() != null && !request.genreIds().isEmpty()) {
            List<Genre> genres = genreRepository.findAllById(request.genreIds());
            content.setGenres(new HashSet<>(genres));
        }

        content = contentRepository.save(content);
        return contentMapper.toResponse(content);
    }

    @Override
    @Transactional(readOnly = true)
    public ContentResponse getContentById(UUID id) {
        Content content = contentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Content not found with ID: " + id));
        return contentMapper.toResponse(content);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ContentResponse> getAllContent(int page, int size, String type) {
        PageRequest pageRequest = PageRequest.of(page, size);
        Page<Content> contents;

        if (type != null && !type.isBlank()) {
            contents = contentRepository.findByContentType(type.toUpperCase(), pageRequest);
        } else {
            contents = contentRepository.findAll(pageRequest);
        }

        return contents.map(contentMapper::toResponse);
    }

    @Override
    @Transactional
    public ContentResponse updateContent(UUID id, ContentRequest request) {
        Content content = contentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Content not found with ID: " + id));

        content.setTitle(request.title());
        content.setDescription(request.description());
        content.setReleaseYear(request.releaseYear());
        content.setMaturityRating(request.maturityRating());
        content.setDurationMinutes(request.durationMinutes());
        content.setPosterUrl(request.posterUrl());
        content.setVideoUrl(request.videoUrl());
        content.setTrailerUrl(request.trailerUrl());

        if (request.genreIds() != null) {
            List<Genre> genres = genreRepository.findAllById(request.genreIds());
            content.setGenres(new HashSet<>(genres));
        }

        content = contentRepository.save(content);
        return contentMapper.toResponse(content);
    }

    @Override
    @Transactional
    public void deleteContent(UUID id) {
        Content content = contentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Content not found with ID: " + id));
        contentRepository.delete(content);
    }
}