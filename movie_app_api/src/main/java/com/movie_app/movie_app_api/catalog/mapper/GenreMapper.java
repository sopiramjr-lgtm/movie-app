package com.movie_app.movie_app_api.catalog.mapper;

import com.movie_app.movie_app_api.catalog.dto.response.GenreResponse;
import com.movie_app.movie_app_api.catalog.entity.Genre;
import org.springframework.stereotype.Component;

@Component
public class GenreMapper {
    public GenreResponse toResponse(Genre genre) {
        if (genre == null) {
            return null;
        }
        return GenreResponse.builder()
                .id(genre.getId())
                .name(genre.getName())
                .build();
    }
}