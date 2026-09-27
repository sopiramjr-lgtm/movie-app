"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useHistory } from "@/src/hooks/useMovies";
import { useAppSelector } from "@/src/store/hooks";
import { historyApi } from "@/src/lib/api/endpoints";
import { Button } from "@/src/components/ui/button";
import { History as HistoryIcon, Play, Trash2, CheckCircle2, Film } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export default function HistoryPage() {
  const queryClient = useQueryClient();
  const { activeProfileId, isAuthenticated } = useAppSelector((state) => state.auth);
  const { data: history = [], isLoading } = useHistory(activeProfileId);

  const handleClear = async () => {
    if (!activeProfileId) return;
    try {
      await historyApi.clearHistory(activeProfileId);
      queryClient.invalidateQueries({ queryKey: ["history", activeProfileId] });
      toast.success("Watch history cleared.");
    } catch {
      toast.error("Failed to clear watch history.");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center max-w-md mx-auto space-y-4">
        <HistoryIcon className="h-10 w-10 mx-auto text-cyan-400" />
        <h2 className="text-2xl font-bold text-white">Sign In to View Watch History</h2>
        <p className="text-xs text-slate-400">Track your streaming progress and resume watching anytime.</p>
        <Link href="/login">
          <Button className="bg-red-600 hover:bg-red-700">Sign In</Button>
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <h1 className="text-3xl font-extrabold text-white">Watch History</h1>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-slate-900 border border-slate-800" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-950/70 border border-cyan-900/50 text-cyan-400">
            <HistoryIcon className="h-6 w-6 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Watch History</h1>
            <p className="text-xs text-slate-400">Titles you have watched recently</p>
          </div>
        </div>

        {history.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleClear}
            className="border-slate-800 text-slate-400 hover:text-red-400 hover:border-red-900/50 flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Clear History
          </Button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-16 text-center max-w-md mx-auto space-y-4">
          <Film className="h-12 w-12 mx-auto text-slate-600" />
          <h3 className="text-lg font-bold text-slate-200">No watch history yet</h3>
          <p className="text-xs text-slate-400">
            Start streaming movies or series to keep track of your watch progress.
          </p>
          <Link href="/movies">
            <Button className="bg-red-600 hover:bg-red-700 mt-2">Start Streaming</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((item) => {
            const posterSrc = item.content.posterUrl || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop&q=60";
            return (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-4 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="relative w-16 h-24 rounded-lg overflow-hidden shrink-0 bg-slate-950 border border-slate-800">
                    <Image src={posterSrc} alt={item.content.title} fill className="object-cover" />
                  </div>
                  <div className="min-w-0 space-y-1">
                    <h3 className="font-bold text-base text-slate-100 truncate">{item.content.title}</h3>
                    {item.episode && (
                      <p className="text-xs text-cyan-400 font-medium">
                        Episode {item.episode.episodeNumber}: {item.episode.title}
                      </p>
                    )}
                    <p className="text-xs text-slate-400">
                      Progress: {Math.floor(item.progressSeconds / 60)} minutes watched
                    </p>
                    {item.completed && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                        <CheckCircle2 className="h-3 w-3" /> Completed
                      </span>
                    )}
                  </div>
                </div>

                <Link href={`/watch/${item.content.id}${item.episode ? `?episodeId=${item.episode.id}` : ""}`}>
                  <Button size="sm" className="bg-red-600 hover:bg-red-700 flex items-center gap-1.5 shrink-0">
                    <Play className="h-3.5 w-3.5 fill-white" />
                    Resume
                  </Button>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
