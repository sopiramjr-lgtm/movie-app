"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MovieGrid } from "@/src/components/movies/MovieGrid";
import { useGenres } from "@/src/hooks/useMovies";
import { useLanguage } from "@/src/hooks/useLanguage";
import {
  Film,
  Tv,
  LayoutGrid,
  Check,
  SlidersHorizontal,
  X,
  Sparkles,
  Rows3,
  Grid,
} from "lucide-react";

function MoviesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, lang } = useLanguage();
  const isKhmer = lang === "kh";

  // Read URL query parameters
  const typeParam = searchParams.get("type") as "MOVIE" | "SERIES" | null;
  const genreParam = searchParams.get("genre") || undefined;
  const countryParam = searchParams.get("country") || undefined;

  const [selectedType, setSelectedType] = useState<"MOVIE" | "SERIES" | undefined>(
    typeParam === "MOVIE" || typeParam === "SERIES" ? typeParam : undefined
  );
  const [selectedGenre, setSelectedGenre] = useState<string | undefined>(genreParam);
  const [selectedCountry, setSelectedCountry] = useState<string | undefined>(countryParam);
  const [aspectRatio, setAspectRatio] = useState<"poster" | "video">("poster");

  // Keep state synchronized with URL search parameters
  useEffect(() => {
    const rawType = searchParams.get("type");
    if (rawType === "MOVIE" || rawType === "SERIES") {
      setSelectedType(rawType);
    } else {
      setSelectedType(undefined);
    }

    const rawGenre = searchParams.get("genre");
    setSelectedGenre(rawGenre || undefined);

    const rawCountry = searchParams.get("country");
    setSelectedCountry(rawCountry || undefined);
  }, [searchParams]);

  const { data: genres = [], isLoading: isGenresLoading } = useGenres();

  // Update URL when switching type filter
  const handleTypeChange = (type: "MOVIE" | "SERIES" | undefined) => {
    setSelectedType(type);
    const params = new URLSearchParams();
    if (type) params.set("type", type);
    if (selectedGenre) params.set("genre", selectedGenre);
    if (selectedCountry) params.set("country", selectedCountry);

    const queryString = params.toString();
    router.push(`/movies${queryString ? `?${queryString}` : ""}`);
  };

  // Update URL when selecting/deselecting a genre
  const handleGenreChange = (genreName: string | undefined) => {
    const nextGenre = selectedGenre === genreName ? undefined : genreName;
    setSelectedGenre(nextGenre);

    const params = new URLSearchParams();
    if (selectedType) params.set("type", selectedType);
    if (nextGenre) params.set("genre", nextGenre);
    if (selectedCountry) params.set("country", selectedCountry);

    const queryString = params.toString();
    router.push(`/movies${queryString ? `?${queryString}` : ""}`);
  };

  // Update URL when selecting/deselecting a country
  const handleCountryChange = (countryCode: string | undefined) => {
    const nextCountry = selectedCountry === countryCode ? undefined : countryCode;
    setSelectedCountry(nextCountry);

    const params = new URLSearchParams();
    if (selectedType) params.set("type", selectedType);
    if (selectedGenre) params.set("genre", selectedGenre);
    if (nextCountry) params.set("country", nextCountry);

    const queryString = params.toString();
    router.push(`/movies${queryString ? `?${queryString}` : ""}`);
  };

  // Clear all filters
  const handleResetFilters = () => {
    setSelectedType(undefined);
    setSelectedGenre(undefined);
    setSelectedCountry(undefined);
    router.push("/movies");
  };

  // Countries and Regional Drama list (no Thai)
  const COUNTRIES = [
    { code: "KR", nameEn: "K-Drama", nameKh: "K-Drama / កូរ៉េ", flag: "🇰🇷", desc: "Korea" },
    { code: "CN", nameEn: "C-Drama", nameKh: "C-Drama / ចិន", flag: "🇨🇳", desc: "China" },
    { code: "JP", nameEn: "Anime / Japan", nameKh: "Anime / ជប៉ុន", flag: "🇯🇵", desc: "Japan" },
    { code: "US", nameEn: "Hollywood", nameKh: "Hollywood / US", flag: "🇺🇸", desc: "US" },
    { code: "KH", nameEn: "Khmer", nameKh: "ភាពយន្តខ្មែរ", flag: "🇰🇭", desc: "Cambodia" },
  ];

  // Genre Khmer dictionary map
  const GENRE_KH_MAP: Record<string, string> = {
    Action: "វាយប្រហារ",
    Adventure: "ផ្សងព្រេង",
    Animation: "គំនូរជីវចល",
    Comedy: "កំប្លែង",
    Crime: "ឧក្រិដ្ឋកម្ម",
    Documentary: "ឯកសារ",
    Drama: "មនោសញ្ចេតនា",
    Family: "គ្រួសារ",
    Fantasy: "ស្រមើស្រមៃ",
    History: "ប្រវត្តិសាស្ត្រ",
    Horror: "រន្ធត់",
    Music: "តន្ត្រី",
    Mystery: "អាថ៌កំបាំង",
    Romance: "ស្នេហា",
    "Sci-Fi": "វិទ្យាសាស្ត្រ",
    "Science Fiction": "វិទ្យាសាស្ត្រ",
    Thriller: "ភ័យរន្ធត់",
    War: "សង្គ្រាម",
    Western: "លោកខាងលិច",
  };

  // Dynamic header information based on active type
  const headerInfo = {
    badge:
      selectedType === "SERIES"
        ? isKhmer
          ? "ភាពយន្តភាគ & រឿងភាគ"
          : "Television & Drama"
        : selectedType === "MOVIE"
        ? isKhmer
          ? "ភាពយន្តខ្នាតធំ & ល្បីៗ"
          : "Cinema & Blockbusters"
        : isKhmer
        ? "បណ្ណាល័យភាពយន្តពេញលេញ"
        : "Complete Library",
    title:
      selectedType === "SERIES"
        ? isKhmer
          ? "ភាពយន្តភាគ & រឿងភាគទូរទស្សន៍"
          : "TV Shows & Series"
        : selectedType === "MOVIE"
        ? isKhmer
          ? "ភាពយន្តខ្នាតធំ"
          : "Feature Movies"
        : isKhmer
        ? "កាតាឡុកភាពយន្តទាំងអស់"
        : "Browse Catalog",
    desc:
      selectedType === "SERIES"
        ? isKhmer
          ? "រីករាយទស្សនារឿងភាគដ៏គួរឱ្យចាប់អារម្មណ៍ វគ្គភាគជាច្រើន និងកម្មវិធីទូរទស្សន៍កំពុងពេញនិយម។"
          : "Explore binge-worthy drama series, thrilling multi-episode seasons, and trending TV shows."
        : selectedType === "MOVIE"
        ? isKhmer
          ? "រីករាយទស្សនាភាពយន្តខ្នាតធំកម្រិតរោងភាពយន្ត ភាពយន្តឈ្នះពានរង្វាន់ និងរឿងល្បីៗពីហូលីវូដ។"
          : "Explore cinematic blockbusters, award-winning feature films, and Hollywood releases."
        : isKhmer
        ? "រុករកបណ្តុំភាពយន្ត និងរឿងភាគគុណភាពកម្រិតខ្ពស់ទាំងអស់របស់យើងយ៉ាងសម្បូរបែប។"
        : "Explore our complete media collection of feature movies, drama series, and high-definition streams.",
  };

  const hasActiveFilters =
    selectedType !== undefined || selectedGenre !== undefined || selectedCountry !== undefined;

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200 dark:border-slate-800/80 pb-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-red-600/10 border border-red-500/20 text-red-500 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{headerInfo.badge}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {headerInfo.title}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
            {headerInfo.desc}
          </p>
        </div>

        {/* Content Type Selector & Layout Switcher */}
        <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
          {/* Segmented Type Control */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <button
              onClick={() => handleTypeChange(undefined)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                selectedType === undefined
                  ? "bg-red-600 text-white shadow-md shadow-red-600/30 scale-[1.02]"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/60"
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              {t.filters.all || "All"}
            </button>
            <button
              onClick={() => handleTypeChange("MOVIE")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                selectedType === "MOVIE"
                  ? "bg-red-600 text-white shadow-md shadow-red-600/30 scale-[1.02]"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/60"
              }`}
            >
              <Film className="h-3.5 w-3.5" />
              {t.filters.movies || "Movies"}
            </button>
            <button
              onClick={() => handleTypeChange("SERIES")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                selectedType === "SERIES"
                  ? "bg-red-600 text-white shadow-md shadow-red-600/30 scale-[1.02]"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/60"
              }`}
            >
              <Tv className="h-3.5 w-3.5" />
              {t.filters.tvSeries || "Series"}
            </button>
          </div>

          {/* Card Aspect Ratio Toggle (Poster vs Landscape) */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <button
              onClick={() => setAspectRatio("poster")}
              className={`p-1.5 rounded-lg transition-all ${
                aspectRatio === "poster"
                  ? "bg-slate-800 text-white shadow-sm dark:bg-slate-700"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
              title={isKhmer ? "ក្រឡាផ្ទាំងរូបភាព (២:៣)" : "Poster Grid (2:3)"}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setAspectRatio("video")}
              className={`p-1.5 rounded-lg transition-all ${
                aspectRatio === "video"
                  ? "bg-slate-800 text-white shadow-sm dark:bg-slate-700"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
              title={isKhmer ? "ក្រឡាវីដេអូផ្ដេក (១៦:៩)" : "Landscape Cards (16:9)"}
            >
              <Rows3 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
           REGION / DRAMA CATEGORY FILTER — Modern Card Design
          ═══════════════════════════════════════════════════════════ */}
      <div className="space-y-3">
        {/* Section Label */}
        <div className="flex items-center gap-2">
          <div className="w-0.5 h-4 rounded-full bg-red-500" />
          <span className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
            {isKhmer ? "ប្រទេស / ប្រភេទ" : "Region & Drama"}
          </span>
        </div>

        {/* Region Cards Row */}
        <div className="flex items-stretch gap-2 overflow-x-auto no-scrollbar pb-1" style={{ scrollbarWidth: "none" }}>
          {/* All Regions */}
          <button
            onClick={() => handleCountryChange(undefined)}
            className={`group relative flex-shrink-0 flex flex-col items-center justify-center gap-1 min-w-[72px] px-4 py-3 rounded-2xl font-semibold text-xs transition-all duration-200 border ${
              selectedCountry === undefined
                ? "bg-gradient-to-br from-red-600 to-red-700 text-white border-red-500 shadow-lg shadow-red-600/30 scale-[1.04]"
                : "bg-white dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700/60 hover:border-red-400/50 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-600 dark:hover:text-red-400"
            }`}
          >
            <span className="text-2xl leading-none">🌏</span>
            <span className="whitespace-nowrap text-[11px] font-bold">{isKhmer ? "ទាំងអស់" : "All"}</span>
          </button>

          {COUNTRIES.map((c) => {
            const isSelected = selectedCountry === c.code;
            const countryLabel = isKhmer ? c.nameKh : c.nameEn;
            return (
              <button
                key={c.code}
                onClick={() => handleCountryChange(c.code)}
                className={`group relative flex-shrink-0 flex flex-col items-center justify-center gap-1 min-w-[80px] px-4 py-3 rounded-2xl font-semibold text-xs transition-all duration-200 border ${
                  isSelected
                    ? "bg-gradient-to-br from-red-600 to-red-700 text-white border-red-500 shadow-lg shadow-red-600/30 scale-[1.04]"
                    : "bg-white dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700/60 hover:border-red-400/50 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-600 dark:hover:text-red-400"
                }`}
              >
                {/* Selected glow ring */}
                {isSelected && (
                  <span className="absolute inset-0 rounded-2xl ring-2 ring-red-400/50 ring-offset-1 ring-offset-transparent pointer-events-none" />
                )}
                <span className="text-2xl leading-none">{c.flag}</span>
                <span className="whitespace-nowrap text-[11px] font-bold text-center leading-tight">{countryLabel}</span>
                {c.desc && !isKhmer && (
                  <span className={`text-[9px] font-medium ${isSelected ? "text-red-100" : "text-slate-400 dark:text-slate-500"}`}>{c.desc}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
           GENRE FILTER — Modern Pill Chips with icons
          ═══════════════════════════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        {!isGenresLoading && genres.length > 0 && (
          <div className="space-y-2 flex-1">
            {/* Genre Label */}
            <div className="flex items-center gap-2">
              <div className="w-0.5 h-4 rounded-full bg-slate-400 dark:bg-slate-600" />
              <span className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                {isKhmer ? "ប្រភេទ" : "Genre"}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                onClick={() => handleGenreChange(undefined)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 border ${
                  selectedGenre === undefined
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent shadow-sm"
                    : "bg-white dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700/60 hover:border-slate-400 dark:hover:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700/60"
                }`}
              >
                {selectedGenre === undefined && <Check className="h-3 w-3" />}
                {isKhmer ? "ប្រភេទទាំងអស់" : "All Genres"}
              </button>
              {genres.map((g) => {
                const isSelected = selectedGenre?.toLowerCase() === g.name.toLowerCase();
                const genreLabel = isKhmer ? (GENRE_KH_MAP[g.name] || g.name) : g.name;
                // Special badge colors per genre group
                const specialColors: Record<string, string> = {
                  "K-Drama": isSelected ? "bg-pink-600 border-pink-500 text-white shadow-pink-600/30" : "bg-pink-50 dark:bg-pink-900/20 border-pink-200 dark:border-pink-800/40 text-pink-600 dark:text-pink-400 hover:bg-pink-100 dark:hover:bg-pink-900/30",
                  "C-Drama": isSelected ? "bg-amber-600 border-amber-500 text-white shadow-amber-600/30" : "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/40 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30",
                  "Anime":   isSelected ? "bg-purple-600 border-purple-500 text-white shadow-purple-600/30" : "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800/40 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/30",
                  "Romance": isSelected ? "bg-rose-500 border-rose-400 text-white shadow-rose-500/30" : "bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/30",
                };
                const defaultColor = isSelected
                  ? "bg-red-600 border-red-500 text-white shadow-sm shadow-red-600/30"
                  : "bg-white dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700/60 hover:border-red-400/50 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-600 dark:hover:text-red-400";
                return (
                  <button
                    key={g.id}
                    onClick={() => handleGenreChange(g.name)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 border ${
                      specialColors[g.name] || defaultColor
                    }`}
                  >
                    {isSelected && <Check className="h-3 w-3" />}
                    {genreLabel}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Reset Filters */}
        {hasActiveFilters && (
          <button
            onClick={handleResetFilters}
            className="self-start flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-red-500 hover:bg-red-500/10 border border-slate-200 dark:border-slate-700 transition-all duration-200 whitespace-nowrap"
          >
            <X className="w-3.5 h-3.5" />
            {isKhmer ? "កំណត់ឡើងវិញ" : "Reset Filters"}
          </button>
        )}
      </div>

      {/* Grid of Results */}
      <MovieGrid
        type={selectedType}
        genre={selectedGenre}
        country={selectedCountry}
        limit={36}
        aspectRatio={aspectRatio}
      />
    </div>
  );
}

export default function MoviesPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-8 animate-pulse">
          <div className="h-10 w-64 bg-slate-800 rounded-lg" />
          <div className="h-8 w-full max-w-md bg-slate-800/60 rounded-lg" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="aspect-[2/3] rounded-xl bg-slate-800/50" />
            ))}
          </div>
        </div>
      }
    >
      <MoviesPageContent />
    </Suspense>
  );
}
