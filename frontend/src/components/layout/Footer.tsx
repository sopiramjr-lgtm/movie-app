"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FlagKH } from "@/src/components/common/LanguageSwitcher";
import { useLanguage } from "@/src/hooks/useLanguage";
import { Mail, Phone, ExternalLink } from "lucide-react";

export function Footer() {
  const { t } = useLanguage();
  const [footer, setFooter] = useState({
    about: "KhmerFlix is the leading streaming platform in Cambodia.",
    email: "support@khmerflix.com",
    phone: "+855 12 345 678",
    fb: "https://facebook.com",
    tw: "https://twitter.com",
  });

  useEffect(() => {
    async function loadFooter() {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const json = await res.json();
          if (json.data?.footer) setFooter(json.data.footer);
        }
      } catch {}
    }
    loadFooter();

    const handleUpdate = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.footer) setFooter(detail.footer);
    };
    window.addEventListener("siteSettingsUpdated", handleUpdate);
    return () => window.removeEventListener("siteSettingsUpdated", handleUpdate);
  }, []);

  return (
    <footer className="border-t border-white/10 bg-[#101010] py-12 px-4 sm:px-8 text-zinc-500 text-xs">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Dynamic About & Contact Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-zinc-900">
          <p className="text-zinc-400 max-w-lg leading-relaxed">
            {footer.about}
          </p>
          <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400">
            {footer.email && (
              <a href={`mailto:${footer.email}`} className="flex items-center gap-1.5 hover:text-white transition">
                <Mail className="w-3.5 h-3.5 text-[#E50914]" />
                <span>{footer.email}</span>
              </a>
            )}
            {footer.phone && (
              <a href={`tel:${footer.phone}`} className="flex items-center gap-1.5 hover:text-white transition">
                <Phone className="w-3.5 h-3.5 text-[#E50914]" />
                <span>{footer.phone}</span>
              </a>
            )}
            {footer.fb && (
              <a href={footer.fb} target="_blank" rel="noopener noreferrer" className="hover:text-white transition flex items-center gap-1">
                <span>Facebook</span>
                <ExternalLink className="w-2.5 h-2.5 opacity-60" />
              </a>
            )}
            {footer.tw && (
              <a href={footer.tw} target="_blank" rel="noopener noreferrer" className="hover:text-white transition flex items-center gap-1">
                <span>Twitter / X</span>
                <ExternalLink className="w-2.5 h-2.5 opacity-60" />
              </a>
            )}
          </div>
        </div>

        {/* Quick Links Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <Link href="/movies" className="hover:underline">
            {t.footer.faq}
          </Link>
          <Link href="/pricing" className="hover:underline">
            {t.footer.plans}
          </Link>
          <Link href="/profile" className="hover:underline">
            {t.footer.account}
          </Link>
          <Link href="/movies" className="hover:underline">
            {t.footer.mediaCenter}
          </Link>
          <Link href="/movies" className="hover:underline">
            {t.footer.waysToWatch}
          </Link>
          <Link href="/movies" className="hover:underline">
            {t.footer.terms}
          </Link>
          <Link href="/movies" className="hover:underline">
            {t.footer.privacy}
          </Link>
          <Link href="/movies" className="hover:underline">
            {t.footer.cookies}
          </Link>
        </div>

        {/* Bottom Bar with Cambodian Flag and Copyright */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-zinc-900">
          <div className="flex items-center gap-2 px-3 py-1.5 border border-zinc-800 bg-zinc-900/60 rounded text-[11px] text-zinc-300">
            <FlagKH className="w-4 h-3" />
            <span>កម្ពុជា (Cambodia) — KhmerFlix Streaming</span>
          </div>
          <p className="text-[11px] text-zinc-600">
            &copy; {new Date().getFullYear()} {t.footer.copyright}
          </p>
        </div>
      </div>
    </footer>
  );
}
