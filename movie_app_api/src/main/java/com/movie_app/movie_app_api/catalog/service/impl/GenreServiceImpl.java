package com.movie_app.movie_app_api.catalog.service.impl;

import com.movie_app.movie_app_api.catalog.dto.request.GenreRequest;
import com.movie_app.movie_app_api.catalog.dto.response.GenreResponse;
import com.movie_app.movie_app_api.catalog.entity.Genre;
import com.movie_app.movie_app_api.catalog.mapper.GenreMapper;
import com.movie_app.movie_app_api.catalog.repository.GenreRepository;
import com.movie_app.movie_app_api.catalog.service.GenreService;
import com.movie_app.movie_app_api.core.exception.BadRequestException;
import com.movie_app.movie_app_api.core.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GenreServiceImpl implements GenreService {

    private final GenreRepository genreRepository;
    private final GenreMapper genreMapper;

    @Override
    @Transactional
    public GenreResponse createGenre(GenreRequest request) {
        if (genreRepository.existsByNameIgnoreCase(request.name())) {
            throw new BadRequestException("Genre with this name already exists!");
        }

        Genre genre = Genre.builder()
                .name(request.name())
                .build();

        genre = genreRepository.save(genre);
        return genreMapper.toResponse(genre);
    }

    @Override
    @Transactional(readOnly = true)
    public List<GenreResponse> getAllGenres() {
        return genreRepository.findAll().stream()
                .map(genreMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public GenreResponse updateGenre(UUID id, GenreRequest request) {
        Genre genre = genreRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Genre not found with id: " + id));

        if (!genre.getName().equalsIgnoreCase(request.name()) && genreRepository.existsByNameIgnoreCase(request.name())) {
            throw new BadRequestException("Genre with name '" + request.name() + "' already exists!");
        }

        genre.setName(request.name());
        genre = genreRepository.save(genre);
        return genreMapper.toResponse(genre);
    }

    @Override
    @Transactional
    public void deleteGenre(UUID id) {
        if (!genreRepository.existsById(id)) {
            throw new ResourceNotFoundException("Genre not found with id: " + id);
        }
        genreRepository.deleteById(id);
    }
}