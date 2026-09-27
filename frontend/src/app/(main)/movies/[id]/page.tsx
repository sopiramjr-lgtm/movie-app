"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useMovieDetail, useCast, useSeasons, useEpisodes, useReviews, useWatchlist } from "@/src/hooks/useMovies";
import { useLanguage } from "@/src/hooks/useLanguage";
import { reviewApi, profileApi } from "@/src/lib/api/endpoints";
import { useAppSelector, useAppDispatch } from "@/src/store/hooks";
import { setActiveProfile } from "@/src/store/slices/authSlice";
import { Button } from "@/src/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/src/components/ui/card";
import {
  Play,
  Bookmark,
  BookmarkCheck,
  Star,
  Clock,
  Tv,
  Film,
  Users,
  MessageSquare,
  Send,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

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

export default function MovieDetailPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const id = params?.id as string;
  const { lang } = useLanguage();
  const isKhmer = lang === "kh";

  const { activeProfileId, isAuthenticated } = useAppSelector((state) => state.auth);

  const { data: movie, isLoading, error } = useMovieDetail(id);
  const { data: cast = [] } = useCast(id);
  const { data: seasons = [] } = useSeasons(id);
  const { data: reviews = [], refetch: refetchReviews } = useReviews(id);

  const [selectedSeasonId, setSelectedSeasonId] = useState<string | null>(null);
  const effectiveSeasonId = selectedSeasonId || (seasons.length > 0 ? seasons[0].id : null);
  const { data: episodes = [] } = useEpisodes(effectiveSeasonId || "");

  const { data: watchlist = [], addToWatchlist, removeFromWatchlist } = useWatchlist(activeProfileId);
  // Backend returns flat contentId OR nested content.id - check both
  const isSaved = watchlist.some(
    (item) => item?.contentId === id || item?.content?.id === id
  );

  // Review Form state - supports 5 stars or 10 stars scale
  const [ratingScale, setRatingScale] = useState<5 | 10>(10);
  const [rating, setRating] = useState<number>(10);
  const [comment, setComment] = useState<string>("");
  const [submittingReview, setSubmittingReview] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-96 rounded-2xl bg-slate-900 border border-slate-800" />
        <div className="h-40 rounded-2xl bg-slate-900/60 border border-slate-800" />
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="rounded-2xl border border-red-900/50 bg-red-950/20 p-12 text-center text-red-400 max-w-lg mx-auto space-y-4">
        <AlertCircle className="h-10 w-10 mx-auto text-red-500" />
        <h2 className="text-xl font-bold">{isKhmer ? "រកមិនឃើញមាតិកា" : "Content Not Found"}</h2>
        <p className="text-xs text-red-400">
          {isKhmer
            ? "ភាពយន្តដែលអ្នកកំពុងស្វែងរកប្រហែលជាត្រូវបានដកចេញ ឬមិនមាននៅក្នុងប្រព័ន្ធ។"
            : "The title you are looking for may have been removed or does not exist."}
        </p>
        <Button variant="outline" onClick={() => router.push("/movies")}>
          {isKhmer ? "ត្រឡប់ទៅកាតាឡុកវិញ" : "Return to Catalog"}
        </Button>
      </div>
    );
  }

  const handleWatchlistToggle = async () => {
    if (!isAuthenticated) {
      toast.error(isKhmer ? "សូមចូលគណនីដើម្បីបន្ថែមក្នុងបញ្ជីទស្សនា។" : "Please sign in to add titles to your watchlist.");
      router.push("/login");
      return;
    }

    let profileId = activeProfileId;
    if (!profileId) {
      try {
        const profs = await profileApi.getProfiles();
        if (profs && profs.length > 0) {
          profileId = profs[0].id;
          dispatch(setActiveProfile(profileId));
        } else {
          toast.info(isKhmer ? "សូមបង្កើតកម្រងព័ត៌មាន ដើម្បីគ្រប់គ្រងបញ្ជីទស្សនា។" : "Please create a profile to manage your watchlist.");
          router.push("/profile");
          return;
        }
      } catch {
        toast.info(isKhmer ? "សូមជ្រើសរើស ឬបង្កើតកម្រងព័ត៌មាន ដើម្បីគ្រប់គ្រងបញ្ជីទស្សនា។" : "Please select or create a profile to manage your watchlist.");
        router.push("/profile");
        return;
      }
    }

    try {
      if (isSaved) {
        await removeFromWatchlist(id);
        toast.success(isKhmer ? "បានលុបចេញពីបញ្ជីទស្សនា។" : "Removed from your watchlist.");
      } else {
        await addToWatchlist(id);
        toast.success(isKhmer ? "បានបន្ថែមទៅក្នុងបញ្ជីទស្សនា!" : "Added to your watchlist!");
      }
    } catch {
      toast.error(isKhmer ? "មិនអាចធ្វើបច្ចុប្បន្នភាពបញ្ជីទស្សនាបានទេ។" : "Failed to update watchlist.");
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error(isKhmer ? "សូមចូលគណនីដើម្បីបញ្ចេញមតិ។" : "Please sign in to leave a review.");
      router.push("/login");
      return;
    }

    let profileId = activeProfileId;
    if (!profileId) {
      try {
        const profs = await profileApi.getProfiles();
        if (profs && profs.length > 0) {
          profileId = profs[0].id;
          dispatch(setActiveProfile(profileId));
        }
      } catch {}
    }

    if (!profileId) {
      toast.info(isKhmer ? "សូមជ្រើសរើសកម្រងព័ត៌មានដើម្បីបញ្ជូនមតិ។" : "Please select a profile to post a review.");
      router.push("/profile");
      return;
    }

    setSubmittingReview(true);
    try {
      await reviewApi.submitReview(profileId, {
        contentId: id,
        rating,
        comment: comment.trim() || undefined,
      });
      toast.success(isKhmer ? "បានបញ្ជូនការវាយតម្លៃជោគជ័យ!" : "Review published!");
      setComment("");
      refetchReviews();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : isKhmer ? "មិនអាចបញ្ជូនមតិបានទេ។" : "Failed to post review.";
      toast.error(msg);
    } finally {
      setSubmittingReview(false);
    }
  };

  const posterSrc = movie.posterUrl || "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop&q=60";

  return (
    <div className="space-y-12">
      {/* Hero Banner with Backdrop */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-2xl">
        <div className="relative min-h-[420px] flex flex-col md:flex-row items-center p-6 md:p-10 gap-8">
          {/* Background Ambient Glow */}
          <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-slate-950 via-slate-950/80 to-slate-950/30 z-10 pointer-events-none" />

          {/* Poster */}
          <div className="relative w-48 sm:w-60 aspect-[2/3] shrink-0 rounded-xl overflow-hidden border-2 border-slate-700/50 shadow-2xl z-20">
            <Image
              src={posterSrc}
              alt={movie.title}
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Info */}
          <div className="relative z-20 flex-1 space-y-4 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-red-950/80 border border-red-800 text-[11px] font-semibold text-red-400">
                {movie.contentType === "SERIES" ? <Tv className="h-3 w-3" /> : <Film className="h-3 w-3" />}
                {movie.contentType === "SERIES" ? (isKhmer ? "ភាពយន្តភាគ" : "SERIES") : (isKhmer ? "ភាពយន្ត" : "MOVIE")}
              </span>

              {movie.maturityRating && (
                <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[11px] font-medium text-slate-300">
                  {movie.maturityRating}
                </span>
              )}

              {movie.releaseYear && (
                <span className="flex items-center gap-1 text-xs text-slate-400">
                  <Calendar className="h-3.5 w-3.5" />
                  {movie.releaseYear}
                </span>
              )}

              {movie.durationMinutes ? (
                <span className="flex items-center gap-1 text-xs text-slate-400">
                  <Clock className="h-3.5 w-3.5" />
                  {movie.durationMinutes} {isKhmer ? "នាទី" : "min"}
                </span>
              ) : null}

              {movie.averageRating !== undefined && movie.averageRating > 0 && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-950/70 border border-amber-800 text-xs font-semibold text-amber-400">
                  <Star className="h-3.5 w-3.5 fill-amber-400" />
                  {movie.averageRating.toFixed(1)}
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
              {movie.title}
            </h1>

            {movie.genres && movie.genres.length > 0 && (
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-1.5 pt-1">
                {movie.genres.map((g, index) => {
                  const rawName = typeof g === "string" ? g : g.name;
                  const name = isKhmer ? (GENRE_KH_MAP[rawName] || rawName) : rawName;
                  const id = typeof g === "string" ? `${g}-${index}` : g.id || index;
                  return (
                    <span
                      key={id}
                      className="px-2.5 py-0.5 rounded-full bg-slate-800/80 text-xs text-slate-300 border border-slate-700/60"
                    >
                      {name}
                    </span>
                  );
                })}
              </div>
            )}

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl pt-2">
              {movie.description || (isKhmer ? "មិនមានការពិពណ៌នាសម្រាប់ចំណងជើងនេះទេ។" : "No description provided for this title.")}
            </p>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-4">
              <Link href={`/watch/${movie.id}`}>
                <Button size="lg" className="bg-red-600 hover:bg-red-700 shadow-xl shadow-red-600/30 text-white font-semibold flex items-center gap-2">
                  <Play className="h-5 w-5 fill-white" />
                  {isKhmer ? "ទស្សនាឥឡូវនេះ" : "Watch Now"}
                </Button>
              </Link>

              <Button
                size="lg"
                variant="outline"
                onClick={handleWatchlistToggle}
                className="border-slate-700 bg-slate-900/60 hover:bg-slate-800 flex items-center gap-2"
              >
                {isSaved ? (
                  <>
                    <BookmarkCheck className="h-5 w-5 text-emerald-400" />
                    {isKhmer ? "បានរក្សាទុក" : "In Watchlist"}
                  </>
                ) : (
                  <>
                    <Bookmark className="h-5 w-5 text-slate-400" />
                    {isKhmer ? "បន្ថែមក្នុងបញ្ជី" : "Add to Watchlist"}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Cast & Crew Section */}
      {cast.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="h-5 w-5 text-red-500" />
            {isKhmer ? "តួសម្តែង & ក្រុមការងារ" : "Cast & Crew"}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {cast.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center text-center space-y-2"
              >
                <div className="relative w-16 h-16 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  {item.person.profileImageUrl ? (
                    <Image
                      src={item.person.profileImageUrl}
                      alt={item.person.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">
                      {item.person.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-900 dark:text-slate-200 line-clamp-1">{item.person.name}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">{item.characterName || item.role}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* TV Series Seasons & Episodes (if series) */}
      {movie.contentType === "SERIES" && seasons.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Tv className="h-5 w-5 text-cyan-500" />
              {isKhmer ? "រដូវកាល & ភាគទាំងអស់" : "Seasons & Episodes"}
            </h2>

            {/* Season Selector Tabs */}
            <div className="flex items-center gap-2">
              {seasons.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedSeasonId(s.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                    effectiveSeasonId === s.id
                      ? "bg-cyan-600 text-white border-cyan-500 shadow-md shadow-cyan-600/30"
                      : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {isKhmer ? `រដូវកាល ${s.seasonNumber}` : `Season ${s.seasonNumber}`}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {episodes.map((ep) => (
              <Link
                key={ep.id}
                href={`/watch/${movie.id}?episodeId=${ep.id}`}
                className="group p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-cyan-500/50 shadow-sm transition-all flex flex-col justify-between space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
                      {isKhmer ? `ភាគ ${ep.episodeNumber}` : `Episode ${ep.episodeNumber}`}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors">
                      {ep.title}
                    </h3>
                  </div>
                  <Play className="h-4 w-4 text-slate-400 group-hover:text-cyan-500 shrink-0 mt-1" />
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                  {ep.description || (isKhmer ? "ព័ត៌មានលម្អិតនៃភាគនេះនឹងមកដល់ឆាប់ៗ។" : "Episode details coming soon.")}
                </p>
                {ep.durationMinutes && (
                  <span className="text-[10px] text-slate-500 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {ep.durationMinutes} {isKhmer ? "នាទី" : "min"}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Community Reviews & Ratings */}
      <section className="space-y-6 pt-4 border-t border-slate-200 dark:border-slate-800">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-red-500" />
          {isKhmer ? `មតិយោបល់ និងការវាយតម្លៃ (${reviews.length})` : `Community Reviews (${reviews.length})`}
        </h2>

        {/* Post a Review Form */}
        <Card className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/60">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <CardTitle className="text-sm font-semibold text-slate-900 dark:text-slate-200">
                {isKhmer ? "វាយតម្លៃ និងបញ្ចេញមតិលើភាពយន្តនេះ" : "Rate & Review this Title"}
              </CardTitle>

              {/* Star Scale Switcher (5 Stars or 10 Stars) */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700/60 text-xs">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 px-1 font-medium">
                  {isKhmer ? "មាត្រដ្ឋានពិន្ទុ៖" : "Scale:"}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setRatingScale(5);
                    if (rating > 5) setRating(5);
                  }}
                  className={`px-2 py-0.5 rounded font-bold transition-all ${
                    ratingScale === 5
                      ? "bg-red-600 text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  5 {isKhmer ? "ផ្កាយ" : "Stars"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRatingScale(10);
                    if (rating <= 5) setRating(rating * 2);
                  }}
                  className={`px-2 py-0.5 rounded font-bold transition-all ${
                    ratingScale === 10
                      ? "bg-red-600 text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  10 {isKhmer ? "ផ្កាយ" : "Stars"}
                </button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-4">
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {isKhmer ? "ការវាយតម្លៃ៖" : "Rating:"}
                </span>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: ratingScale }, (_, i) => i + 1).map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 text-amber-400 hover:scale-115 transition-transform"
                      title={`${star} / ${ratingScale}`}
                    >
                      <Star
                        className={`${ratingScale === 10 ? "h-4 w-4 sm:h-5 sm:w-5" : "h-5 w-5"} ${
                          star <= rating
                            ? "fill-amber-400 text-amber-400"
                            : "stroke-slate-300 dark:stroke-slate-600 text-transparent"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 ml-1">
                  {rating} / {ratingScale}
                </span>
              </div>

              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={isKhmer ? "ចែករំលែកមតិយោបល់របស់អ្នកអំពីភាពយន្ត ឬរឿងភាគនេះ..." : "Share your thoughts about this movie or series..."}
                className="w-full h-24 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 p-3 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none transition-all"
              />

              <Button
                type="submit"
                disabled={submittingReview}
                className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2 text-xs font-semibold shadow-sm"
              >
                <Send className="h-3.5 w-3.5" />
                {submittingReview ? (isKhmer ? "កំពុងបញ្ជូន..." : "Posting...") : isKhmer ? "បញ្ជូនមតិ" : "Post Review"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Existing Reviews List */}
        <div className="space-y-3">
          {reviews.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/30 rounded-xl border border-slate-200 dark:border-slate-800/60">
              {isKhmer ? "មិនទាន់មានមតិយោបល់នៅឡើយទេ។ សូមក្លាយជាអ្នកដំបូងក្នុងការបញ្ចេញមតិ!" : "No reviews yet. Be the first to share your thoughts!"}
            </div>
          ) : (
            reviews.map((r) => (
              <div
                key={r.id}
                className="p-4 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-red-100 dark:bg-red-950 border border-red-300 dark:border-red-800 flex items-center justify-center font-bold text-red-600 dark:text-red-400 text-xs">
                      {r.profileName ? r.profileName.charAt(0).toUpperCase() : "U"}
                    </div>
                    <span className="font-semibold text-slate-900 dark:text-slate-200">{r.profileName || (isKhmer ? "អ្នកទស្សនាទូទៅ" : "Anonymous Viewer")}</span>
                  </div>
                  <div className="flex items-center gap-1 text-amber-500 dark:text-amber-400 font-bold">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span>{r.rating} / 5</span>
                  </div>
                </div>
                {r.comment && <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed pl-9">{r.comment}</p>}
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
