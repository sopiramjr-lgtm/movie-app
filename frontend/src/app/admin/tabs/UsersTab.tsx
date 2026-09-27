"use client";

import React, { useState, useCallback, useEffect } from "react";
import { Edit2, Trash2, Ban, CheckCircle, RefreshCw, Search, X, Shield } from "lucide-react";
import { toast } from "sonner";
import { adminApi } from "@/src/lib/api/endpoints";
import type { UserResponse } from "@/src/types/user";

interface Props {
  lang: "en" | "kh";
  theme: "light" | "dark";
}

const labels = {
  en: {
    user: "User", role: "Role", status: "Status", actions: "Actions",
    noData: "No users found.", searchPlaceholder: "Search by email...",
    editRole: "Edit Role", save: "Save", cancel: "Cancel",
    ban: "Ban", unban: "Unban", delete: "Delete",
    confirmDelete: "Permanently delete this user?",
    confirmBan: "Ban this user?",
    active: "Active", banned: "Banned",
    rolePlaceholder: "e.g. ROLE_ADMIN or ROLE_USER",
  },
  kh: {
    user: "អ្នកប្រើ", role: "តួនាទី", status: "ស្ថានភាព", actions: "សកម្មភាព",
    noData: "រក​មិន​ឃើញ​អ្នក​ប្រើ​ប្រាស់​ណា​ទេ។", searchPlaceholder: "ស្វែងរកដោយអ៊ីម៉ែល...",
    editRole: "កែប្រែតួនាទី", save: "រក្សាទុក", cancel: "បោះបង់",
    ban: "ហាមឃាត់", unban: "ដោះប្លន់", delete: "លុប",
    confirmDelete: "លុបអ្នកប្រើនេះជាអចិន្ត្រៃយ៍?",
    confirmBan: "ហាម​ឃាត់​អ្នក​ប្រើ​នេះ​?",
    active: "សកម្ម", banned: "ហាមឃាត់",
    rolePlaceholder: "ឧ. ROLE_ADMIN ឬ ROLE_USER",
  },
};

export function UsersTab({ lang, theme }: Props) {
  const t = labels[lang];
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<Partial<UserResponse>>({});

  const isDark = theme === "dark";
  const bg = isDark ? "bg-slate-900" : "bg-white";
  const textH = isDark ? "text-white" : "text-slate-800";
  const textM = isDark ? "text-slate-400" : "text-slate-500";
  const border = isDark ? "border-slate-800" : "border-slate-200";
  const inputCls = `w-full border ${border} ${isDark ? "bg-slate-800 text-white placeholder:text-slate-500" : "bg-white text-slate-800"} rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500`;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.getUsers(0, 100);
      setUsers(data.content || []);
    } catch (e: any) {
      toast.error(e.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch = useCallback(async () => {
    if (!search.trim()) { load(); return; }
    setLoading(true);
    try {
      const data = await adminApi.searchUsers(search.trim(), 0, 50);
      setUsers(data.content || []);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }, [search, load]);

  useEffect(() => { load(); }, [load]);

  const handleBan = async (u: UserResponse) => {
    if (!confirm(t.confirmBan)) return;
    try {
      if (u.active) await adminApi.banUser(u.id);
      else await adminApi.unbanUser(u.id);
      toast.success("User status updated");
      load();
    } catch (e: any) { toast.error(e.message); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t.confirmDelete)) return;
    try {
      await adminApi.deleteUser(id);
      toast.success("User deleted");
      load();
    } catch (e: any) { toast.error(e.message); }
  };

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminApi.updateUserRole(form.id!, (form as any).role);
      toast.success("Role updated");
      setModalOpen(false);
      load();
    } catch (e: any) { toast.error(e.message); }
  };

  const filtered = users.filter(u =>
    !search || u.email?.toLowerCase().includes(search.toLowerCase())
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
            onKeyDown={e => e.key === "Enter" && handleSearch()}
            placeholder={t.searchPlaceholder}
            className={`bg-transparent focus:outline-none text-sm w-full ${textH}`}
          />
          {search && (
            <button onClick={() => { setSearch(""); load(); }} className={`${textM} hover:text-red-500 cursor-pointer`}><X className="w-3.5 h-3.5" /></button>
          )}
        </div>
        <button onClick={load} className={`p-2 rounded-lg ${textM} hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition cursor-pointer`}>
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Table */}
      <div className={`${bg} rounded-xl overflow-hidden`}>
        <table className="w-full text-left text-sm">
          <thead className="text-xs uppercase text-gray-500 dark:text-slate-400 font-semibold tracking-wider border-b border-gray-100 dark:border-slate-800">
            <tr>
              <th className="py-4 px-4">{t.user}</th>
              <th className="py-4 px-4">{t.role}</th>
              <th className="py-4 px-4">{t.status}</th>
              <th className="py-4 px-4 text-right">{t.actions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
            {loading ? (
              <tr><td colSpan={4} className="py-12 text-center"><div className="flex justify-center"><div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div></td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={4} className={`py-12 text-center text-sm ${textM}`}>{t.noData}</td></tr>
            ) : filtered.map(u => (
              <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors">
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 flex-shrink-0 flex items-center justify-center shadow-xs">
                      {u.avatarUrl ? (
                        <img
                          src={u.avatarUrl}
                          alt={u.displayName || u.email}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white uppercase">
                          {(u.displayName || u.email || "?")[0]}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className={`font-medium text-sm ${textH} truncate`}>{u.displayName || u.email}</p>
                      <p className={`text-xs ${textM} truncate font-mono`}>{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 ${textM}`}>
                    <Shield className="w-3 h-3" />
                    {u.role || "USER"}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${u.active ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}>
                    {u.active ? t.active : t.banned}
                  </span>
                </td>
                <td className="py-4 px-4 text-right">
                  <button onClick={() => { setForm({ ...u }); setModalOpen(true); }} title={t.editRole} className={`${textM} hover:text-blue-500 p-1.5 rounded cursor-pointer`}><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => handleBan(u)} title={u.active ? t.ban : t.unban} className={`p-1.5 rounded cursor-pointer ${u.active ? `${textM} hover:text-orange-500` : "text-orange-500 hover:text-emerald-500"}`}>
                    {u.active ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                  </button>
                  <button onClick={() => handleDelete(u.id)} title={t.delete} className={`${textM} hover:text-red-500 p-1.5 rounded cursor-pointer ml-1`}><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Role Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`${bg} rounded-2xl shadow-2xl w-full max-w-sm border ${border} overflow-hidden`}>
            <div className={`flex items-center justify-between px-6 py-4 border-b ${border}`}>
              <h3 className={`text-base font-bold ${textH}`}>{t.editRole}</h3>
              <button onClick={() => setModalOpen(false)} className={`${textM} hover:text-red-500 cursor-pointer`}><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSaveRole} className="p-6 space-y-4">
              <div>
                <p className={`text-xs ${textM} mb-1`}>{form.email}</p>
                <label className={`text-xs font-semibold ${textM} mb-1 block uppercase`}>Role</label>
                <select
                  value={(form as any).role || "ROLE_USER"}
                  onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                  className={inputCls}
                >
                  <option value="ROLE_USER">ROLE_USER</option>
                  <option value="ROLE_ADMIN">ROLE_ADMIN</option>
                  <option value="ROLE_MODERATOR">ROLE_MODERATOR</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg font-semibold text-sm cursor-pointer">{t.save}</button>
                <button type="button" onClick={() => setModalOpen(false)} className={`flex-1 border ${border} ${textM} py-2.5 rounded-lg font-semibold text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800`}>{t.cancel}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
