"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useMovieDetail } from "@/src/hooks/useMovies";
import { catalogApi, historyApi } from "@/src/lib/api/endpoints";
import { useAppSelector } from "@/src/store/hooks";
import { Button } from "@/src/components/ui/button";
import {
  ArrowLeft,
  Play,
  Pause,
  Volume2,
  Volume1,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  Tv,
  Film,
  RotateCcw,
  RotateCw,
  Video,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  Check,
  ChevronRight,
  Info,
} from "lucide-react";
import type { ContentAssetResponse } from "@/src/types/movie";

// Reliable backup video stream (Oceans HD)
const RELIABLE_BACKUP_STREAM = "https://vjs.zencdn.net/v/oceans.mp4";

// Helper to extract YouTube video ID from various formats
function extractYouTubeId(url?: string): string | null {
  if (!url) return null;
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/
  );
  return match ? match[1] : null;
}

export default function WatchPlayerPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const id = params?.id as string;
  const episodeId = searchParams.get("episodeId");

  const { activeProfileId } = useAppSelector((state) => state.auth);
  const { data: movie, isLoading: isMovieLoading } = useMovieDetail(id);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Streaming State
  const [assets, setAssets] = useState<ContentAssetResponse[]>([]);
  const [selectedAssetUrl, setSelectedAssetUrl] = useState<string>("");
  const [activeMode, setActiveMode] = useState<"stream" | "trailer">("stream");
  const [hasStreamError, setHasStreamError] = useState<boolean>(false);
  const [isBuffering, setIsBuffering] = useState<boolean>(true);

  // Playback Controls State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(1);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showControls, setShowControls] = useState<boolean>(true);

  // Fetch quality assets
  useEffect(() => {
    if (!id) return;
    catalogApi
      .getContentAssets(id)
      .then((data) => {
        const videoAssets = data.filter((a) => a.assetType === "VIDEO");
        setAssets(videoAssets);
        if (videoAssets.length > 0) {
          const primary = videoAssets.find((a) => a.isPrimary) || videoAssets[0];
          setSelectedAssetUrl(primary.url);
        }
      })
      .catch(() => {});
  }, [id]);

  const youtubeVideoId = extractYouTubeId(movie?.videoUrl);
  const youtubeTrailerId = extractYouTubeId(movie?.trailerUrl);
  const isVideoUrlYouTube = Boolean(youtubeVideoId);

  // Effective YouTube ID based on activeMode or availability
  const youtubeId =
    activeMode === "stream" && youtubeVideoId
      ? youtubeVideoId
      : (youtubeTrailerId || youtubeVideoId);

  // If videoUrl is a YouTube link, default to iframe trailer/video mode
  useEffect(() => {
    if (isVideoUrlYouTube && !selectedAssetUrl) {
      setActiveMode("trailer");
    }
  }, [isVideoUrlYouTube, selectedAssetUrl]);

  // Determine effective stream URL (MP4 / HLS direct stream)
  const isDirectVideo =
    movie?.videoUrl &&
    !isVideoUrlYouTube &&
    !movie.videoUrl.includes("gtv-videos-bucket");

  const effectiveVideoUrl =
    selectedAssetUrl ||
    (isDirectVideo ? movie.videoUrl : RELIABLE_BACKUP_STREAM);

  // Reset stream error if URL changes
  useEffect(() => {
    setHasStreamError(false);
  }, [effectiveVideoUrl]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Controls auto-hide
  const triggerControls = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
        setShowSpeedMenu(false);
      }
    }, 3500);
  }, [isPlaying]);

  // Keyboard shortcuts (Space, Arrow keys, F, M)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when focusing inputs
      if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.code === "Space" || e.key === "k") {
        e.preventDefault();
        togglePlay();
      } else if (e.code === "ArrowLeft" || e.key === "j") {
        e.preventDefault();
        skipTime(-10);
      } else if (e.code === "ArrowRight" || e.key === "l") {
        e.preventDefault();
        skipTime(10);
      } else if (e.key === "m" || e.key === "M") {
        e.preventDefault();
        toggleMute();
      } else if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        toggleFullscreen();
      }
      triggerControls();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPlaying, isMuted, triggerControls]);

  // Save progress to watch history periodically
  useEffect(() => {
    if (!activeProfileId || !isPlaying || activeMode !== "stream") return;

    const interval = setInterval(() => {
      if (videoRef.current && videoRef.current.currentTime > 5) {
        const progressSeconds = Math.floor(videoRef.current.currentTime);
        const completed = duration > 0 && progressSeconds / duration > 0.9;
        historyApi
          .saveProgress(activeProfileId, {
            contentId: id,
            episodeId: episodeId || undefined,
            progressSeconds,
            completed,
          })
          .catch(() => {});
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [activeProfileId, isPlaying, id, episodeId, duration, activeMode]);

  // Playback handlers
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const skipTime = (seconds: number) => {
    if (!videoRef.current) return;
    const newTime = Math.min(Math.max(0, videoRef.current.currentTime + seconds), duration || 100);
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value);
    setVolume(v);
    if (videoRef.current) {
      videoRef.current.volume = v;
      videoRef.current.muted = v === 0;
    }
    setIsMuted(v === 0);
  };

  const handleSpeedChange = (rate: number) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
    setShowSpeedMenu(false);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "00:00";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) {
      return `${h}:${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`;
    }
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const handleVideoError = () => {
    setHasStreamError(true);
    setIsBuffering(false);
    setIsPlaying(false);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={triggerControls}
      onClick={triggerControls}
      className="fixed inset-0 bg-black z-50 flex flex-col justify-center items-center select-none overflow-hidden"
    >
      {/* ── 1. ACTIVE VIDEO SURFACE (HTML5 vs YouTube Trailer) ── */}
      {activeMode === "trailer" && youtubeId ? (
        <div className="w-full h-full relative">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&controls=1&modestbranding=1&rel=0`}
            title={movie?.title || "Movie Trailer"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full border-0"
          />
        </div>
      ) : (
        <div className="relative w-full h-full flex items-center justify-center">
          <video
            ref={videoRef}
            src={effectiveVideoUrl}
            className="w-full h-full object-contain cursor-pointer"
            onClick={togglePlay}
            onTimeUpdate={() => {
              if (videoRef.current) {
                setCurrentTime(videoRef.current.currentTime);
              }
            }}
            onLoadedMetadata={() => {
              if (videoRef.current) {
                setDuration(videoRef.current.duration);
                setIsBuffering(false);
              }
            }}
            onWaiting={() => setIsBuffering(true)}
            onPlaying={() => {
              setIsBuffering(false);
              setIsPlaying(true);
            }}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
            onError={handleVideoError}
            playsInline
            autoPlay
          />

          {/* Buffering Indicator */}
          {isBuffering && !hasStreamError && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-16 h-16 rounded-full border-4 border-red-500/20 border-t-red-600 animate-spin" />
            </div>
          )}

          {/* Stream Error Recovery Card */}
          {hasStreamError && (
            <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-30">
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-4 text-red-500">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white mb-1">Stream Source Unavailable</h3>
              <p className="text-xs text-zinc-400 max-w-md mb-6 leading-relaxed">
                The primary video host is currently unreachable. You can switch to the official YouTube
                cinema trailer or load the verified backup stream.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3">
                {youtubeId && (
                  <Button
                    onClick={() => setActiveMode("trailer")}
                    className="bg-red-600 hover:bg-red-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-red-950/50 flex items-center gap-2"
                  >
                    <Video className="w-4 h-4" /> Watch Official Trailer
                  </Button>
                )}

                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedAssetUrl(RELIABLE_BACKUP_STREAM);
                    setHasStreamError(false);
                    if (videoRef.current) {
                      videoRef.current.src = RELIABLE_BACKUP_STREAM;
                      videoRef.current.load();
                      videoRef.current.play().catch(() => {});
                    }
                  }}
                  className="bg-zinc-800/80 border-white/10 hover:bg-white/10 text-white font-semibold text-xs px-5 py-2.5 rounded-xl flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" /> Load Backup Stream
                </Button>

                <Button
                  variant="ghost"
                  onClick={() => router.push(`/movies/${id}`)}
                  className="text-zinc-400 hover:text-white text-xs px-4"
                >
                  Back to Details
                </Button>
              </div>
            </div>
          )}

          {/* Center Splash Play/Pause Indicator when paused */}
          {!isPlaying && !isBuffering && !hasStreamError && (
            <button
              onClick={togglePlay}
              className="absolute w-20 h-20 rounded-full bg-red-600/90 hover:bg-red-600 hover:scale-110 text-white flex items-center justify-center shadow-2xl shadow-red-950/80 transition-all duration-200 z-20"
              aria-label="Play Video"
            >
              <Play className="w-8 h-8 fill-white ml-1" />
            </button>
          )}
        </div>
      )}

      {/* ── 2. CINEMATIC OVERLAY CONTROLS ── */}
      <div
        className={`absolute inset-0 flex flex-col justify-between p-4 sm:p-8 bg-gradient-to-t from-black/90 via-transparent to-black/70 transition-opacity duration-300 pointer-events-none z-40 ${
          showControls ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* ── Top Bar ── */}
        <div className="flex items-center justify-between pointer-events-auto">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <button
              onClick={() => router.push(`/movies/${id}`)}
              className="w-10 h-10 rounded-full bg-black/60 hover:bg-white/20 backdrop-blur-md border border-white/10 text-white flex items-center justify-center transition shrink-0"
              aria-label="Go Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-white tracking-tight truncate">
                  {movie?.title || "KhmerFlix Cinema"}
                </h1>
                {movie?.contentType === "SERIES" ? (
                  <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 text-[10px] font-bold border border-cyan-500/30">
                    <Tv className="w-3 h-3" /> SERIES
                  </span>
                ) : (
                  <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-500/20 text-red-300 text-[10px] font-bold border border-red-500/30">
                    <Film className="w-3 h-3" /> MOVIE
                  </span>
                )}
                {movie?.maturityRating && (
                  <span className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[10px] font-mono border border-white/5">
                    {movie.maturityRating}
                  </span>
                )}
              </div>
              {episodeId ? (
                <p className="text-xs text-zinc-400">Streaming Episode</p>
              ) : (
                <p className="text-xs text-zinc-400">
                  {movie?.releaseYear} • {movie?.durationMinutes ? `${movie.durationMinutes} min` : "Full Feature"}
                </p>
              )}
            </div>
          </div>

          {/* Mode Switcher: Feature Film vs Official Trailer */}
          <div className="flex items-center gap-2">
            {youtubeId && (
              <div className="flex items-center bg-black/60 backdrop-blur-md rounded-xl p-1 border border-white/10">
                <button
                  onClick={() => {
                    setActiveMode("stream");
                    setHasStreamError(false);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeMode === "stream"
                      ? "bg-red-600 text-white shadow-md shadow-red-950/60"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Feature Stream
                </button>
                <button
                  onClick={() => setActiveMode("trailer")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeMode === "trailer"
                      ? "bg-red-600 text-white shadow-md shadow-red-950/60"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  <Video className="w-3.5 h-3.5 text-red-400" />
                  Trailer
                </button>
              </div>
            )}

            {/* Quality Tag */}
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-900/80 border border-white/10 text-[11px] font-bold text-zinc-300">
              <Sparkles className="w-3 h-3 text-amber-400" /> 1080p FHD
            </span>
          </div>
        </div>

        {/* ── Bottom Controls (Stream Mode) ── */}
        {activeMode === "stream" && (
          <div className="space-y-3 pointer-events-auto max-w-4xl mx-auto w-full">
            {/* Scrubber Progress Bar */}
            <div className="space-y-1">
              <div className="relative group flex items-center">
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  step={0.5}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-1.5 hover:h-2.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-red-600 transition-all duration-150 focus:outline-none"
                  aria-label="Seek time"
                />
              </div>

              {/* Time Indicators */}
              <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 px-0.5">
                <span>{formatTime(currentTime)}</span>
                <span>-{formatTime(Math.max(0, (duration || 0) - currentTime))}</span>
              </div>
            </div>

            {/* Button Tray */}
            <div className="flex items-center justify-between pt-1">
              {/* Left tray: Play/Pause, Skips, Volume */}
              <div className="flex items-center gap-2 sm:gap-4">
                {/* Play / Pause */}
                <button
                  onClick={togglePlay}
                  className="w-10 h-10 rounded-full bg-white hover:bg-zinc-200 text-black flex items-center justify-center shadow-lg transition-transform active:scale-95"
                  aria-label={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 fill-black" />
                  ) : (
                    <Play className="w-5 h-5 fill-black ml-0.5" />
                  )}
                </button>

                {/* Rewind 10s */}
                <button
                  onClick={() => skipTime(-10)}
                  className="w-9 h-9 rounded-full hover:bg-white/10 text-zinc-300 hover:text-white flex items-center justify-center transition"
                  title="Rewind 10s (Left Arrow)"
                >
                  <RotateCcw className="w-4.5 h-4.5" />
                </button>

                {/* Forward 10s */}
                <button
                  onClick={() => skipTime(10)}
                  className="w-9 h-9 rounded-full hover:bg-white/10 text-zinc-300 hover:text-white flex items-center justify-center transition"
                  title="Forward 10s (Right Arrow)"
                >
                  <RotateCw className="w-4.5 h-4.5" />
                </button>

                {/* Volume Slider */}
                <div className="flex items-center gap-2 group/volume pl-1">
                  <button
                    onClick={toggleMute}
                    className="text-zinc-300 hover:text-white transition"
                    title={isMuted ? "Unmute (M)" : "Mute (M)"}
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="w-5 h-5 text-red-400" />
                    ) : volume < 0.5 ? (
                      <Volume1 className="w-5 h-5" />
                    ) : (
                      <Volume2 className="w-5 h-5" />
                    )}
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-16 sm:w-20 h-1 bg-zinc-700 rounded appearance-none cursor-pointer accent-red-500 group-hover/volume:h-1.5 transition-all"
                    aria-label="Volume"
                  />
                </div>
              </div>

              {/* Right tray: Playback Speed, Quality, Fullscreen */}
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Playback Speed Menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowSpeedMenu((v) => !v)}
                    className="px-2.5 py-1 rounded-lg hover:bg-white/10 text-xs font-semibold text-zinc-300 hover:text-white transition"
                  >
                    {playbackRate}x
                  </button>

                  {showSpeedMenu && (
                    <div className="absolute bottom-full right-0 mb-2 py-1 bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl text-xs z-50 min-w-24">
                      {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                        <button
                          key={rate}
                          onClick={() => handleSpeedChange(rate)}
                          className={`w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-white/10 transition ${
                            playbackRate === rate ? "text-red-400 font-bold" : "text-zinc-300"
                          }`}
                        >
                          <span>{rate}x</span>
                          {playbackRate === rate && <Check className="w-3 h-3 text-red-400" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Fullscreen Button */}
                <button
                  onClick={toggleFullscreen}
                  className="w-9 h-9 rounded-full hover:bg-white/10 text-zinc-300 hover:text-white flex items-center justify-center transition"
                  title="Fullscreen (F)"
                >
                  {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
