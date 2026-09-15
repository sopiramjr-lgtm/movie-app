package com.movie_app.movie_app_api.catalog.mapper;

import com.movie_app.movie_app_api.catalog.dto.response.*;
import com.movie_app.movie_app_api.catalog.entity.*;
import org.springframework.stereotype.Component;
import java.util.stream.Collectors;

@Component
public class CatalogMapper {

    public PersonResponse toPersonResponse(Person person) {
        if (person == null) return null;
        return PersonResponse.builder()
                .id(person.getId()).name(person.getName())
                .profileImageUrl(person.getProfileImageUrl()).biography(person.getBiography()).build();
    }

    public EpisodeResponse toEpisodeResponse(Episode episode) {
        if (episode == null) return null;
        return EpisodeResponse.builder()
                .id(episode.getId()).seasonId(episode.getSeason().getId())
                .episodeNumber(episode.getEpisodeNumber()).title(episode.getTitle())
                .description(episode.getDescription()).durationMinutes(episode.getDurationMinutes())
                .thumbnailUrl(episode.getThumbnailUrl()).videoUrl(episode.getVideoUrl()).build();
    }

    public SeasonResponse toSeasonResponse(Season season) {
        if (season == null) return null;
        return SeasonResponse.builder()
                .id(season.getId()).contentId(season.getContent().getId())
                .seasonNumber(season.getSeasonNumber()).title(season.getTitle())
                .episodes(season.getEpisodes().stream().map(this::toEpisodeResponse).collect(Collectors.toList()))
                .build();
    }

    public CastMemberResponse toCastMemberResponse(CastMember cast) {
        if (cast == null) return null;
        return CastMemberResponse.builder()
                .id(cast.getId()).contentId(cast.getContent().getId())
                .person(toPersonResponse(cast.getPerson()))
                .role(cast.getRole()).characterName(cast.getCharacterName()).build();
    }
}