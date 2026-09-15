package com.movie_app.movie_app_api.catalog.service;

import com.movie_app.movie_app_api.catalog.dto.request.*;
import com.movie_app.movie_app_api.catalog.dto.response.*;
import com.movie_app.movie_app_api.catalog.entity.*;
import com.movie_app.movie_app_api.catalog.mapper.CatalogMapper;
import com.movie_app.movie_app_api.catalog.repository.*;
import com.movie_app.movie_app_api.core.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CatalogSupplementalService {

    private final PersonRepository personRepository;
    private final SeasonRepository seasonRepository;
    private final EpisodeRepository episodeRepository;
    private final CastMemberRepository castMemberRepository;
    private final ContentRepository contentRepository;
    private final CatalogMapper mapper;

    // --- PERSON METHODS ---
    @Transactional
    public PersonResponse createPerson(PersonRequest request) {
        Person person = Person.builder().name(request.name())
                .profileImageUrl(request.profileImageUrl()).biography(request.biography()).build();
        return mapper.toPersonResponse(personRepository.save(person));
    }

    @Transactional(readOnly = true)
    public List<PersonResponse> getAllPersons() {
        return personRepository.findAll().stream().map(mapper::toPersonResponse).collect(Collectors.toList());
    }

    // --- SEASON METHODS ---
    @Transactional
    public SeasonResponse createSeason(SeasonRequest request) {
        Content content = contentRepository.findById(request.contentId())
                .orElseThrow(() -> new ResourceNotFoundException("Content not found"));
        Season season = Season.builder().content(content)
                .seasonNumber(request.seasonNumber()).title(request.title()).build();
        return mapper.toSeasonResponse(seasonRepository.save(season));
    }

    @Transactional(readOnly = true)
    public List<SeasonResponse> getSeasonsByContentId(UUID contentId) {
        return seasonRepository.findByContentIdOrderBySeasonNumberAsc(contentId).stream()
                .map(mapper::toSeasonResponse)
                .collect(Collectors.toList());
    }

    // --- EPISODE METHODS ---
    @Transactional
    public EpisodeResponse createEpisode(EpisodeRequest request) {
        Season season = seasonRepository.findById(request.seasonId())
                .orElseThrow(() -> new ResourceNotFoundException("Season not found"));
        Episode episode = Episode.builder().season(season)
                .episodeNumber(request.episodeNumber()).title(request.title())
                .description(request.description()).durationMinutes(request.durationMinutes())
                .thumbnailUrl(request.thumbnailUrl()).videoUrl(request.videoUrl()).build();
        return mapper.toEpisodeResponse(episodeRepository.save(episode));
    }

    @Transactional(readOnly = true)
    public List<EpisodeResponse> getEpisodesBySeasonId(UUID seasonId) {
        return episodeRepository.findBySeasonIdOrderByEpisodeNumberAsc(seasonId).stream()
                .map(mapper::toEpisodeResponse)
                .collect(Collectors.toList());
    }

    // --- CAST MEMBER METHODS ---
    @Transactional
    public CastMemberResponse addCastMember(CastMemberRequest request) {
        Content content = contentRepository.findById(request.contentId())
                .orElseThrow(() -> new ResourceNotFoundException("Content not found"));
        Person person = personRepository.findById(request.personId())
                .orElseThrow(() -> new ResourceNotFoundException("Person not found"));

        CastMember cast = CastMember.builder().content(content).person(person)
                .role(request.role()).characterName(request.characterName()).build();
        return mapper.toCastMemberResponse(castMemberRepository.save(cast));
    }

    @Transactional(readOnly = true)
    public List<CastMemberResponse> getCastByContentId(UUID contentId) {
        return castMemberRepository.findByContentId(contentId).stream()
                .map(mapper::toCastMemberResponse).collect(Collectors.toList());
    }

    @Transactional
    public void deleteEntity(UUID id, String type) {
        switch (type.toUpperCase()) {
            case "PERSON" -> personRepository.deleteById(id);
            case "SEASON" -> seasonRepository.deleteById(id);
            case "EPISODE" -> episodeRepository.deleteById(id);
            case "CAST" -> castMemberRepository.deleteById(id);
            default -> throw new IllegalArgumentException("Invalid type");
        }
    }
}