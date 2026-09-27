"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MovieCard } from "./MovieCard";
import type { ContentResponse } from "@/src/types/movie";

interface MovieRowProps {
  title: string;
  movies: ContentResponse[];
  onSelectMovie?: (movie: ContentResponse) => void;
  isTop10?: boolean;
  aspectRatio?: "video" | "poster";
}

export function MovieRow({
  title,
  movies,
  onSelectMovie,
  isTop10 = false,
  aspectRatio = "video",
}: MovieRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  if (!movies || movies.length === 0) return null;

  const handleScroll = (direction: "left" | "right") => {
    if (!rowRef.current) return;
    const { scrollLeft, clientWidth } = rowRef.current;
    const scrollAmount = clientWidth * 0.75;
    const targetScroll =
      direction === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount;

    rowRef.current.scrollTo({ left: targetScroll, behavior: "smooth" });
  };

  const onScroll = () => {
    if (!rowRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
    setShowLeftArrow(scrollLeft > 20);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 20);
  };

  return (
    <div className="space-y-2 py-4 relative group/row">
      {/* Row Title */}
      <div className="px-4 sm:px-8 lg:px-12 flex items-center justify-between">
        <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2 group-hover/row:text-zinc-700 dark:group-hover/row:text-zinc-200 transition">
          {title}
          <span className="text-xs font-semibold text-[#E50914] opacity-0 group-hover/row:opacity-100 transition-opacity">
            Explore All &rsaquo;
          </span>
        </h3>
      </div>

      {/* Slider Container */}
      <div className="relative">
        {/* Left Arrow Button */}
        {showLeftArrow && (
          <button
            onClick={() => handleScroll("left")}
            className="absolute left-0 top-0 bottom-0 z-40 w-10 sm:w-12 bg-black/60 hover:bg-black/80 text-white flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition duration-200"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
        )}

        {/* Scrolling items */}
        <div
          ref={rowRef}
          onScroll={onScroll}
          className="flex items-center gap-2.5 sm:gap-3.5 overflow-x-auto no-scrollbar scroll-smooth px-4 sm:px-8 lg:px-12 py-6 -my-4"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {movies.map((movie, index) => {
            if (isTop10) {
              // Stylized Netflix Top 10 Card
              return (
                <div
                  key={movie.id}
                  onClick={() => onSelectMovie?.(movie)}
                  className="relative flex-shrink-0 flex items-center cursor-pointer group transition-transform duration-300 hover:scale-105"
                  style={{ width: "220px" }}
                >
                  {/* Big Stylized Rank Number */}
                  <div className="w-12 sm:w-16 relative flex justify-end select-none font-black text-6xl sm:text-8xl leading-none text-transparent stroke-num z-10 drop-shadow-2xl">
                    <span className="font-extrabold text-[#595959] opacity-90 drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)] absolute right-0 bottom-0 translate-x-4">
                      {index + 1}
                    </span>
                  </div>

                  {/* Poster */}
                  <div className="relative w-32 sm:w-36 aspect-[2/3] rounded-md overflow-hidden bg-slate-800 border border-white/10 shadow-xl ml-4">
                    <Image
                      src={
                        movie.posterUrl ||
                        "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500"
                      }
                      alt={movie.title}
                      fill
                      className="object-cover"
                      unoptimized={movie.posterUrl?.startsWith("https://image.tmdb.org") || false}
                    />
                    <div className="absolute top-1.5 left-1.5 bg-black/70 px-1 py-0.5 rounded text-[9px] font-black text-[#E50914]">
                      TOP 10
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <MovieCard
                key={movie.id}
                movie={movie}
                onMoreInfo={onSelectMovie}
                aspectRatio={aspectRatio}
              />
            );
          })}
        </div>

        {/* Right Arrow Button */}
        {showRightArrow && (
          <button
            onClick={() => handleScroll("right")}
            className="absolute right-0 top-0 bottom-0 z-40 w-10 sm:w-12 bg-black/60 hover:bg-black/80 text-white flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition duration-200"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        )}
      </div>
    </div>
  );
}
