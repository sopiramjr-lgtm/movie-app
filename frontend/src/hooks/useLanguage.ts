"use client";

import { useState, useEffect } from "react";
import { translations, SupportedLang, Translations } from "@/src/lib/i18n/translations";

export function useLanguage() {
  const [lang, setLangState] = useState<SupportedLang>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("khmerflix_lang");
    if (saved === "kh" || saved === "en") {
      setLangState(saved as SupportedLang);
    }

    const handleLanguageChange = (e: Event) => {
      const customEvent = e as CustomEvent<SupportedLang>;
      if (customEvent.detail === "kh" || customEvent.detail === "en") {
        setLangState(customEvent.detail);
      }
    };

    window.addEventListener("languageChange", handleLanguageChange);
    return () => window.removeEventListener("languageChange", handleLanguageChange);
  }, []);

  const setLang = (newLang: SupportedLang) => {
    setLangState(newLang);
    if (typeof window !== "undefined") {
      localStorage.setItem("khmerflix_lang", newLang);
      window.dispatchEvent(new CustomEvent("languageChange", { detail: newLang }));
    }
  };

  const t: Translations = translations[lang] || translations.en;

  return { lang, setLang, t, mounted };
}
