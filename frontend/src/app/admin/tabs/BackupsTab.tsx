"use client";

import React, { useState } from "react";
import { Database, CheckCircle, Clock, AlertCircle, Download, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface Props { lang: "en" | "kh"; theme: "light" | "dark"; }

const MOCK_BACKUPS = [
  { id: "bk-1", name: "Full Backup — Database + Media", size: "4.2 GB", status: "success", created: new Date(Date.now() - 86400000).toISOString() },
  { id: "bk-2", name: "Incremental — Database Only", size: "512 MB", status: "success", created: new Date(Date.now() - 172800000).toISOString() },
  { id: "bk-3", name: "Full Backup — Database + Media", size: "3.9 GB", status: "success", created: new Date(Date.now() - 259200000).toISOString() },
  { id: "bk-4", name: "Incremental — Database Only", size: "—", status: "failed", created: new Date(Date.now() - 345600000).toISOString() },
];

const labels = {
  en: { title: "Backup", size: "Size", status: "Status", created: "Created", download: "Download", createBackup: "Create Backup Now", creating: "Creating backup...", success: "Backup started!", name: "Backup Name", notice: "Backups are stored in your configured storage provider (S3/local). Below are recent backup snapshots." },
  kh: { title: "ការបម្រុងទុក", size: "ទំហំ", status: "ស្ថានភាព", created: "បង្កើតនៅ", download: "ទាញយក", createBackup: "បង្កើតការបម្រុងទុក", creating: "កំពុងបង្កើត...", success: "ការបម្រុងទុកចាប់ផ្ដើម!", name: "ឈ្មោះ", notice: "ការបម្រុងទុកត្រូវបានរក្សាទុកក្នុងប្រព័ន្ធផ្ទុក ។" },
};

export function BackupsTab({ lang, theme }: Props) {
  const t = labels[lang];
  const [creating, setCreating] = useState(false);

  const isDark = theme === "dark";
  const bg = isDark ? "bg-slate-900" : "bg-white";
  const textH = isDark ? "text-white" : "text-slate-800";
  const textM = isDark ? "text-slate-400" : "text-slate-500";
  const border = isDark ? "border-slate-800" : "border-slate-200";

  const handleCreate = async () => {
    setCreating(true);
    await new Promise(r => setTimeout(r, 2000));
    toast.success(t.success);
    setCreating(false);
  };

  return (
    <div className="space-y-4">
      <div className={`${bg} rounded-xl border ${border} p-4 flex items-center gap-2`}>
        <Database className="w-4 h-4 text-indigo-500 flex-shrink-0" />
        <p className={`text-xs ${textM}`}>{t.notice}</p>
        <button onClick={handleCreate} disabled={creating} className="ml-auto bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 cursor-pointer transition whitespace-nowrap">
          <RefreshCw className={`w-3.5 h-3.5 ${creating ? "animate-spin" : ""}`} /> {creating ? t.creating : t.createBackup}
        </button>
      </div>
      <div className={`${bg} rounded-xl overflow-hidden`}>
        <table className="w-full text-left text-sm">
          <thead className="text-xs uppercase text-gray-500 dark:text-slate-400 font-semibold tracking-wider border-b border-gray-100 dark:border-slate-800">
            <tr>
              <th className="py-4 px-4">{t.name}</th>
              <th className="py-4 px-4">{t.size}</th>
              <th className="py-4 px-4">{t.status}</th>
              <th className="py-4 px-4">{t.created}</th>
              <th className="py-4 px-4 text-right">{t.download}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
            {MOCK_BACKUPS.map(b => (
              <tr key={b.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40 transition-colors">
                <td className={`py-4 px-4 font-medium text-sm ${textH} flex items-center gap-2`}>
                  <Database className={`w-4 h-4 flex-shrink-0 ${textM}`} />{b.name}
                </td>
                <td className={`py-4 px-4 text-xs ${textM}`}>{b.size}</td>
                <td className="py-4 px-4">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${b.status === "success" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}>
                    {b.status === "success" ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                    {b.status}
                  </span>
                </td>
                <td className={`py-4 px-4 text-xs ${textM}`}>{new Date(b.created).toLocaleString()}</td>
                <td className="py-4 px-4 text-right">
                  {b.status === "success" && (
                    <button onClick={() => toast.info("Download triggered")} className={`${textM} hover:text-indigo-600 p-1.5 rounded cursor-pointer`}>
                      <Download className="w-4 h-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
