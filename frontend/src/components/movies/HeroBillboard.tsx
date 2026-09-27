"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Play, Info, Volume2, VolumeX, Sparkles, Film, Star, X } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import type { ContentResponse } from "@/src/types/movie";
import { useLanguage } from "@/src/hooks/useLanguage";

interface HeroBillboardProps {
  movie?: ContentResponse | null;
  allFeatured?: ContentResponse[];
  onMoreInfo?: (movie: ContentResponse) => void;
}

// Curated top tier featured movies with high-res landscape cinema backdrops and trailer IDs
const curatedFeaturedList: Array<ContentResponse & { backdropUrl: string; trailerId: string; khmerTitle?: string; khmerDesc?: string }> = [
  {
    id: "dune-2",
    title: "Dune: Part Two",
    khmerTitle: "ឌូន វគ្គ ២",
    contentType: "MOVIE",
    description:
      "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the universe, he endeavors to prevent a terrible future only he can foresee.",
    khmerDesc:
      "Paul Atreides បានរួបរួមជាមួយ Chani និងកុលសម្ព័ន្ធ Fremen ដើម្បីសងសឹកនឹងអ្នកបំផ្លាញគ្រួសាររបស់គាត់ ដោយត្រូវជ្រើសរើសរវាងស្នេហានិងជោគវាសនានៃចក្រវាល។",
    releaseYear: 2024,
    maturityRating: "PG-13",
    durationMinutes: 166,
    posterUrl: "https://image.tmdb.org/t/p/w780/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
    backdropUrl: "https://image.tmdb.org/t/p/original/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg",
    trailerId: "Way9Dexny3w",
    genres: [{ id: "1", name: "Sci-Fi" }, { id: "2", name: "Adventure" }, { id: "3", name: "Action" }],
    averageRating: 8.9,
  },
  {
    id: "oppenheimer",
    title: "Oppenheimer",
    khmerTitle: "អូផិនហៃម័រ",
    contentType: "MOVIE",
    description:
      "The story of American scientist J. Robert Oppenheimer and his historical role in the development of the atomic bomb during World War II.",
    khmerDesc:
      "ដំណើររឿងរបស់អ្នកវិទ្យាសាស្ត្រអាមេរិក J. Robert Oppenheimer និងតួនាទីប្រវត្តិសាស្ត្រក្នុងការអភិវឌ្ឍគ្រាប់បែកបរមាណូក្នុងសម័យសង្គ្រាមលោកលើកទីពីរ។",
    releaseYear: 2023,
    maturityRating: "R",
    durationMinutes: 180,
    posterUrl: "https://image.tmdb.org/t/p/w780/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
    backdropUrl: "https://image.tmdb.org/t/p/original/nb3xI8XI3w4pMVZ38VijbsyBqP4.jpg",
    trailerId: "uYPbbksJxIg",
    genres: [{ id: "4", name: "Drama" }, { id: "5", name: "History" }],
    averageRating: 8.9,
  },
  {
    id: "interstellar",
    title: "Interstellar",
    khmerTitle: "ដំណើរឆ្លងកាត់លំហអាកាស",
    contentType: "MOVIE",
    description:
      "When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot is tasked to pilot a spacecraft to find a new planet for humanity's survival.",
    khmerDesc:
      "នៅពេលផែនដីមិនអាចរស់នៅបានទៀតកាលពីអនាគត អ្នកបើកយានអវកាសត្រូវធ្វើដំណើរឆ្លងកាត់ប្រហោងខ្មៅដើម្បីស្វែងរកពិភពថ្មីសម្រាប់មនុស្សជាតិ។",
    releaseYear: 2014,
    maturityRating: "PG-13",
    durationMinutes: 169,
    posterUrl: "https://image.tmdb.org/t/p/w780/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    backdropUrl: "https://image.tmdb.org/t/p/original/xJHokMbljvjADYdit5fK5VQsXEG.jpg",
    trailerId: "zSWdZVtXT7E",
    genres: [{ id: "1", name: "Sci-Fi" }, { id: "4", name: "Drama" }],
    averageRating: 8.7,
  },
  {
    id: "arcane",
    title: "Arcane",
    khmerTitle: "អាខេន",
    contentType: "SERIES",
    description:
      "Set in the utopian region of Piltover and the oppressed underground of Zaun, the story follows the origins of two iconic champions and the power that tears them apart.",
    khmerDesc:
      "ដំណើររឿងរវាងទីក្រុងទំនើប Piltover និងពិភពក្រោមដី Zaun ជាមួយនឹងប្រភពដើមនៃបងប្អូនស្រីទាំងពីរ និងជម្លោះដែលផ្លាស់ប្តូរពិភពលោក។",
    releaseYear: 2024,
    maturityRating: "TV-14",
    durationMinutes: 42,
    posterUrl: "https://image.tmdb.org/t/p/w780/fqldf2t8ztc9aiwn3k6mlX3tvRT.jpg",
    backdropUrl: "https://image.tmdb.org/t/p/original/uDgy6hyPd82kOHh6I95FLtLnj6p.jpg",
    trailerId: "fXmAurh012s",
    genres: [{ id: "1", name: "Sci-Fi" }, { id: "3", name: "Action" }, { id: "7", name: "Animation" }],
    averageRating: 9.0,
  },
];

export function HeroBillboard({ movie, allFeatured, onMoreInfo }: HeroBillboardProps) {
  const { lang, t } = useLanguage();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [trailerOpen, setTrailerOpen] = useState(false);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});
  const [siteHero, setSiteHero] = useState<{ title: string; subtitle: string; button: string; bg: string } | null>(null);

  useEffect(() => {
    async function loadHeroSetting() {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const json = await res.json();
          if (json.data?.hero) setSiteHero(json.data.hero);
        }
      } catch {}
    }
    loadHeroSetting();

    const handleUpdate = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.hero) setSiteHero(detail.hero);
    };
    window.addEventListener("siteSettingsUpdated", handleUpdate);
    return () => window.removeEventListener("siteSettingsUpdated", handleUpdate);
  }, []);

  const featuredList = React.useMemo(() => {
    if (!siteHero || !siteHero.title) return curatedFeaturedList;
    const dynamicSlide = {
      id: "admin-featured-hero",
      title: siteHero.title,
      khmerTitle: siteHero.title,
      contentType: "MOVIE" as const,
      description: siteHero.subtitle,
      khmerDesc: siteHero.subtitle,
      releaseYear: 2025,
      maturityRating: "PG-13",
      durationMinutes: 120,
      posterUrl: siteHero.bg,
      backdropUrl: siteHero.bg,
      trailerId: "Way9Dexny3w",
      genres: [{ id: "1", name: "Featured" }, { id: "2", name: "Trending" }],
      averageRating: 9.8,
      customButtonText: siteHero.button,
    };
    return [dynamicSlide, ...curatedFeaturedList];
  }, [siteHero]);

  // Rotate featured movie every 12 seconds automatically unless trailer is open
  useEffect(() => {
    if (trailerOpen) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % featuredList.length);
    }, 12000);
    return () => clearInterval(interval);
  }, [trailerOpen, featuredList.length]);

  const activeMovie = featuredList[activeIndex % featuredList.length] || curatedFeaturedList[0];
  const displayTitle = lang === "kh" && activeMovie.khmerTitle ? activeMovie.khmerTitle : activeMovie.title;
  const displayDesc = lang === "kh" && activeMovie.khmerDesc ? activeMovie.khmerDesc : activeMovie.description;

  const currentImgSrc = imgErrors[activeMovie.id]
    ? (activeMovie.posterUrl || "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=2094&auto=format&fit=crop")
    : (activeMovie.backdropUrl || activeMovie.posterUrl || "");

  return (
    <div className="relative w-full h-[75vh] sm:h-[82vh] lg:h-[90vh] bg-slate-200 dark:bg-[#141414] overflow-hidden select-none">
      {/* Background Image / Backdrop with smooth crossfade */}
      <div className="absolute inset-0">
        <Image
          key={activeMovie.id}
          src={currentImgSrc}
          alt={displayTitle}
          fill
          priority
          onError={() => setImgErrors((prev) => ({ ...prev, [activeMovie.id]: true }))}
          className="object-cover object-center filter brightness-[0.82] transition-opacity duration-1000 animate-in fade-in"
          sizes="100vw"
        />

        {/* Cinematic Multi-Layered Vignettes */}
        {/* Deep Left Vignette for Typography Contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-[#141414]/75 sm:via-[#141414]/60 to-transparent w-full sm:w-[75%] z-10" />

        {/* Bottom Seamless Gradient Fade into Movie Rails */}
        <div className="absolute inset-x-0 bottom-0 h-44 sm:h-64 bg-gradient-to-t from-[#141414] via-[#141414]/85 to-transparent z-10" />

        {/* Top Gradient for Navbar Readability */}
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/90 via-black/40 to-transparent z-10" />
      </div>

      {/* Foreground Content */}
      <div className="relative z-20 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-16 sm:pb-24">
        <div className="max-w-2xl space-y-4">
          {/* Exclusive Badge */}
          <div className="flex items-center gap-2">
            <span className="bg-[#E50914] text-white px-2 py-0.5 text-[10px] font-black rounded-xs tracking-wider">
              KHMERFLIX
            </span>
            <span className="text-xs font-bold tracking-widest text-zinc-300 uppercase">
              {activeMovie.contentType === "SERIES" ? t.hero.series : t.hero.film}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] leading-[1.05]">
            {displayTitle}
          </h1>

          {/* Metadata Badges */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm">
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              {activeMovie.averageRating || "8.9"} {t.hero.match}
            </span>
            <span className="text-zinc-300 font-semibold">{activeMovie.releaseYear || 2024}</span>
            <span className="px-1.5 py-0.5 border border-zinc-500/80 rounded text-[11px] font-semibold text-zinc-300">
              {activeMovie.maturityRating || "PG-13"}
            </span>
            <span className="text-zinc-300 font-medium">
              {activeMovie.durationMinutes ? `${activeMovie.durationMinutes}m` : "2h 15m"}
            </span>
            <span className="px-1.5 py-0.5 border border-zinc-700 bg-zinc-900/80 rounded text-[10px] font-bold text-zinc-300">
              {t.hero.ultraHd}
            </span>
            <span className="px-1.5 py-0.5 border border-zinc-700 bg-zinc-900/80 rounded text-[10px] font-bold text-zinc-300">
              {t.hero.audio}
            </span>
          </div>

          {/* Synopsis */}
          <p className="text-sm sm:text-base text-zinc-200 line-clamp-3 leading-relaxed drop-shadow max-w-xl font-normal">
            {displayDesc}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link href={`/watch/${activeMovie.id}`}>
              <Button className="bg-[#E50914] hover:bg-[#b80710] text-white font-bold text-sm sm:text-base px-6 sm:px-8 py-2.5 sm:py-3 rounded-md flex items-center gap-2 shadow-xl hover:scale-105 transition duration-200 cursor-pointer">
                <Play className="w-5 h-5 fill-white" />
                {(activeMovie as any).customButtonText || t.hero.play}
              </Button>
            </Link>

            <Button
              variant="outline"
              onClick={() => setTrailerOpen(true)}
              className="bg-white/20 hover:bg-white/30 text-white font-semibold text-sm sm:text-base px-5 sm:px-7 py-2.5 sm:py-3 rounded-md border border-white/30 backdrop-blur-md flex items-center gap-2 transition hover:scale-105 duration-200 cursor-pointer"
            >
              <Film className="w-4 h-4 text-white" />
              {t.hero.trailer}
            </Button>

            <Button
              variant="outline"
              onClick={() => onMoreInfo?.(activeMovie)}
              className="bg-zinc-800/80 hover:bg-zinc-700/80 text-white font-semibold text-sm sm:text-base px-5 sm:px-6 py-2.5 sm:py-3 rounded-md border border-zinc-700 backdrop-blur-md flex items-center gap-2 transition hover:scale-105 duration-200 cursor-pointer"
            >
              <Info className="w-4 h-4 text-white" />
              {t.hero.moreInfo}
            </Button>
          </div>
        </div>

        {/* Bottom Right: Slide Selector Thumbnails & Sound Control */}
        <div className="absolute right-4 sm:right-8 bottom-16 sm:bottom-24 flex items-center gap-3 z-20">
          {/* Featured Title Selector Dots / Badges */}
          <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md p-1.5 rounded-full border border-white/10">
            {curatedFeaturedList.map((item, index) => (
              <button
                key={item.id}
                onClick={() => setActiveIndex(index)}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  index === activeIndex
                    ? "w-7 h-2 bg-[#E50914]"
                    : "w-2 h-2 bg-white/40 hover:bg-white/80"
                }`}
                aria-label={`Slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Sound / Mute Button */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="w-9 h-9 rounded-full border border-white/30 bg-black/50 backdrop-blur-sm text-white flex items-center justify-center hover:border-white/70 transition cursor-pointer"
            aria-label="Toggle sound"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Embedded Trailer Modal */}
      {trailerOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-lg flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-zinc-800">
            <button
              onClick={() => setTrailerOpen(false)}
              className="absolute top-3 right-3 z-20 w-9 h-9 bg-black/70 hover:bg-black text-white rounded-full flex items-center justify-center border border-white/20 transition cursor-pointer"
              aria-label="Close Trailer"
            >
              <X className="w-5 h-5" />
            </button>
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${activeMovie.trailerId}?autoplay=1&rel=0`}
              title={`${displayTitle} Official Trailer`}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </div>
  );
}
