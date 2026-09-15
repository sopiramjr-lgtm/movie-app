package com.movie_app.movie_app_api.catalog.repository;

import com.movie_app.movie_app_api.catalog.entity.Person;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface PersonRepository extends JpaRepository<Person, UUID> {
}