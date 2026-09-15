package com.movie_app.movie_app_api.streaming.repository;

import com.movie_app.movie_app_api.streaming.entity.ContentAsset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ContentAssetRepository extends JpaRepository<ContentAsset, UUID> {
    List<ContentAsset> findByContentId(UUID contentId);
}