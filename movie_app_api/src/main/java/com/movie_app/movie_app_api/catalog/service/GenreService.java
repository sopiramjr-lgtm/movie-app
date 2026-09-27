package com.movie_app.movie_app_api.catalog.service;

import com.movie_app.movie_app_api.catalog.dto.request.GenreRequest;
import com.movie_app.movie_app_api.catalog.dto.response.GenreResponse;
import java.util.List;
import java.util.UUID;

public interface GenreService {
    GenreResponse createGenre(GenreRequest request);
    GenreResponse updateGenre(UUID id, GenreRequest request);
    List<GenreResponse> getAllGenres();
    void deleteGenre(UUID id); // Changed to UUID
}