"use client";

import React, { useState, useCallback, useEffect } from "react";
import { Plus, Trash2, Edit2, RefreshCw, X } from "lucide-react";
import { toast } from "sonner";
import { adminApi, catalogApi } from "@/src/lib/api/endpoints";
import type { GenreResponse } from "@/src/types/movie";

interface Props { lang: "en" | "kh"; theme: "light" | "dark"; }

const labels = {
  en: {
    name: "Name",
    slug: "Slug",
    actions: "Actions",
    addGenre: "Add Genre",
    editGenre: "Edit Genre",
    noData: "No genres yet.",
    confirmDelete: "Are you sure you want to delete this genre?",
    save: "Save",
    cancel: "Cancel",
    namePlaceholder: "e.g. Action",
    slugPlaceholder: "e.g. action",
  },
  kh: {
    name: "ឈ្មោះ",
    slug: "Slug",
    actions: "សកម្មភាព",
    addGenre: "បន្ថែមប្រភេទ",
    editGenre: "កែប្រែប្រភេទ",
    noData: "មិនទាន់មានប្រភេទណាទេ។",
    confirmDelete: "តើអ្នកប្រាកដជាចង់លុបប្រភេទនេះមែនទេ?",
    save: "រក្សាទុក",
    cancel: "បោះបង់",
    namePlaceholder: "ឧទាហរណ៍៖ ផ្សងព្រេង",
    slugPlaceholder: "ឧទាហរណ៍៖ adventure",
  },
};

export function GenresTab({ lang, theme }: Props) {
  const t = labels[lang];
  const [genres, setGenres] = useState<GenreResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", slug: "" });

  const isDark = theme === "dark";
  const bg = isDark ? "bg-slate-900" : "bg-white";
  const textH = isDark ? "text-white" : "text-slate-800";
  const textM = isDark ? "text-slate-400" : "text-slate-500";
  const border = isDark ? "border-slate-800" : "border-slate-200";
  const inputCls = `w-full border ${border} ${isDark ? "bg-slate-800 text-white placeholder:text-slate-500" : "bg-white text-slate-800"} rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500`;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await catalogApi.getGenres();
      setGenres(Array.isArray(d) ? d : []);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm({ name: "", slug: "" });
    setModalOpen(true);
  };

  const handleOpenEdit = (genre: GenreResponse) => {
    setEditingId(genre.id);
    setForm({ name: genre.name, slug: genre.slug || "" });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const slugVal = form.slug?.trim() || form.name.toLowerCase().replace(/\s+/g, "-");
      if (editingId) {
        await adminApi.updateGenre(editingId, { name: form.name, slug: slugVal });
        toast.success(lang === "kh" ? "បានកែប្រែប្រភេទជោគជ័យ" : "Genre updated successfully");
      } else {
        await adminApi.createGenre({ name: form.name, slug: slugVal });
        toast.success(lang === "kh" ? "បានបង្កើតប្រភេទជោគជ័យ" : "Genre created successfully");
      }
      setModalOpen(false);
      setForm({ name: "", slug: "" });
      setEditingId(null);
      load();
    } catch (e: any) {
      toast.error(e.message || "Failed to save genre");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t.confirmDelete)) return;
    try {
      await adminApi.deleteGenre(id);
      toast.success(lang === "kh" ? "បានលុបប្រភេទជោគជ័យ" : "Genre deleted successfully");
      load();
    } catch (e: any) {
      toast.error(e.message || "Failed to delete genre");
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Header Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={load}
          className={`p-2 rounded-lg ${textM} hover:text-indigo-600 cursor-pointer transition`}
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
        <button
          onClick={handleOpenCreate}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 cursor-pointer transition shadow-sm hover:shadow"
        >
          <Plus className="w-4 h-4" />
          <span>{t.addGenre}</span>
        </button>
      </div>

      {/* Genres Table */}
      <div className={`${bg} rounded-xl overflow-hidden border ${border} shadow-sm`}>
        <table className="w-full text-left text-sm">
          <thead className="text-xs uppercase text-gray-500 dark:text-slate-400 font-semibold tracking-wider border-b border-gray-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
            <tr>
              <th className="py-4 px-4">{t.name}</th>
              <th className="py-4 px-4">{t.slug}</th>
              <th className="py-4 px-4 text-right">{t.actions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
            {loading ? (
              <tr>
                <td colSpan={3} className="py-12 text-center">
                  <div className="flex justify-center">
                    <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                </td>
              </tr>
            ) : genres.length === 0 ? (
              <tr>
                <td colSpan={3} className={`py-12 text-center text-sm ${textM}`}>
                  {t.noData}
                </td>
              </tr>
            ) : (
              genres.map((g) => (
                <tr key={g.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className={`py-4 px-4 font-medium ${textH}`}>
                    <span className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 rounded-full text-xs font-semibold">
                      {g.name}
                    </span>
                  </td>
                  <td className={`py-4 px-4 text-xs font-mono ${textM}`}>
                    {g.slug || "—"}
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleOpenEdit(g)}
                        className={`${textM} hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 p-1.5 rounded cursor-pointer transition`}
                        title={t.editGenre}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(g.id)}
                        className={`${textM} hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 p-1.5 rounded cursor-pointer transition`}
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Genre Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`${bg} rounded-2xl shadow-2xl w-full max-w-sm border ${border} overflow-hidden animate-in fade-in zoom-in-95 duration-150`}>
            <div className={`flex items-center justify-between px-6 py-4 border-b ${border}`}>
              <h3 className={`text-base font-bold ${textH}`}>
                {editingId ? t.editGenre : t.addGenre}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className={`${textM} hover:text-red-500 cursor-pointer p-1 rounded-lg`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className={`text-xs font-semibold ${textM} mb-1 block uppercase`}>
                  {t.name} *
                </label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className={inputCls}
                  placeholder={t.namePlaceholder}
                  autoFocus
                />
              </div>
              <div>
                <label className={`text-xs font-semibold ${textM} mb-1 block uppercase`}>
                  {t.slug}
                </label>
                <input
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                  className={inputCls}
                  placeholder={t.slugPlaceholder}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg font-semibold text-sm cursor-pointer transition shadow-sm"
                >
                  {t.save}
                </button>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className={`flex-1 border ${border} ${textM} py-2.5 rounded-lg font-semibold text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800 transition`}
                >
                  {t.cancel}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
