"use client";

import React, { useState } from "react";
import { Settings, Globe, Bell, Shield, Server, Save } from "lucide-react";
import { toast } from "sonner";

interface Props { lang: "en" | "kh"; theme: "light" | "dark"; }

const labels = {
  en: {
    general: "General", notifications: "Notifications", security: "Security", system: "System",
    siteName: "Site Name", siteTagline: "Tagline", maintenanceMode: "Maintenance Mode", registrationOpen: "Open Registration",
    emailNotif: "Email Notifications", broadcastAlerts: "Broadcast Alerts", billingAlerts: "Billing Alerts",
    twoFA: "Require 2FA for Admins", sessionTimeout: "Session Timeout (minutes)",
    apiUrl: "Backend API URL", cacheEnabled: "Enable Response Cache", debugMode: "Debug Mode",
    save: "Save Settings", saved: "Settings saved!",
  },
  kh: {
    general: "ទូទៅ", notifications: "ការជូនដំណឹង", security: "សុវត្ថិភាព", system: "ប្រព័ន្ធ",
    siteName: "ឈ្មោះគេហទំព័រ", siteTagline: "ស្លោក", maintenanceMode: "របៀបថែទាំ", registrationOpen: "ការចុះឈ្មោះបើក",
    emailNotif: "ការជូនដំណឹងតាមអ៊ីម៉ែល", broadcastAlerts: "ការជូនដំណឹងការផ្សាយ", billingAlerts: "ការជូនដំណឹងការទូទាត់",
    twoFA: "ត្រូវការ 2FA សម្រាប់អ្នកគ្រប់គ្រង", sessionTimeout: "ពេលផុតសម័យ (នាទី)",
    apiUrl: "URL API ខាងក្រោយ", cacheEnabled: "បើកការ​ Cache ការ​ឆ្លើយ​តប", debugMode: "របៀប Debug",
    save: "រក្សាទុក", saved: "បានរក្សាទុកការកំណត់!",
  },
};

type SettingSection = "general" | "notifications" | "security" | "system";

export function SettingsTab({ lang, theme }: Props) {
  const t = labels[lang];
  const [section, setSection] = useState<SettingSection>("general");
  const [general, setGeneral] = useState({ siteName: "KhmerFlix", tagline: "Stream Cambodia's Best Content", maintenance: false, openReg: true });
  const [notifs, setNotifs] = useState({ email: true, broadcast: true, billing: true });
  const [security, setSecurity] = useState({ twoFA: false, sessionTimeout: 60 });
  const [system, setSystem] = useState({ apiUrl: "http://localhost:8080", cache: true, debug: false });

  const isDark = theme === "dark";
  const bg = isDark ? "bg-slate-900" : "bg-white";
  const textH = isDark ? "text-white" : "text-slate-800";
  const textM = isDark ? "text-slate-400" : "text-slate-500";
  const border = isDark ? "border-slate-800" : "border-slate-200";
  const inputCls = `w-full border ${border} ${isDark ? "bg-slate-800 text-white placeholder:text-slate-500" : "bg-white text-slate-800"} rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500`;

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <button type="button" onClick={onChange} className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${checked ? "bg-indigo-600" : isDark ? "bg-slate-700" : "bg-gray-200"}`}>
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${checked ? "translate-x-5" : ""}`} />
    </button>
  );

  const sections = [
    { key: "general", label: t.general, icon: Globe },
    { key: "notifications", label: t.notifications, icon: Bell },
    { key: "security", label: t.security, icon: Shield },
    { key: "system", label: t.system, icon: Server },
  ] as const;

  return (
    <div className="flex gap-6 flex-col sm:flex-row">
      {/* Sidebar */}
      <div className={`${bg} rounded-xl border ${border} p-2 flex sm:flex-col gap-1 sm:w-44 flex-shrink-0 h-fit`}>
        {sections.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setSection(key)} className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold transition cursor-pointer text-left w-full ${section === key ? "bg-indigo-600 text-white" : `${textM} hover:bg-gray-100 dark:hover:bg-slate-800`}`}>
            <Icon className="w-4 h-4 flex-shrink-0" />{label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className={`${bg} rounded-xl border ${border} p-6 flex-1 space-y-5`}>
        {section === "general" && (
          <>
            <h4 className={`text-sm font-bold ${textH}`}>{t.general}</h4>
            <div><label className={`text-xs font-semibold ${textM} mb-1 block uppercase`}>{t.siteName}</label><input value={general.siteName} onChange={e => setGeneral(g => ({ ...g, siteName: e.target.value }))} className={inputCls} /></div>
            <div><label className={`text-xs font-semibold ${textM} mb-1 block uppercase`}>{t.siteTagline}</label><input value={general.tagline} onChange={e => setGeneral(g => ({ ...g, tagline: e.target.value }))} className={inputCls} /></div>
            <div className="flex items-center justify-between"><span className={`text-sm ${textH}`}>{t.maintenanceMode}</span><Toggle checked={general.maintenance} onChange={() => setGeneral(g => ({ ...g, maintenance: !g.maintenance }))} /></div>
            <div className="flex items-center justify-between"><span className={`text-sm ${textH}`}>{t.registrationOpen}</span><Toggle checked={general.openReg} onChange={() => setGeneral(g => ({ ...g, openReg: !g.openReg }))} /></div>
          </>
        )}
        {section === "notifications" && (
          <>
            <h4 className={`text-sm font-bold ${textH}`}>{t.notifications}</h4>
            <div className="flex items-center justify-between"><span className={`text-sm ${textH}`}>{t.emailNotif}</span><Toggle checked={notifs.email} onChange={() => setNotifs(n => ({ ...n, email: !n.email }))} /></div>
            <div className="flex items-center justify-between"><span className={`text-sm ${textH}`}>{t.broadcastAlerts}</span><Toggle checked={notifs.broadcast} onChange={() => setNotifs(n => ({ ...n, broadcast: !n.broadcast }))} /></div>
            <div className="flex items-center justify-between"><span className={`text-sm ${textH}`}>{t.billingAlerts}</span><Toggle checked={notifs.billing} onChange={() => setNotifs(n => ({ ...n, billing: !n.billing }))} /></div>
          </>
        )}
        {section === "security" && (
          <>
            <h4 className={`text-sm font-bold ${textH}`}>{t.security}</h4>
            <div className="flex items-center justify-between"><span className={`text-sm ${textH}`}>{t.twoFA}</span><Toggle checked={security.twoFA} onChange={() => setSecurity(s => ({ ...s, twoFA: !s.twoFA }))} /></div>
            <div><label className={`text-xs font-semibold ${textM} mb-1 block uppercase`}>{t.sessionTimeout}</label><input type="number" min={5} max={480} value={security.sessionTimeout} onChange={e => setSecurity(s => ({ ...s, sessionTimeout: Number(e.target.value) }))} className={inputCls} /></div>
          </>
        )}
        {section === "system" && (
          <>
            <h4 className={`text-sm font-bold ${textH}`}>{t.system}</h4>
            <div><label className={`text-xs font-semibold ${textM} mb-1 block uppercase`}>{t.apiUrl}</label><input value={system.apiUrl} onChange={e => setSystem(s => ({ ...s, apiUrl: e.target.value }))} className={inputCls} /></div>
            <div className="flex items-center justify-between"><span className={`text-sm ${textH}`}>{t.cacheEnabled}</span><Toggle checked={system.cache} onChange={() => setSystem(s => ({ ...s, cache: !s.cache }))} /></div>
            <div className="flex items-center justify-between"><span className={`text-sm ${textH}`}>{t.debugMode}</span><Toggle checked={system.debug} onChange={() => setSystem(s => ({ ...s, debug: !s.debug }))} /></div>
          </>
        )}
        <button onClick={() => toast.success(t.saved)} className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg font-bold text-sm cursor-pointer flex items-center justify-center gap-2 transition"><Save className="w-4 h-4" />{t.save}</button>
      </div>
    </div>
  );
}
