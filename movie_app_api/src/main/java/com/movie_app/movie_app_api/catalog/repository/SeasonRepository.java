package com.movie_app.movie_app_api.catalog.repository;

import com.movie_app.movie_app_api.catalog.entity.Season;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface SeasonRepository extends JpaRepository<Season, UUID> {
    List<Season> findByContentIdOrderBySeasonNumberAsc(UUID contentId);
}