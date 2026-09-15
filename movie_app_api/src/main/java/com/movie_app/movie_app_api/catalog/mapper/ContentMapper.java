package com.movie_app.movie_app_api.catalog.mapper;

import com.movie_app.movie_app_api.catalog.dto.response.ContentResponse;
import com.movie_app.movie_app_api.catalog.entity.Content;
import com.movie_app.movie_app_api.catalog.entity.Genre;
import org.springframework.stereotype.Component;
import java.util.stream.Collectors;

@Component
public class ContentMapper {

    public ContentResponse toResponse(Content content) {
        if (content == null) return null;

        return ContentResponse.builder()
                .id(content.getId())
                .contentType(content.getContentType())
                .title(content.getTitle())
                .description(content.getDescription())
                .releaseYear(content.getReleaseYear())
                .maturityRating(content.getMaturityRating())
                .durationMinutes(content.getDurationMinutes())
                .posterUrl(content.getPosterUrl())
                .videoUrl(content.getVideoUrl())
                .trailerUrl(content.getTrailerUrl())
                .averageRating(content.getAverageRating())
                .genres(content.getGenres().stream().map(Genre::getName).collect(Collectors.toSet()))
                .build();
    }
}