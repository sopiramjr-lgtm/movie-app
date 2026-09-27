"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/src/components/common/Navbar";
import { HeroBillboard } from "@/src/components/movies/HeroBillboard";
import { MovieRow } from "@/src/components/movies/MovieRow";
import { MovieDetailModal } from "@/src/components/movies/MovieDetailModal";
import { useMovies } from "@/src/hooks/useMovies";
import { useLanguage } from "@/src/hooks/useLanguage";
import { FlagKH } from "@/src/components/common/LanguageSwitcher";
import { Footer } from "@/src/components/layout/Footer";
import { Sparkles, QrCode, Play, Shield, ChevronRight } from "lucide-react";
import type { ContentResponse } from "@/src/types/movie";

// Curated high quality fallback blockbuster catalog if backend is still initializing
const fallbackCatalog: ContentResponse[] = [
  {
    id: "dune-2",
    title: "Dune: Part Two",
    contentType: "MOVIE",
    description:
      "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the universe, he endeavors to prevent a terrible future only he can foresee.",
    releaseYear: 2024,
    maturityRating: "PG-13",
    durationMinutes: 166,
    posterUrl: "https://image.tmdb.org/t/p/w780/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
    genres: [{ id: "1", name: "Sci-Fi" }, { id: "2", name: "Adventure" }, { id: "3", name: "Action" }],
    averageRating: 8.9,
  },
  {
    id: "interstellar",
    title: "Interstellar",
    contentType: "MOVIE",
    description:
      "When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot is tasked to pilot a spacecraft to find a new planet for humans.",
    releaseYear: 2014,
    maturityRating: "PG-13",
    durationMinutes: 169,
    posterUrl: "https://image.tmdb.org/t/p/w780/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    genres: [{ id: "1", name: "Sci-Fi" }, { id: "4", name: "Drama" }],
    averageRating: 8.7,
  },
  {
    id: "oppenheimer",
    title: "Oppenheimer",
    contentType: "MOVIE",
    description:
      "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II.",
    releaseYear: 2023,
    maturityRating: "R",
    durationMinutes: 180,
    posterUrl: "https://image.tmdb.org/t/p/w780/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
    genres: [{ id: "4", name: "Drama" }, { id: "5", name: "History" }],
    averageRating: 8.9,
  },
  {
    id: "dark-knight",
    title: "The Dark Knight",
    contentType: "MOVIE",
    description:
      "When the menace known as the Joker wreaks havoc on Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
    releaseYear: 2008,
    maturityRating: "PG-13",
    durationMinutes: 152,
    posterUrl: "https://image.tmdb.org/t/p/w780/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    genres: [{ id: "3", name: "Action" }, { id: "6", name: "Crime" }],
    averageRating: 9.0,
  },
  {
    id: "inception",
    title: "Inception",
    contentType: "MOVIE",
    description:
      "A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
    releaseYear: 2010,
    maturityRating: "PG-13",
    durationMinutes: 148,
    posterUrl: "https://image.tmdb.org/t/p/w780/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg",
    genres: [{ id: "3", name: "Action" }, { id: "1", name: "Sci-Fi" }],
    averageRating: 8.8,
  },
  {
    id: "stranger-things",
    title: "Stranger Things",
    contentType: "SERIES",
    description:
      "When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces and one strange little girl.",
    releaseYear: 2022,
    maturityRating: "TV-14",
    durationMinutes: 55,
    posterUrl: "https://image.tmdb.org/t/p/w780/49WJfeN0moxb9IPfGn8AIqMGskD.jpg",
    genres: [{ id: "1", name: "Sci-Fi" }, { id: "7", name: "Horror" }],
    averageRating: 8.7,
  },
  {
    id: "arcane",
    title: "Arcane",
    contentType: "SERIES",
    description:
      "Set in the utopian region of Piltover and the oppressed underground of Zaun, the story follows the origins of two iconic League champions.",
    releaseYear: 2024,
    maturityRating: "TV-14",
    durationMinutes: 42,
    posterUrl: "https://image.tmdb.org/t/p/w780/fqldf2t8ztc9aiwn3k6mlX3tvRT.jpg",
    genres: [{ id: "1", name: "Sci-Fi" }, { id: "3", name: "Action" }, { id: "7", name: "Animation" }],
    averageRating: 9.0,
  },
  {
    id: "breaking-bad",
    title: "Breaking Bad",
    contentType: "SERIES",
    description:
      "A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine in order to secure his family's future.",
    releaseYear: 2013,
    maturityRating: "TV-MA",
    durationMinutes: 49,
    posterUrl: "https://image.tmdb.org/t/p/w780/ztkUQFLlC19CCMYHW9o1zWhJRNq.jpg",
    genres: [{ id: "4", name: "Drama" }, { id: "6", name: "Crime" }],
    averageRating: 9.5,
  },
  {
    id: "shogun",
    title: "Shōgun",
    contentType: "SERIES",
    description:
      "When a mysterious European ship is found marooned in a nearby fishing village, Lord Yoshii Toranaga discovers secrets that could tip the scales of power in feudal Japan.",
    releaseYear: 2024,
    maturityRating: "TV-MA",
    durationMinutes: 58,
    posterUrl: "https://image.tmdb.org/t/p/w780/7O4iVfOMQmdCSxhOg1WnzG1AgYT.jpg",
    genres: [{ id: "4", name: "Drama" }, { id: "2", name: "Adventure" }],
    averageRating: 8.8,
  },
  {
    id: "squid-game",
    title: "Squid Game",
    contentType: "SERIES",
    description:
      "Hundreds of cash-strapped players accept a strange invitation to compete in children's games with high stakes and fatal consequences.",
    releaseYear: 2024,
    maturityRating: "TV-MA",
    durationMinutes: 54,
    posterUrl: "https://image.tmdb.org/t/p/w780/dDlG22l57k4r792348m9O123.jpg",
    genres: [{ id: "4", name: "Drama" }, { id: "7", name: "Thriller" }],
    averageRating: 8.5,
  },
];

export default function Home() {
  const { lang, t } = useLanguage();
  const { data: moviesData } = useMovies({ limit: 40 });
  const [selectedMovie, setSelectedMovie] = useState<ContentResponse | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("all");

  // Use backend items if available, otherwise use curated blockbuster catalog
  const allContent: ContentResponse[] =
    moviesData?.items && moviesData.items.length > 0
      ? moviesData.items
      : fallbackCatalog;

  const featured = allContent[0];
  const movies = allContent.filter((item) => item.contentType === "MOVIE");
  const series = allContent.filter((item) => item.contentType === "SERIES");
  const trending = allContent.slice(0, 10);
  const top10 = allContent.slice(0, 10);
  const actionSciFi = allContent.filter((item) =>
    item.genres?.some((g) => {
      const name = typeof g === "string" ? g : g.name;
      return ["Sci-Fi", "Action", "Adventure"].includes(name);
    })
  );

  return (
    <div className={`min-h-screen flex flex-col bg-white dark:bg-[#141414] text-slate-900 dark:text-white selection:bg-[#E50914] selection:text-white ${lang === "kh" ? "font-['Kantumruy_Pro',sans-serif]" : ""}`}>
      {/* Top Navigation Bar with Flag & Language Support */}
      <Navbar />

      {/* Cinematic Redesigned Hero Billboard with Carousel & Trailer Modal */}
      <HeroBillboard
        movie={featured}
        allFeatured={allContent.slice(0, 4)}
        onMoreInfo={(m) => setSelectedMovie(m)}
      />

      {/* Quick Category & Genre Pills (Sticky-feel Sub-bar) */}
      <div className="relative z-30 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 sm:-mt-12 mb-6 sm:mb-8">
        <div className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto no-scrollbar py-2 px-1" style={{ scrollbarWidth: "none" }}>
          {[
            { id: "all", label: t.filters.all },
            { id: "movies", label: t.filters.movies },
            { id: "series", label: t.filters.tvSeries },
            { id: "top10", label: t.filters.top10 },
            { id: "action", label: t.filters.action },
            { id: "scifi", label: t.filters.scifi },
            { id: "khmer", label: t.filters.khmerDubbed },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer shadow-md ${
                activeCategory === cat.id
                  ? "bg-white text-black font-bold scale-105"
                  : "bg-slate-200/80 dark:bg-zinc-800/80 hover:bg-slate-300 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 hover:text-black dark:hover:text-white border border-slate-300/60 dark:border-white/10"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Netflix Horizontal Rails Section */}
      <main className="flex-1 relative z-30 space-y-8 sm:space-y-12 pb-24">
        {/* Row 1: Trending Now */}
        {(activeCategory === "all" || activeCategory === "movies" || activeCategory === "khmer") && (
          <MovieRow
            title={t.rows.trending}
            movies={trending}
            onSelectMovie={(m) => setSelectedMovie(m)}
            aspectRatio="video"
          />
        )}

        {/* Row 2: Top 10 in Cambodia Today (With Stylized Big Numbers!) */}
        {(activeCategory === "all" || activeCategory === "top10" || activeCategory === "khmer") && (
          <MovieRow
            title={t.rows.top10}
            movies={top10}
            onSelectMovie={(m) => setSelectedMovie(m)}
            isTop10={true}
          />
        )}

        {/* VIP Spotlight Promotional Banner (Bakong KHQR) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-6">
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-red-950/80 via-zinc-900 to-black p-6 sm:p-10 border border-red-900/40 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-3 max-w-xl text-center md:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-900/40 border border-red-800/60 text-red-400 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-red-500" />
                {t.spotlight.badge}
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {t.spotlight.title}
              </h3>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                {t.spotlight.desc}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <Link href="/pricing">
                <button className="bg-[#E50914] hover:bg-[#b80710] text-white px-6 py-3 rounded-lg font-bold text-sm shadow-xl flex items-center gap-2 transition hover:scale-105 cursor-pointer">
                  <QrCode className="w-4 h-4" />
                  {t.spotlight.button}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Row 3: Popular TV Series */}
        {(activeCategory === "all" || activeCategory === "series") && (
          <MovieRow
            title={t.rows.bingeSeries}
            movies={series.length > 0 ? series : allContent.slice(3, 9)}
            onSelectMovie={(m) => setSelectedMovie(m)}
            aspectRatio="video"
          />
        )}

        {/* Row 4: Blockbuster Movies */}
        {(activeCategory === "all" || activeCategory === "movies") && (
          <MovieRow
            title={t.rows.blockbusters}
            movies={movies.length > 0 ? movies : allContent.slice(0, 6)}
            onSelectMovie={(m) => setSelectedMovie(m)}
            aspectRatio="poster"
          />
        )}

        {/* Row 5: Action & Sci-Fi Picks */}
        {(activeCategory === "all" || activeCategory === "action" || activeCategory === "scifi") && (
          <MovieRow
            title={t.rows.actionSciFi}
            movies={actionSciFi.length > 0 ? actionSciFi : allContent.slice(1, 8)}
            onSelectMovie={(m) => setSelectedMovie(m)}
            aspectRatio="video"
          />
        )}
      </main>

      {/* Netflix Movie Detail Pop-up Modal */}
      {selectedMovie && (
        <MovieDetailModal
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
          similarMovies={allContent.filter((m) => m.id !== selectedMovie.id)}
        />
      )}

      {/* Dynamic Footer with site settings and language support */}
      <Footer />
    </div>
  );
}
