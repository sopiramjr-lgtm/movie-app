"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Play, Plus, Check, ThumbsUp, X, Star, Clock, Calendar } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import type { ContentResponse } from "@/src/types/movie";

interface MovieDetailModalProps {
  movie: ContentResponse | null;
  onClose: () => void;
  similarMovies?: ContentResponse[];
}

export function MovieDetailModal({
  movie,
  onClose,
  similarMovies = [],
}: MovieDetailModalProps) {
  const [inWatchlist, setInWatchlist] = useState(false);

  if (!movie) return null;

  const backdrop =
    movie.posterUrl ||
    "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
      {/* Modal Container */}
      <div className="relative w-full max-w-4xl bg-[#181818] rounded-xl overflow-hidden shadow-2xl border border-white/10 my-auto text-white">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 w-9 h-9 rounded-full bg-[#181818]/80 hover:bg-[#181818] border border-white/20 text-white flex items-center justify-center transition"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Backdrop Banner */}
        <div className="relative aspect-[16/9] w-full max-h-[420px] overflow-hidden">
          <Image
            src={backdrop}
            alt={movie.title}
            fill
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-[#181818]/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#181818]/80 via-transparent to-transparent w-1/2" />

          {/* Action Row inside Banner */}
          <div className="absolute bottom-6 left-6 right-6 z-20 space-y-3">
            <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight drop-shadow-lg">
              {movie.title}
            </h2>

            <div className="flex items-center gap-3">
              <Link href={`/watch/${movie.id}`}>
                <Button className="bg-white hover:bg-white/90 text-black font-bold text-sm sm:text-base px-6 sm:px-8 py-2.5 rounded-md flex items-center gap-2 shadow-lg transition hover:scale-105">
                  <Play className="w-5 h-5 fill-black" />
                  Play
                </Button>
              </Link>

              <button
                onClick={() => setInWatchlist(!inWatchlist)}
                className="w-10 h-10 rounded-full border border-white/40 bg-black/60 hover:border-white text-white flex items-center justify-center transition"
                title="Add to My List"
              >
                {inWatchlist ? (
                  <Check className="w-5 h-5 text-emerald-400" />
                ) : (
                  <Plus className="w-5 h-5" />
                )}
              </button>

              <button
                className="w-10 h-10 rounded-full border border-white/40 bg-black/60 hover:border-white text-white flex items-center justify-center transition"
                title="Rate this"
              >
                <ThumbsUp className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Metadata Columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left: Synopsis & Badges */}
            <div className="md:col-span-2 space-y-4">
              <div className="flex flex-wrap items-center gap-2.5 text-xs sm:text-sm">
                <span className="text-emerald-400 font-bold">98% Match</span>
                <span className="text-zinc-400">{movie.releaseYear || 2024}</span>
                <span className="px-1.5 py-0.5 border border-zinc-600 rounded text-[11px] text-zinc-300 font-semibold">
                  {movie.maturityRating || "16+"}
                </span>
                <span className="text-zinc-400">
                  {movie.durationMinutes ? `${movie.durationMinutes}m` : "Series"}
                </span>
                <span className="border border-zinc-600 px-1.5 py-0.5 rounded text-[10px] font-bold text-zinc-300">
                  HD
                </span>
                <span className="border border-zinc-600 px-1.5 py-0.5 rounded text-[10px] font-bold text-zinc-300">
                  5.1
                </span>
              </div>

              <p className="text-sm sm:text-base text-zinc-200 leading-relaxed font-normal">
                {movie.description ||
                  "An engaging cinematic journey exploring breathtaking conflicts, gripping character arcs, and unforgettable moments."}
              </p>
            </div>

            {/* Right: Cast, Genres, Mood */}
            <div className="space-y-2.5 text-xs text-zinc-400 border-t md:border-t-0 md:border-l border-zinc-800 pt-4 md:pt-0 md:pl-6">
              <div>
                <span className="text-zinc-500">Genres: </span>
                <span className="text-zinc-200">
                  {movie.genres?.map((g) => (typeof g === "string" ? g : g.name)).join(", ") || "Action, Drama"}
                </span>
              </div>
              <div>
                <span className="text-zinc-500">Audio: </span>
                <span className="text-zinc-200">English, Khmer, Spanish</span>
              </div>
              <div>
                <span className="text-zinc-500">Subtitles: </span>
                <span className="text-zinc-200">English, Khmer</span>
              </div>
              <div>
                <span className="text-zinc-500">Maturity: </span>
                <span className="text-zinc-200">
                  Recommended for ages 16 and up. Contains violence, mild language.
                </span>
              </div>
            </div>
          </div>

          {/* More Like This */}
          {similarMovies.length > 0 && (
            <div className="pt-4 border-t border-zinc-800 space-y-4">
              <h3 className="text-lg font-bold text-white">More Like This</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {similarMovies.slice(0, 3).map((item) => (
                  <Link
                    key={item.id}
                    href={`/movies/${item.id}`}
                    onClick={onClose}
                    className="group rounded-md overflow-hidden bg-[#242424] border border-white/5 hover:border-white/20 transition"
                  >
                    <div className="relative aspect-[16/9] w-full">
                      <Image
                        src={
                          item.posterUrl ||
                          "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500"
                        }
                        alt={item.title}
                        fill
                        className="object-cover group-hover:scale-105 transition duration-300"
                      />
                    </div>
                    <div className="p-3 space-y-1">
                      <h5 className="font-bold text-xs text-white truncate">
                        {item.title}
                      </h5>
                      <p className="text-[11px] text-zinc-400 line-clamp-2">
                        {item.description}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
