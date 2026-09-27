"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Play, Plus, Check, ThumbsUp, MessageSquare, ChevronDown } from "lucide-react";
import type { ContentResponse } from "@/src/types/movie";
import { useAppSelector } from "@/src/store/hooks";
import { useWatchlist } from "@/src/hooks/useMovies";
import { reviewApi } from "@/src/lib/api/endpoints";
import { toast } from "sonner";

interface MovieCardProps {
  movie: ContentResponse;
  onMoreInfo?: (movie: ContentResponse) => void;
  aspectRatio?: "video" | "poster"; // video is 16:9, poster is 2:3
  className?: string;
}

export function MovieCard({
  movie,
  onMoreInfo,
  aspectRatio = "video",
  className,
}: MovieCardProps) {
  const router = useRouter();
  const { isAuthenticated, activeProfileId } = useAppSelector((state) => state.auth);

  // Dynamic Watchlist state synced with PostgreSQL backend
  const { data: watchlist = [], addToWatchlist, removeFromWatchlist } = useWatchlist(activeProfileId);
  const isInWatchlist = Boolean(
    movie?.id && watchlist.some(
      (item) => item?.contentId === movie.id || item?.content?.id === movie.id
    )
  );

  // Dynamic Like state synced with reviews backend
  const [liked, setLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isWatchlistUpdating, setIsWatchlistUpdating] = useState(false);
  const [imgError, setImgError] = useState(false);

  if (!movie || !movie.id) {
    return null;
  }

  const FALLBACK_IMG = "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=700&auto=format&fit=crop&q=80";
  const posterSrc = imgError || !movie.posterUrl ? FALLBACK_IMG : movie.posterUrl;

  // Dynamic Watchlist Toggle
  const handleToggleWatchlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error("Please sign in to save titles to your list");
      router.push("/login");
      return;
    }

    if (!activeProfileId) {
      toast.info("Please select a profile to save to your list");
      router.push("/profile");
      return;
    }

    setIsWatchlistUpdating(true);
    try {
      if (isInWatchlist) {
        await removeFromWatchlist(movie.id);
        toast.success(`Removed "${movie.title}" from My List`);
      } else {
        await addToWatchlist(movie.id);
        toast.success(`Added "${movie.title}" to My List!`);
      }
    } catch {
      toast.error("Failed to update My List. Please try again.");
    } finally {
      setIsWatchlistUpdating(false);
    }
  };

  // Dynamic Like Toggle (Saves 5-star rating to backend)
  const handleToggleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error("Please sign in to rate titles");
      router.push("/login");
      return;
    }

    if (!activeProfileId) {
      toast.info("Please select a profile to like titles");
      router.push("/profile");
      return;
    }

    setIsLiking(true);
    try {
      const nextLiked = !liked;
      setLiked(nextLiked);

      if (nextLiked) {
        await reviewApi.submitReview(activeProfileId, {
          contentId: movie.id,
          rating: 5,
          comment: "Liked from movie card",
        });
        toast.success(`Liked "${movie.title}"! Rating saved.`);
      } else {
        toast.info(`Removed like for "${movie.title}"`);
      }
    } catch {
      toast.error("Failed to save rating.");
    } finally {
      setIsLiking(false);
    }
  };

  // Navigate to comments & reviews section on movie details page
  const handleGoToReviews = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/movies/${movie.id}#reviews`);
  };

  const genreNames: string[] =
    movie.genres && movie.genres.length > 0
      ? movie.genres
          .slice(0, 3)
          .map((g) => (typeof g === "string" ? g : (g as any)?.name))
          .filter(Boolean)
      : ["Featured"];

  const isPoster = aspectRatio === "poster";
  const matchScore =
    movie.averageRating && movie.averageRating > 0
      ? `${Math.min(99, Math.round(movie.averageRating * 20))}% Match`
      : "96% Match";
  const durationOrType =
    movie.contentType === "SERIES"
      ? "TV Series"
      : movie.durationMinutes
      ? `${movie.durationMinutes}m`
      : "Feature Film";

  return (
    <div
      onClick={() => onMoreInfo?.(movie)}
      className={`group relative cursor-pointer rounded-lg select-none transition-all duration-300 ease-out hover:z-30 ${
        className
          ? className
          : isPoster
          ? "w-[160px] sm:w-[190px] flex-shrink-0"
          : "w-[240px] sm:w-[280px] flex-shrink-0"
      }`}
    >
      {/* Scalable Card Wrapper */}
      <div
        className={`relative w-full rounded-lg overflow-hidden bg-[#181818] border border-white/10 shadow-md transition-all duration-300 ease-out group-hover:scale-105 group-hover:shadow-[0_16px_36px_rgba(0,0,0,0.85)] group-hover:border-[#E50914]/60 ${
          isPoster ? "aspect-[2/3]" : "aspect-[16/9]"
        }`}
      >
        {/* Poster / Backdrop Image */}
        <Image
          src={posterSrc}
          alt={movie.title}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
          className="object-cover object-center transition-transform duration-500 group-hover:scale-110 filter brightness-95 group-hover:brightness-90"
          onError={() => setImgError(true)}
          unoptimized={posterSrc.startsWith("https://image.tmdb.org") || posterSrc.startsWith("https://media.themoviedb.org")}
        />

        {/* Ambient Top & Bottom Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/30 pointer-events-none" />

        {/* Brand Badge Top-Left */}
        <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-extrabold text-[#E50914] shadow-sm">
          <span>K</span>
          <span className="text-[8px] text-white/70 font-semibold uppercase tracking-wider">Flix</span>
        </div>

        {/* Maturity / Quality Badge Top-Right */}
        <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1">
          <span className="bg-black/60 backdrop-blur-md text-[9px] font-bold text-zinc-300 px-1.5 py-0.5 rounded border border-white/10">
            {movie.maturityRating || "13+"}
          </span>
          <span className="bg-[#E50914]/90 text-[8px] font-black text-white px-1 py-0.5 rounded">
            HD
          </span>
        </div>

        {/* Center Hover Play Button Icon */}
        <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100 pointer-events-none">
          <div className="w-12 h-12 rounded-full bg-white/95 text-black flex items-center justify-center shadow-[0_4px_20px_rgba(255,255,255,0.35)] group-hover:scale-105 transition-transform">
            <Play className="w-5 h-5 fill-black ml-0.5" />
          </div>
        </div>

        {/* Bottom Content Tray (Always legible, richer details on hover) */}
        <div className="absolute inset-x-0 bottom-0 z-20 p-3 flex flex-col justify-end bg-gradient-to-t from-black via-black/85 to-transparent pt-8 transition-all duration-300">
          {/* Movie Title */}
          <h4 className="text-white font-bold text-sm tracking-tight truncate drop-shadow-md group-hover:text-[#E50914] transition-colors">
            {movie.title}
          </h4>

          {/* Quick Details Bar */}
          <div className="flex items-center gap-2 text-[10px] text-zinc-300 mt-1 font-medium">
            <span className="text-emerald-400 font-bold">{matchScore}</span>
            <span>&bull;</span>
            <span>{durationOrType}</span>
            <span>&bull;</span>
            <span className="text-zinc-400">{movie.releaseYear || 2024}</span>
          </div>

          {/* Expanded Controls & Genres on Hover */}
          <div className="max-h-0 opacity-0 group-hover:max-h-24 group-hover:opacity-100 transition-all duration-300 overflow-hidden pt-0 group-hover:pt-2">
            <div className="flex items-center justify-between gap-1.5 mb-2">
              <div className="flex items-center gap-1.5">
                {/* Watch Now */}
                <Link
                  href={`/watch/${movie.id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="w-7 h-7 rounded-full bg-white hover:bg-zinc-200 text-black flex items-center justify-center transition shadow cursor-pointer"
                  title="Watch now"
                >
                  <Play className="w-3.5 h-3.5 fill-black ml-0.5" />
                </Link>

                {/* Add to Watchlist (Dynamic) */}
                <button
                  type="button"
                  onClick={handleToggleWatchlist}
                  disabled={isWatchlistUpdating}
                  className={`w-7 h-7 rounded-full border flex items-center justify-center transition cursor-pointer ${
                    isInWatchlist
                      ? "bg-emerald-500 border-emerald-500 text-white"
                      : "bg-black/60 border-zinc-500 hover:border-white text-white"
                  }`}
                  title={isInWatchlist ? "Remove from My List" : "Add to My List"}
                >
                  {isInWatchlist ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                </button>

                {/* Like / Thumbs Up (Dynamic) */}
                <button
                  type="button"
                  onClick={handleToggleLike}
                  disabled={isLiking}
                  className={`w-7 h-7 rounded-full border flex items-center justify-center transition cursor-pointer ${
                    liked
                      ? "bg-[#E50914] border-[#E50914] text-white"
                      : "bg-black/60 border-zinc-500 hover:border-white text-white"
                  }`}
                  title={liked ? "Unlike" : "I like this"}
                >
                  <ThumbsUp className="w-3 h-3" />
                </button>

                {/* Comment / Review (Dynamic) */}
                <button
                  type="button"
                  onClick={handleGoToReviews}
                  className="w-7 h-7 rounded-full border border-zinc-500 bg-black/60 hover:border-white text-white flex items-center justify-center transition cursor-pointer"
                  title="Read & Write Reviews"
                >
                  <MessageSquare className="w-3 h-3" />
                </button>
              </div>

              {/* More info */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onMoreInfo ? onMoreInfo(movie) : router.push(`/movies/${movie.id}`);
                }}
                className="w-7 h-7 rounded-full border border-zinc-500 bg-black/60 hover:border-white text-white flex items-center justify-center transition cursor-pointer"
                title="Details & episodes"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Genre list */}
            <div className="flex flex-wrap items-center gap-1 text-[9px] text-zinc-400">
              {genreNames.map((g, idx) => (
                <span key={`${g}-${idx}`} className="truncate">
                  {g}{idx < genreNames.length - 1 ? " • " : ""}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
