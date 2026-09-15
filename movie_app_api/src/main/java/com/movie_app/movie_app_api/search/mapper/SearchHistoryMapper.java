package com.movie_app.movie_app_api.search.mapper;

import com.movie_app.movie_app_api.search.dto.response.SearchHistoryResponse;
import com.movie_app.movie_app_api.search.entity.SearchHistory;
import org.springframework.stereotype.Component;

@Component
public class SearchHistoryMapper {
    public SearchHistoryResponse toResponse(SearchHistory history) {
        if (history == null) return null;
        return SearchHistoryResponse.builder()
                .id(history.getId())
                .profileId(history.getProfile().getId())
                .query(history.getQuery())
                .searchedAt(history.getSearchedAt())
                .build();
    }
}