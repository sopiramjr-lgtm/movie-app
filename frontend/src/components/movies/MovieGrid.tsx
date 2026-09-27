"use client";

import React from "react";
import { useMovies } from "@/src/hooks/useMovies";
import { MovieCard } from "./MovieCard";
import { useAppSelector } from "@/src/store/hooks";

interface MovieGridProps {
  type?: "MOVIE" | "SERIES";
  genre?: string;
  country?: string;
  limit?: number;
  aspectRatio?: "video" | "poster";
}

export function MovieGrid({ type, genre, country, limit = 30, aspectRatio = "poster" }: MovieGridProps) {
  const searchQuery = useAppSelector((state) => state.ui.searchQuery);
  const { data, isLoading, error } = useMovies({
    search: searchQuery,
    type,
    genre,
    country,
    limit,
  });

  const gridClass =
    aspectRatio === "video"
      ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
      : "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6";

  if (isLoading) {
    return (
      <div className={gridClass}>
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className={`animate-pulse rounded-xl bg-slate-900/80 border border-slate-800 ${
              aspectRatio === "video" ? "aspect-[16/9]" : "aspect-[2/3]"
            }`}
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-900/50 bg-red-950/20 p-8 text-center text-red-400">
        <p className="font-semibold">Unable to load media catalog</p>
        <p className="text-xs text-red-500 mt-1">Please ensure the backend server is running on http://localhost:8081.</p>
      </div>
    );
  }

  if (!data?.items.length) {
    return (
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-12 text-center text-slate-400">
        <p className="text-base font-medium text-slate-300">No content found</p>
        <p className="text-xs text-slate-500 mt-1">Try clearing filters or searching for something else.</p>
      </div>
    );
  }

  return (
    <div className={gridClass}>
      {data.items.map((movie) => (
        <MovieCard key={movie.id} movie={movie} className="w-full" aspectRatio={aspectRatio} />
      ))}
    </div>
  );
}
