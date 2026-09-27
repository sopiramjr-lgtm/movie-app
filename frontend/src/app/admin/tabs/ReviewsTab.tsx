"use client";

import React, { useState, useCallback, useEffect } from "react";
import { Trash2, RefreshCw, Star } from "lucide-react";
import { toast } from "sonner";
import { adminApi } from "@/src/lib/api/endpoints";
import type { ReviewResponse } from "@/src/types/movie";

interface Props { lang: "en" | "kh"; theme: "light" | "dark"; }

const labels = {
  en: { comment: "Comment", rating: "Rating", user: "User", actions: "Actions", noData: "No reviews found.", confirmDelete: "Delete this review?", filter: "Filter by rating" },
  kh: { comment: "មតិ", rating: "ការវាយតម្លៃ", user: "អ្នកប្រើ", actions: "សកម្មភាព", noData: "រក​មិន​ឃើញ​មតិ​វាយ​តម្លៃ​ណា​ទេ។", confirmDelete: "លុបចោលមតិនេះ?", filter: "ត្រងតាមការវាយតម្លៃ" },
};

export function ReviewsTab({ lang, theme }: Props) {
  const t = labels[lang];
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);

  const isDark = theme === "dark";
  const bg = isDark ? "bg-slate-900" : "bg-white";
  const textH = isDark ? "text-white" : "text-slate-800";
  const textM = isDark ? "text-slate-400" : "text-slate-500";
  const border = isDark ? "border-slate-800" : "border-slate-200";

  const load = useCallback(async () => {
    setLoading(true);
    try { const d = await adminApi.getReviews(0, 100); setReviews(d.content || []); }
    catch (e: any) { toast.error(e.message); } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: string) => {
    if (!confirm(t.confirmDelete)) return;
    try { await adminApi.deleteReview(id); toast.success("Deleted"); load(); }
    catch (e: any) { toast.error(e.message); }
  };

  const filtered = ratingFilter ? reviews.filter(r => Math.floor(r.rating / 2) === ratingFilter) : reviews;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-semibold ${textM} uppercase`}>{t.filter}:</span>
          {[null, 5, 4, 3, 2, 1].map(v => (
            <button key={String(v)} onClick={() => setRatingFilter(v)} className={`px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer ${ratingFilter === v ? "bg-indigo-600 text-white" : `border ${border} ${textM} hover:border-indigo-400`}`}>
              {v === null ? "All" : `${v}★`}
            </button>
          ))}
        </div>
        <button onClick={load} className={`p-2 rounded-lg ${textM} hover:text-indigo-600 cursor-pointer transition`}><RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /></button>
      </div>
      <div className={`${bg} rounded-xl overflow-hidden`}>
        <table className="w-full text-left text-sm">
          <thead className="text-xs uppercase text-gray-500 dark:text-slate-400 font-semibold tracking-wider border-b border-gray-100 dark:border-slate-800">
            <tr>
              <th className="py-4 px-4">{t.comment}</th>
              <th className="py-4 px-4">{t.rating}</th>
              <th className="py-4 px-4">{t.user}</th>
              <th className="py-4 px-4 text-right">{t.actions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
            {loading ? <tr><td colSpan={4} className="py-12 text-center"><div className="flex justify-center"><div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div></td></tr>
              : filtered.length === 0 ? <tr><td colSpan={4} className={`py-12 text-center text-sm ${textM}`}>{t.noData}</td></tr>
              : filtered.map(r => (
                <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className={`py-4 px-4 max-w-sm ${textH}`}><p className="line-clamp-2">{r.comment || "—"}</p></td>
                  <td className="py-4 px-4">
                    <span className="flex items-center gap-1 text-amber-500 font-bold text-sm">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />{r.rating}/10
                    </span>
                  </td>
                  <td className={`py-4 px-4 text-xs ${textM}`}>{(r as any).profileId || (r as any).userId || "—"}</td>
                  <td className="py-4 px-4 text-right"><button onClick={() => handleDelete(r.id)} className={`${textM} hover:text-red-500 p-1.5 rounded cursor-pointer`}><Trash2 className="w-4 h-4" /></button></td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
