"use client";

import React, { useState, useEffect, useRef } from "react";
import { Image as ImageIcon, Type, Save, Globe, Upload, Check } from "lucide-react";
import { toast } from "sonner";

interface Props { lang: "en" | "kh"; theme: "light" | "dark"; }

const labels = {
  en: { 
    hero: "Hero Section", 
    footer: "Footer Section", 
    heroTitle: "Hero Title", 
    heroSubtitle: "Subtitle", 
    heroButton: "Button Text", 
    heroBg: "Background Image URL", 
    previewHero: "Preview Hero", 
    footerAbout: "About Text", 
    footerEmail: "Contact Email", 
    footerPhone: "Phone Number", 
    footerFB: "Facebook URL", 
    footerTW: "Twitter / X URL", 
    save: "Save Changes", 
    saved: "Settings updated successfully!",
    uploadImage: "Upload Image",
    saving: "Saving...",
  },
  kh: { 
    hero: "ផ្នែក Hero", 
    footer: "ផ្នែក Footer", 
    heroTitle: "ចំណងជើង Hero", 
    heroSubtitle: "ចំណងជើងរង", 
    heroButton: "អក្សរប៊ូតុង", 
    heroBg: "URL រូបភាពផ្ទៃខាងក្រោយ", 
    previewHero: "មើល Hero", 
    footerAbout: "អំពី KhmerFlix", 
    footerEmail: "អ៊ីម៉ែលទំនាក់ទំនង", 
    footerPhone: "លេខទូរស័ព្ទ", 
    footerFB: "URL Facebook", 
    footerTW: "URL Twitter / X", 
    save: "រក្សាទុកការផ្លាស់ប្តូរ", 
    saved: "បានរក្សាទុកដោយជោគជ័យ!",
    uploadImage: "ផ្ទុកឡើងរូបភាព",
    saving: "កំពុងរក្សាទុក...",
  },
};

export function AppearanceTab({ lang, theme }: Props) {
  const t = labels[lang];
  const [tab, setTab] = useState<"hero" | "footer">("hero");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [hero, setHero] = useState({ 
    title: "Welcome to KhmerFlix", 
    subtitle: "Stream unlimited movies and TV series in Cambodia.", 
    button: "Start Watching", 
    bg: "https://image.tmdb.org/t/p/original/8Y43POKjjKDGI9MH89NW0NAzzp8.jpg" 
  });
  
  const [footer, setFooter] = useState({ 
    about: "KhmerFlix is the leading streaming platform in Cambodia.", 
    email: "support@khmerflix.com", 
    phone: "+855 12 345 678", 
    fb: "https://facebook.com", 
    tw: "https://twitter.com" 
  });

  const isDark = theme === "dark";
  const bg = isDark ? "bg-slate-900" : "bg-white";
  const textH = isDark ? "text-white" : "text-slate-800";
  const textM = isDark ? "text-slate-400" : "text-slate-500";
  const border = isDark ? "border-slate-800" : "border-slate-200";
  const inputCls = `w-full border ${border} ${isDark ? "bg-slate-800 text-white placeholder:text-slate-500" : "bg-white text-slate-800"} rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition`;

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const json = await res.json();
          if (json.data) {
            if (json.data.hero) setHero(json.data.hero);
            if (json.data.footer) setFooter(json.data.footer);
          }
        }
      } catch (e) {
        console.error("Failed to load settings:", e);
      } finally {
        setFetching(false);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hero, footer }),
      });

      if (!res.ok) throw new Error("Failed to save settings");

      // Broadcast update across tabs/pages
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("siteSettingsUpdated", { detail: { hero, footer } }));
        localStorage.setItem("site_hero", JSON.stringify(hero));
        localStorage.setItem("site_footer", JSON.stringify(footer));
      }

      toast.success(t.saved);
    } catch (err: any) {
      toast.error(err.message || "Failed to update appearance settings");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file must be under 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setHero(h => ({ ...h, bg: reader.result as string }));
        toast.success("Background image uploaded!");
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      <div className={`flex items-center gap-1 ${bg} rounded-xl p-1 w-fit border ${border}`}>
        {([["hero", t.hero], ["footer", t.footer]] as const).map(([k, label]) => (
          <button 
            key={k} 
            onClick={() => setTab(k)} 
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition cursor-pointer ${tab === k ? "bg-indigo-600 text-white shadow-sm" : `${textM} hover:bg-gray-100 dark:hover:bg-slate-800`}`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "hero" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <div className={`${bg} rounded-xl border ${border} p-6 space-y-4 shadow-sm`}>
            <h4 className={`text-sm font-bold ${textH} flex items-center gap-2`}>
              <Type className="w-4 h-4 text-indigo-500" />
              {t.hero}
            </h4>
            
            <div>
              <label className={`text-xs font-semibold ${textM} mb-1 block uppercase`}>{t.heroTitle}</label>
              <input 
                value={hero.title} 
                onChange={e => setHero(h => ({ ...h, title: e.target.value }))} 
                className={inputCls} 
              />
            </div>
            
            <div>
              <label className={`text-xs font-semibold ${textM} mb-1 block uppercase`}>{t.heroSubtitle}</label>
              <textarea 
                rows={2} 
                value={hero.subtitle} 
                onChange={e => setHero(h => ({ ...h, subtitle: e.target.value }))} 
                className={`${inputCls} resize-none`} 
              />
            </div>
            
            <div>
              <label className={`text-xs font-semibold ${textM} mb-1 block uppercase`}>{t.heroButton}</label>
              <input 
                value={hero.button} 
                onChange={e => setHero(h => ({ ...h, button: e.target.value }))} 
                className={inputCls} 
              />
            </div>
            
            <div>
              <label className={`text-xs font-semibold ${textM} mb-1 block uppercase`}>{t.heroBg}</label>
              <div className="flex gap-2">
                <input 
                  value={hero.bg} 
                  onChange={e => setHero(h => ({ ...h, bg: e.target.value }))} 
                  className={inputCls} 
                  placeholder="https://image.tmdb.org/..." 
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition flex-shrink-0 cursor-pointer"
                  title="Upload from computer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{t.uploadImage}</span>
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                />
              </div>
            </div>

            <button 
              onClick={handleSave} 
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg font-bold text-sm cursor-pointer flex items-center justify-center gap-2 transition shadow-md disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {loading ? t.saving : t.save}
            </button>
          </div>

          {/* Live Preview */}
          <div className="space-y-2">
            <p className={`text-xs font-semibold uppercase tracking-wider ${textM}`}>{t.previewHero}</p>
            <div 
              className="relative rounded-xl overflow-hidden h-72 flex items-end shadow-xl border border-slate-200 dark:border-slate-800" 
              style={{ backgroundImage: `url(${hero.bg})`, backgroundSize: "cover", backgroundPosition: "center" }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
              <div className="relative p-6 z-10 space-y-2">
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-[#E50914] text-white tracking-widest uppercase">
                  Featured
                </span>
                <h3 className="text-white text-2xl font-black drop-shadow-md">{hero.title}</h3>
                <p className="text-white/80 text-xs max-w-md line-clamp-2 drop-shadow">{hero.subtitle}</p>
                <button className="bg-[#E50914] hover:bg-[#b80710] text-white text-xs font-bold px-4 py-2 rounded-md shadow transition">
                  {hero.button}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "footer" && (
        <div className={`${bg} rounded-xl border ${border} p-6 space-y-4 max-w-2xl shadow-sm`}>
          <h4 className={`text-sm font-bold ${textH} flex items-center gap-2`}>
            <Globe className="w-4 h-4 text-indigo-500" />
            {t.footer}
          </h4>
          
          <div>
            <label className={`text-xs font-semibold ${textM} mb-1 block uppercase`}>{t.footerAbout}</label>
            <textarea 
              rows={3} 
              value={footer.about} 
              onChange={e => setFooter(f => ({ ...f, about: e.target.value }))} 
              className={`${inputCls} resize-none`} 
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={`text-xs font-semibold ${textM} mb-1 block uppercase`}>{t.footerEmail}</label>
              <input 
                type="email" 
                value={footer.email} 
                onChange={e => setFooter(f => ({ ...f, email: e.target.value }))} 
                className={inputCls} 
              />
            </div>
            <div>
              <label className={`text-xs font-semibold ${textM} mb-1 block uppercase`}>{t.footerPhone}</label>
              <input 
                value={footer.phone} 
                onChange={e => setFooter(f => ({ ...f, phone: e.target.value }))} 
                className={inputCls} 
              />
            </div>
            <div>
              <label className={`text-xs font-semibold ${textM} mb-1 block uppercase`}>{t.footerFB}</label>
              <input 
                value={footer.fb} 
                onChange={e => setFooter(f => ({ ...f, fb: e.target.value }))} 
                className={inputCls} 
              />
            </div>
            <div>
              <label className={`text-xs font-semibold ${textM} mb-1 block uppercase`}>{t.footerTW}</label>
              <input 
                value={footer.tw} 
                onChange={e => setFooter(f => ({ ...f, tw: e.target.value }))} 
                className={inputCls} 
              />
            </div>
          </div>

          <button 
            onClick={handleSave} 
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg font-bold text-sm cursor-pointer flex items-center justify-center gap-2 transition shadow-md disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {loading ? t.saving : t.save}
          </button>
        </div>
      )}
    </div>
  );
}
