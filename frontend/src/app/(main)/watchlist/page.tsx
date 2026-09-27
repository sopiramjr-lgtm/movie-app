"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useWatchlist } from "@/src/hooks/useMovies";
import { useAppSelector } from "@/src/store/hooks";
import { useLanguage } from "@/src/hooks/useLanguage";
import { Button } from "@/src/components/ui/button";
import { Bookmark, Trash2, Compass, Film, Lock, Play } from "lucide-react";
import { toast } from "sonner";

export default function WatchlistPage() {
  const { activeProfileId, isAuthenticated } = useAppSelector((state) => state.auth);
  const { lang, t } = useLanguage();
  const { data: watchlist = [], isLoading, removeFromWatchlist } = useWatchlist(activeProfileId);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isKhmer = lang === "kh";

  const handleRemove = async (e: React.MouseEvent, contentId: string) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await removeFromWatchlist(contentId);
      toast.success(isKhmer ? "បានលុបចេញពីបញ្ជីទស្សនា" : "Removed from watchlist.");
    } catch {
      toast.error(isKhmer ? "មិនអាចលុបបានទេ" : "Failed to remove title.");
    }
  };

  if (!mounted || isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
          ))}
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 p-12 text-center max-w-md mx-auto space-y-4 shadow-sm">
        <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto">
          <Lock className="h-6 w-6" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          {isKhmer ? "ចូលគណនីដើម្បីមើលបញ្ជីទស្សនា" : "Sign In to View Watchlist"}
        </h2>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          {isKhmer
            ? "រក្សាទុកភាពយន្ត និងរឿងភាគដែលអ្នកពេញចិត្ត ដើម្បីទស្សនាពេលណាក៏បាន។"
            : "Save your favorite movies and series to watch whenever you want."}
        </p>
        <Link href="/login">
          <Button className="bg-[#E50914] hover:bg-red-700 text-white font-semibold shadow-md">
            {t.nav.signIn || (isKhmer ? "ចូលគណនីឥឡូវនេះ" : "Sign In Now")}
          </Button>
        </Link>
      </div>
    );
  }

  // Support both backend response shapes: flat { contentId, contentTitle, posterUrl } and nested { content: { id, title, ... } }
  const validItems = watchlist.filter(
    (item) => Boolean(item) && (Boolean(item.contentId) || Boolean(item.content?.id))
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800/80 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-[#E50914]">
            <Bookmark className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {t.nav.myList || (isKhmer ? "បញ្ជីរបស់ខ្ញុំ" : "My Watchlist")}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {validItems.length} {isKhmer ? "ចំណងជើងបានរក្សាទុក" : "titles saved"}
            </p>
          </div>
        </div>

        <Link href="/movies">
          <Button
            variant="outline"
            size="sm"
            className="border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 self-start sm:self-auto"
          >
            <Compass className="h-4 w-4" />
            {isKhmer ? "ស្វែងរកភាពយន្តបន្ថែម" : "Discover More"}
          </Button>
        </Link>
      </div>

      {/* Content Grid or Empty State */}
      {validItems.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/30 p-16 text-center max-w-md mx-auto space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center mx-auto text-slate-400 dark:text-slate-500">
            <Film className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
            {isKhmer ? "បញ្ជីទស្សនារបស់អ្នកនៅទទេ" : "Your watchlist is empty"}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm mx-auto">
            {isKhmer
              ? "រុករកកាតាឡុកភាពយន្តរបស់យើង ហើយចុច «បញ្ចូលក្នុងបញ្ជី» ដើម្បីរក្សាទុកភាពយន្តដែលអ្នកចង់ទស្សនា។"
              : "Explore our movie catalog and click \"Add to Watchlist\" to keep track of titles you want to watch."}
          </p>
          <Link href="/movies">
            <Button className="bg-[#E50914] hover:bg-red-700 text-white font-semibold mt-2 shadow-sm">
              {isKhmer ? "រុករកភាពយន្តឥឡូវនេះ" : "Browse Movies"}
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
          {validItems.map((item) => {
            // Resolve content ID/title/poster from either backend shape
            const contentId = item.contentId || item.content?.id || item.id;
            const contentTitle = item.contentTitle || item.content?.title || "Unknown Title";
            const posterUrl = item.posterUrl || item.content?.posterUrl || "";

            return (
              <div key={item.id} className="relative group">
                <Link href={`/movies/${contentId}`} className="block">
                  <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                    {posterUrl ? (
                      <Image
                        src={posterUrl}
                        alt={contentTitle}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-500">
                        <Film className="h-10 w-10" />
                      </div>
                    )}
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Play className="h-10 w-10 text-white fill-white" />
                    </div>
                  </div>
                  <p className="mt-2 text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-2 leading-snug px-0.5">
                    {contentTitle}
                  </p>
                </Link>
                <button
                  type="button"
                  onClick={(e) => handleRemove(e, contentId!)}
                  className="absolute top-2 right-2 z-30 p-2 rounded-lg bg-black/80 hover:bg-red-600 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-200 border border-white/20 shadow-lg cursor-pointer"
                  title={isKhmer ? "លុបចេញពីបញ្ជី" : "Remove from watchlist"}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
