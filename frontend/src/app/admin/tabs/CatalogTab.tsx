"use client";

import React, { useState, useCallback, useEffect } from "react";
import { Plus, Edit2, Trash2, RefreshCw, Search, X } from "lucide-react";
import { toast } from "sonner";
import { adminApi, catalogApi } from "@/src/lib/api/endpoints";
import type { ContentResponse, GenreResponse } from "@/src/types/movie";

interface Props {
  lang: "en" | "kh";
  theme: "light" | "dark";
}

const labels = {
  en: {
    addTitle: "Add Title",
    editTitle: "Edit Title",
    title: "Title",
    type: "Type",
    actions: "Actions",
    posterUrl: "Poster URL",
    description: "Description",
    year: "Release Year",
    rating: "Maturity Rating",
    duration: "Duration (min)",
    genres: "Genres",
    save: "Save",
    cancel: "Cancel",
    noData: "No movies or series yet. Click Add Title to create one.",
    confirmDelete: "Delete this title permanently?",
    searchPlaceholder: "Search titles...",
    movie: "MOVIE",
    series: "SERIES",
  },
  kh: {
    addTitle: "បន្ថែមភាពយន្ត",
    editTitle: "កែប្រែភាពយន្ត",
    title: "ចំណងជើង",
    type: "ប្រភេទ",
    actions: "សកម្មភាព",
    posterUrl: "URL រូបភាព",
    description: "ការពិពណ៌នា",
    year: "ឆ្នាំចេញផ្សាយ",
    rating: "ចំណាត់ថ្នាក់",
    duration: "រយៈពេល (នាទី)",
    genres: "ប្រភេទ",
    save: "រក្សាទុក",
    cancel: "បោះបង់",
    noData: "មិនទាន់មានភាពយន្តនៅឡើយទេ។",
    confirmDelete: "លុបចោលភាពយន្តនេះជាអចិន្ត្រៃយ៍?",
    searchPlaceholder: "ស្វែងរកភាពយន្ត...",
    movie: "ភាពយន្ត",
    series: "ភាគ",
  },
};

export function CatalogTab({ lang, theme }: Props) {
  const t = labels[lang];
  const [catalog, setCatalog] = useState<ContentResponse[]>([]);
  const [genres, setGenres] = useState<GenreResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<Partial<ContentResponse> & { genreIds?: string[] }>({});

  const isDark = theme === "dark";
  const bg = isDark ? "bg-slate-900" : "bg-white";
  const textH = isDark ? "text-white" : "text-slate-800";
  const textM = isDark ? "text-slate-400" : "text-slate-500";
  const border = isDark ? "border-slate-800" : "border-slate-200";
  const inputCls = `w-full border ${border} ${isDark ? "bg-slate-800 text-white placeholder:text-slate-500" : "bg-white text-slate-800"} rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500`;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [contentsData, genresData] = await Promise.all([
        catalogApi.getContents(0, 100),
        catalogApi.getGenres(),
      ]);
      setCatalog(contentsData.content || []);
      setGenres(Array.isArray(genresData) ? genresData : []);
    } catch (e: any) {
      toast.error(e.message || "Failed to load catalog");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setForm({}); setModalOpen(true); };
  const openEdit = (c: ContentResponse) => {
    setForm({
      ...c,
      genreIds:
        c.genres
          ?.map((g) => (typeof g === "string" ? genres.find((item) => item.name.toLowerCase() === g.toLowerCase())?.id : g.id))
          .filter((id): id is string => Boolean(id)) || [],
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t.confirmDelete)) return;
    try {
      await adminApi.deleteContent(id);
      toast.success("Deleted");
      load();
    } catch (e: any) { toast.error(e.message); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        title: form.title,
        contentType: form.contentType || "MOVIE",
        description: form.description,
        releaseYear: form.releaseYear ? Number(form.releaseYear) : undefined,
        maturityRating: form.maturityRating,
        durationMinutes: form.durationMinutes ? Number(form.durationMinutes) : undefined,
        posterUrl: form.posterUrl,
        genreIds: form.genreIds || [],
      };
      if ((form as any).id) {
        await adminApi.updateContent((form as any).id, payload);
        toast.success("Updated");
      } else {
        await adminApi.createContent(payload);
        toast.success("Created");
      }
      setModalOpen(false);
      load();
    } catch (e: any) { toast.error(e.message); }
  };

  const filtered = catalog.filter(c =>
    c.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className={`flex items-center gap-2 border ${border} rounded-lg px-3 py-2 text-sm flex-1 min-w-[200px] max-w-xs ${isDark ? "bg-slate-800" : "bg-white"}`}>
          <Search className={`w-4 h-4 ${textM} flex-shrink-0`} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t.searchPlaceholder}
            className={`bg-transparent focus:outline-none text-sm w-full ${textH}`}
          />
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className={`p-2 rounded-lg ${textM} hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition cursor-pointer`}>
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={openCreate}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 cursor-pointer transition"
          >
            <Plus className="w-4 h-4" /> {t.addTitle}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className={`${bg} rounded-xl overflow-hidden`}>
        <table className="w-full text-left text-sm">
          <thead className="text-xs uppercase text-gray-500 dark:text-slate-400 font-semibold tracking-wider border-b border-gray-100 dark:border-slate-800">
            <tr>
              <th className="py-4 px-4">{t.title}</th>
              <th className="py-4 px-4">{t.type}</th>
              <th className="py-4 px-4">Year</th>
              <th className="py-4 px-4 text-right">{t.actions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
            {loading ? (
              <tr><td colSpan={4} className="py-12 text-center"><div className="flex justify-center"><div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div></td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={4} className={`py-12 text-center text-sm ${textM}`}>{t.noData}</td></tr>
            ) : filtered.map(c => (
              <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors">
                <td className={`py-4 px-4 font-medium ${textH}`}>{c.title}</td>
                <td className="py-4 px-4">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${c.contentType === "MOVIE" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" : "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"}`}>
                    {c.contentType === "MOVIE" ? t.movie : t.series}
                  </span>
                </td>
                <td className={`py-4 px-4 ${textM}`}>{c.releaseYear || "—"}</td>
                <td className="py-4 px-4 text-right">
                  <button onClick={() => openEdit(c)} className={`${textM} hover:text-blue-500 p-1.5 rounded cursor-pointer`}><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(c.id)} className={`${textM} hover:text-red-500 p-1.5 rounded cursor-pointer ml-1`}><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`${bg} rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border ${border}`}>
            <div className={`flex items-center justify-between px-6 py-4 border-b ${border}`}>
              <h3 className={`text-lg font-bold ${textH}`}>{(form as any).id ? t.editTitle : t.addTitle}</h3>
              <button onClick={() => setModalOpen(false)} className={`${textM} hover:text-red-500 cursor-pointer`}><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className={`text-xs font-semibold ${textM} mb-1 block uppercase`}>{t.title} *</label>
                  <input required value={form.title || ""} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className={inputCls} placeholder="Movie or series title" />
                </div>
                <div>
                  <label className={`text-xs font-semibold ${textM} mb-1 block uppercase`}>{t.type}</label>
                  <select value={form.contentType || "MOVIE"} onChange={e => setForm(f => ({ ...f, contentType: e.target.value as any }))} className={inputCls}>
                    <option value="MOVIE">MOVIE</option>
                    <option value="SERIES">SERIES</option>
                  </select>
                </div>
                <div>
                  <label className={`text-xs font-semibold ${textM} mb-1 block uppercase`}>{t.year}</label>
                  <input type="number" value={form.releaseYear || ""} onChange={e => setForm(f => ({ ...f, releaseYear: Number(e.target.value) }))} className={inputCls} placeholder="2024" />
                </div>
                <div>
                  <label className={`text-xs font-semibold ${textM} mb-1 block uppercase`}>{t.rating}</label>
                  <select value={form.maturityRating || "PG-13"} onChange={e => setForm(f => ({ ...f, maturityRating: e.target.value }))} className={inputCls}>
                    {["G","PG","PG-13","R","NC-17","TV-Y","TV-G","TV-PG","TV-14","TV-MA"].map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className={`text-xs font-semibold ${textM} mb-1 block uppercase`}>{t.duration}</label>
                  <input type="number" value={form.durationMinutes || ""} onChange={e => setForm(f => ({ ...f, durationMinutes: Number(e.target.value) }))} className={inputCls} placeholder="120" />
                </div>
                <div className="col-span-2">
                  <label className={`text-xs font-semibold ${textM} mb-1 block uppercase`}>{t.posterUrl}</label>
                  <input value={form.posterUrl || ""} onChange={e => setForm(f => ({ ...f, posterUrl: e.target.value }))} className={inputCls} placeholder="https://..." />
                </div>
                <div className="col-span-2">
                  <label className={`text-xs font-semibold ${textM} mb-1 block uppercase`}>{t.description}</label>
                  <textarea rows={3} value={form.description || ""} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className={inputCls} />
                </div>
                {genres.length > 0 && (
                  <div className="col-span-2">
                    <label className={`text-xs font-semibold ${textM} mb-1 block uppercase`}>{t.genres}</label>
                    <div className="flex flex-wrap gap-2">
                      {genres.map(g => {
                        const selected = (form.genreIds || []).includes(g.id);
                        return (
                          <button
                            key={g.id}
                            type="button"
                            onClick={() => setForm(f => ({
                              ...f,
                              genreIds: selected
                                ? (f.genreIds || []).filter(id => id !== g.id)
                                : [...(f.genreIds || []), g.id]
                            }))}
                            className={`px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition ${selected ? "bg-indigo-600 text-white" : `border ${border} ${textM} hover:border-indigo-400`}`}
                          >
                            {g.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg font-semibold text-sm cursor-pointer transition">{t.save}</button>
                <button type="button" onClick={() => setModalOpen(false)} className={`flex-1 border ${border} ${textM} py-2.5 rounded-lg font-semibold text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800 transition`}>{t.cancel}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
