"use client";

import React, { useState } from "react";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { adminApi } from "@/src/lib/api/endpoints";

interface Props { lang: "en" | "kh"; theme: "light" | "dark"; }

const labels = {
  en: { title: "Broadcast Title", message: "Message Body", send: "Send Broadcast", sending: "Sending...", placeholder1: "e.g. System Maintenance", placeholder2: "Enter your message to all users...", note: "This will send a push notification to all registered KhmerFlix users.", success: "Broadcast sent successfully!" },
  kh: { title: "ចំណងជើងការផ្សាយ", message: "ខ្លឹមសារ", send: "ផ្ញើការផ្សាយ", sending: "កំពុងផ្ញើ...", placeholder1: "ឧ. ការថែទាំប្រព័ន្ធ", placeholder2: "សរសេរសារសម្រាប់អ្នកប្រើប្រាស់ទាំងអស់...", note: "វានឹងផ្ញើការជូនដំណឹងទៅអ្នកប្រើ KhmerFlix ដែលបានចុះឈ្មោះទាំងអស់។", success: "ផ្ញើការផ្សាយបានជោគជ័យ!" },
};

export function BroadcastTab({ lang, theme }: Props) {
  const t = labels[lang];
  const [form, setForm] = useState({ title: "", message: "" });
  const [loading, setLoading] = useState(false);

  const isDark = theme === "dark";
  const bg = isDark ? "bg-slate-900" : "bg-white";
  const textH = isDark ? "text-white" : "text-slate-800";
  const textM = isDark ? "text-slate-400" : "text-slate-500";
  const border = isDark ? "border-slate-800" : "border-slate-200";
  const inputCls = `w-full border ${border} ${isDark ? "bg-slate-800 text-white placeholder:text-slate-500" : "bg-white text-slate-800"} rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.message.trim()) { toast.error("Title and message are required"); return; }
    setLoading(true);
    try {
      await adminApi.broadcastNotification(form.title, form.message);
      toast.success(t.success);
      setForm({ title: "", message: "" });
    } catch (e: any) { toast.error(e.message); } finally { setLoading(false); }
  };

  return (
    <div className={`${bg} rounded-xl border ${border} p-6 sm:p-8 max-w-2xl`}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
          <Send className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h3 className={`text-base font-bold ${textH}`}>{lang === "kh" ? "ការផ្សាយសារ" : "Send Broadcast"}</h3>
          <p className={`text-xs ${textM}`}>{t.note}</p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={`text-xs font-semibold ${textM} mb-1.5 block uppercase tracking-wider`}>{t.title}</label>
          <input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className={inputCls} placeholder={t.placeholder1} />
        </div>
        <div>
          <label className={`text-xs font-semibold ${textM} mb-1.5 block uppercase tracking-wider`}>{t.message}</label>
          <textarea required rows={5} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} className={`${inputCls} resize-none`} placeholder={t.placeholder2} />
        </div>
        <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 cursor-pointer transition">
          <Send className="w-4 h-4" /> {loading ? t.sending : t.send}
        </button>
      </form>
    </div>
  );
}
