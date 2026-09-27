import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  ContentResponse,
  Movie,
  MovieFilters,
  GenreResponse,
  CastMemberResponse,
  SeasonResponse,
  EpisodeResponse,
  ReviewResponse,
  WatchlistResponse,
  HistoryResponse,
} from "@/src/types/movie";
import type { PaginatedResponse } from "@/src/types/api";
import { catalogApi, reviewApi, watchlistApi, historyApi } from "@/src/lib/api/endpoints";

export function useMovies(filters?: MovieFilters) {
  return useQuery<PaginatedResponse<Movie>>({
    queryKey: ["movies", filters],
    queryFn: async () => {
      const pageIndex = filters?.page && filters.page > 0 ? filters.page - 1 : 0;
      const size = filters?.limit || 20;
      const response = await catalogApi.getContents(pageIndex, size, filters?.type);

      let items: ContentResponse[] = response.content || [];

      // Strict type filter fallback (ensures SERIES only shows series, MOVIE only shows movies)
      if (filters?.type) {
        const targetType = filters.type.toUpperCase();
        items = items.filter((m) => m.contentType?.toUpperCase() === targetType);
      }

      // Client-side filtering by genre or title search if needed
      if (filters?.search) {
        const q = filters.search.toLowerCase();
        items = items.filter(
          (m) =>
            m.title.toLowerCase().includes(q) ||
            (m.description && m.description.toLowerCase().includes(q))
        );
      }

      if (filters?.genre && filters.genre !== "All") {
        const targetGenre = filters.genre.toLowerCase();
        items = items.filter((m) =>
          m.genres &&
          m.genres.some((g: any) => {
            const name = typeof g === "string" ? g : g?.name;
            return name?.toLowerCase() === targetGenre;
          })
        );
      }

      // Filter by Country / Regional Drama (Korea K-Drama, China C-Drama, Japan Anime, USA Hollywood, Cambodia)
      if (filters?.country && filters.country !== "ALL") {
        const c = filters.country.toUpperCase();
        items = items.filter((m) => {
          const genreNames = (m.genres || [])
            .map((g: any) => (typeof g === "string" ? g : g?.name || ""))
            .map((n: string) => n.toLowerCase());
          const text = `${m.title} ${m.description || ""} ${genreNames.join(" ")}`.toLowerCase();

          if (c === "KR") {
            // Match by K-Drama genre tag OR korean keywords in title/description
            return (
              genreNames.includes("k-drama") ||
              text.includes("korea") ||
              text.includes("korean drama") ||
              text.includes("kdrama") ||
              text.includes("k-drama") ||
              text.includes("seoul")
            );
          }
          if (c === "CN") {
            // Match by C-Drama genre tag OR chinese keywords
            return (
              genreNames.includes("c-drama") ||
              text.includes("chinese drama") ||
              text.includes("c-drama") ||
              text.includes("cdrama") ||
              text.includes("wuxia") ||
              text.includes("beijing") ||
              text.includes("yanxi") ||
              text.includes("nirvana in fire") ||
              text.includes("untamed")
            );
          }
          if (c === "JP") {
            // Match by Anime genre tag OR japanese keywords
            return (
              genreNames.includes("anime") ||
              text.includes("anime") ||
              text.includes("japan") ||
              text.includes("japanese") ||
              text.includes("tokyo") ||
              text.includes("attack on titan") ||
              text.includes("demon slayer") ||
              text.includes("shogun") ||
              text.includes("shōgun")
            );
          }
          if (c === "US") {
            // Hollywood / US — exclude K-Drama and C-Drama content
            const isAsianDrama = genreNames.includes("k-drama") || genreNames.includes("c-drama") || genreNames.includes("anime");
            return (
              !isAsianDrama && (
                text.includes("hollywood") ||
                text.includes("american") ||
                text.includes("usa") ||
                text.includes("marvel") ||
                text.includes("dc ") ||
                m.title === "Oppenheimer" ||
                m.title === "Interstellar" ||
                m.title === "The Dark Knight" ||
                m.title === "Inception" ||
                m.title === "Barbie" ||
                m.title === "Stranger Things" ||
                m.title === "Arcane" ||
                text.includes("top gun") ||
                text.includes("batman") ||
                text.includes("spider-man") ||
                text.includes("john wick") ||
                text.includes("avatar") ||
                text.includes("mission: impossible") ||
                text.includes("dune:")
              )
            );
          }
          if (c === "KH") {
            return (
              text.includes("cambodia") ||
              text.includes("khmer") ||
              text.includes("ខ្មែរ") ||
              text.includes("phnom penh")
            );
          }
          return true;
        });
      }

      return {
        items,
        total: response.totalElements || items.length,
        page: (response.number || 0) + 1,
        pageSize: response.size || size,
        totalPages: response.totalPages || 1,
      };
    },
  });
}

export function useMovieDetail(movieId: string) {
  return useQuery<Movie | null>({
    queryKey: ["movie", movieId],
    queryFn: async () => {
      if (!movieId) return null;
      return await catalogApi.getContentById(movieId);
    },
    enabled: Boolean(movieId),
  });
}

export function useGenres() {
  return useQuery<GenreResponse[]>({
    queryKey: ["genres"],
    queryFn: async () => {
      return await catalogApi.getGenres();
    },
  });
}

export function useCast(contentId: string) {
  return useQuery<CastMemberResponse[]>({
    queryKey: ["cast", contentId],
    queryFn: async () => {
      if (!contentId) return [];
      return await catalogApi.getCast(contentId);
    },
    enabled: Boolean(contentId),
  });
}

export function useSeasons(contentId: string) {
  return useQuery<SeasonResponse[]>({
    queryKey: ["seasons", contentId],
    queryFn: async () => {
      if (!contentId) return [];
      return await catalogApi.getSeasons(contentId);
    },
    enabled: Boolean(contentId),
  });
}

export function useEpisodes(seasonId: string) {
  return useQuery<EpisodeResponse[]>({
    queryKey: ["episodes", seasonId],
    queryFn: async () => {
      if (!seasonId) return [];
      return await catalogApi.getEpisodes(seasonId);
    },
    enabled: Boolean(seasonId),
  });
}

export function useReviews(contentId: string) {
  return useQuery<ReviewResponse[]>({
    queryKey: ["reviews", contentId],
    queryFn: async () => {
      if (!contentId) return [];
      return await reviewApi.getReviews(contentId);
    },
    enabled: Boolean(contentId),
  });
}

export function useWatchlist(profileId: string | null) {
  const queryClient = useQueryClient();

  const query = useQuery<WatchlistResponse[]>({
    queryKey: ["watchlist", profileId],
    queryFn: async () => {
      if (!profileId) return [];
      return await watchlistApi.getWatchlist(profileId);
    },
    enabled: Boolean(profileId),
  });

  const addMutation = useMutation({
    mutationFn: (contentId: string) => {
      if (!profileId) throw new Error("No active profile selected");
      return watchlistApi.addToWatchlist(profileId, contentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watchlist", profileId] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: (contentId: string) => {
      if (!profileId) throw new Error("No active profile selected");
      return watchlistApi.removeFromWatchlist(profileId, contentId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watchlist", profileId] });
    },
  });

  return {
    ...query,
    addToWatchlist: addMutation.mutateAsync,
    removeFromWatchlist: removeMutation.mutateAsync,
  };
}

export function useHistory(profileId: string | null) {
  return useQuery<HistoryResponse[]>({
    queryKey: ["history", profileId],
    queryFn: async () => {
      if (!profileId) return [];
      return await historyApi.getHistory(profileId);
    },
    enabled: Boolean(profileId),
  });
}
