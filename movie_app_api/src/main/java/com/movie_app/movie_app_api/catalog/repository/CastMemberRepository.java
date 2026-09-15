package com.movie_app.movie_app_api.catalog.repository;

import com.movie_app.movie_app_api.catalog.entity.CastMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface CastMemberRepository extends JpaRepository<CastMember, UUID> {
    List<CastMember> findByContentId(UUID contentId);
}