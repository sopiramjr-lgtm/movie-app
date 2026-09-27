"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import {
  Search,
  Bell,
  Shield,
  LogOut,
  User,
  Sparkles,
  BookMarked,
  X,
  ChevronDown,
  Sun,
  Moon,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/src/store/hooks";
import { setSearchQuery, setTheme } from "@/src/store/slices/uiSlice";
import { logout } from "@/src/store/slices/authSlice";
import { LanguageSwitcher } from "@/src/components/common/LanguageSwitcher";
import { NotificationDropdown } from "@/src/components/common/NotificationDropdown";
import { useLanguage } from "@/src/hooks/useLanguage";

function NavLinksList({ isLight, t, isTransparentDark = false }: { isLight: boolean; t: any; isTransparentDark?: boolean }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isLinkActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    if (href.startsWith("/movies?type=")) {
      const type = href.split("type=")[1];
      return pathname === "/movies" && searchParams.get("type") === type;
    }
    if (href === "/movies") {
      return pathname === "/movies" && !searchParams.get("type");
    }
    return pathname === href;
  };

  const NAV_LINKS = [
    { href: "/", label: t.nav.home },
    { href: "/movies?type=SERIES", label: t.nav.tvShows },
    { href: "/movies?type=MOVIE", label: t.nav.movies },
    { href: "/movies", label: t.nav.newPopular },
    { href: "/watchlist", label: t.nav.myList },
  ];

  return (
    <nav className="hidden md:flex items-center gap-1.5 text-[13px] sm:text-[13.5px] font-medium">
      {NAV_LINKS.map(({ href, label }) => {
        const active = isLinkActive(href);
        return (
          <Link
            key={href}
            href={href}
            className={`relative px-3.5 py-1.5 rounded-lg transition-all duration-200 group flex items-center leading-normal ${
              active
                ? isLight && !isTransparentDark
                  ? "text-[#E50914] font-bold bg-red-50 border border-red-200 shadow-xs"
                  : "text-white font-bold bg-white/10 border border-white/15 shadow-sm"
                : isLight && !isTransparentDark
                ? "text-slate-800 hover:text-[#E50914] hover:bg-slate-100 font-semibold"
                : "text-zinc-200 hover:text-white hover:bg-white/[0.08] font-medium"
            }`}
          >
            {label}
            {active ? (
              <span
                className={`absolute bottom-0 left-2 right-2 h-[2.5px] bg-[#E50914] rounded-full ${
                  isLight && !isTransparentDark
                    ? "shadow-[0_1px_4px_rgba(229,9,20,0.5)]"
                    : "shadow-[0_0_8px_#E50914]"
                }`}
              />
            ) : (
              <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-[2px] w-0 bg-red-500 rounded-full transition-all duration-300 group-hover:w-3/4" />
            )}
          </Link>
        );
      })}
      <Link
        href="/pricing"
        className={`relative ml-1 flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-semibold transition-all duration-200 leading-normal ${
          pathname === "/pricing"
            ? isLight && !isTransparentDark
              ? "text-amber-800 font-bold bg-amber-100 border border-amber-300 shadow-xs"
              : "text-amber-400 font-bold bg-amber-400/20 border border-amber-400/30 shadow-sm"
            : isLight && !isTransparentDark
            ? "text-amber-700 hover:text-amber-800 hover:bg-amber-50 font-semibold"
            : "text-amber-400 hover:text-amber-300 hover:bg-amber-400/10"
        }`}
      >
        <Sparkles className="w-3.5 h-3.5" />
        {t.nav.plans}
        {pathname === "/pricing" && (
          <span className="absolute bottom-0 left-2 right-2 h-[2.5px] bg-amber-500 rounded-full shadow-[0_0_8px_#f59e0b]" />
        )}
      </Link>
    </nav>
  );
}

export function Navbar() {
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const searchQuery = useAppSelector((state) => state.ui.searchQuery);
  const theme = useAppSelector((state) => state.ui.theme);
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { lang, setLang, t } = useLanguage();

  const [isScrolled, setIsScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Sync theme on mount and scroll
  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });

    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("khmerflix_theme") as "light" | "dark" | null;
      if (savedTheme === "light") {
        dispatch(setTheme("light"));
        document.documentElement.classList.remove("dark");
        document.documentElement.classList.add("light");
      } else {
        dispatch(setTheme("dark"));
        document.documentElement.classList.add("dark");
        document.documentElement.classList.remove("light");
        localStorage.setItem("khmerflix_theme", "dark");
      }
    }

    return () => window.removeEventListener("scroll", handleScroll);
  }, [dispatch]);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    dispatch(setTheme(nextTheme));
    if (typeof window !== "undefined") {
      localStorage.setItem("khmerflix_theme", nextTheme);
      if (nextTheme === "dark") {
        document.documentElement.classList.add("dark");
        document.documentElement.classList.remove("light");
      } else {
        document.documentElement.classList.remove("dark");
        document.documentElement.classList.add("light");
      }
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  const isAdmin =
    user?.role &&
    (user.role.toUpperCase().includes("ADMIN") || user.role.toUpperCase() === "ROLE_ADMIN");

  const avatarInitial = user?.name ? user.name.charAt(0).toUpperCase() : "K";
  const avatarGradient = isAdmin
    ? "from-red-500 to-rose-700"
    : "from-violet-500 to-purple-700";

  const isLight = mounted && theme === "light";
  const isHomePage = pathname === "/";
  const isTransparentDark = isHomePage && !isScrolled;

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-all duration-500 ${
        isScrolled
          ? isLight
            ? "bg-white/95 backdrop-blur-xl shadow-xs border-b border-slate-200 text-slate-900"
            : "bg-black/95 backdrop-blur-xl shadow-lg shadow-black/50 border-b border-white/[0.08] text-white"
          : isHomePage
          ? "bg-gradient-to-b from-black/85 via-black/40 to-transparent text-white"
          : isLight
          ? "bg-white/95 backdrop-blur-md border-b border-slate-200 text-slate-900"
          : "bg-gradient-to-b from-black/85 via-black/40 to-transparent text-white"
      }`}
    >
      <div className="max-w-[1400px] mx-auto flex h-16 sm:h-[68px] items-center justify-between px-4 sm:px-6 lg:px-10 gap-4">

        {/* ── Left: Logo (Icon Only, No Word) + Nav ── */}
        <div className="flex items-center gap-6 sm:gap-8">
          <Link href="/" className="shrink-0 flex items-center group" title="KhmerFlix">
            <div className="relative h-9 w-9 sm:h-10 sm:w-10 transition-transform duration-200 group-hover:scale-105">
              <Image
                src="/icon.png"
                alt="KhmerFlix"
                fill
                priority
                sizes="40px"
                className="object-contain rounded-lg drop-shadow-sm"
              />
            </div>
          </Link>

          {/* Primary nav links with active focus */}
          <Suspense fallback={<div className="h-6 w-64 bg-white/10 rounded animate-pulse" />}>
            <NavLinksList isLight={isLight} t={t} isTransparentDark={isTransparentDark} />
          </Suspense>
        </div>

        {/* ── Right: Search + Theme + Lang + Bell + Profile ── */}
        <div className="flex items-center gap-2 sm:gap-3">

          {/* Expanding Search */}
          <div className="relative flex items-center">
            {searchOpen ? (
              <div
                className={`flex items-center backdrop-blur-md rounded-full px-3 py-1.5 gap-2 shadow-lg transition-all duration-300 w-44 sm:w-64 ${
                  isLight && !isTransparentDark
                    ? "bg-white border border-slate-300 ring-1 ring-slate-200 shadow-slate-200/50"
                    : "bg-black/70 border border-white/25 ring-1 ring-white/10 shadow-black/30"
                }`}
              >
                <Search className={`w-4 h-4 shrink-0 ${isLight && !isTransparentDark ? "text-slate-500" : "text-zinc-400"}`} />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder={t.nav.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => dispatch(setSearchQuery(e.target.value))}
                  className={`bg-transparent text-xs focus:outline-none flex-1 min-w-0 ${
                    isLight && !isTransparentDark
                      ? "text-slate-900 placeholder:text-slate-400"
                      : "text-white placeholder:text-zinc-400"
                  }`}
                />
                <button
                  onClick={() => { setSearchOpen(false); dispatch(setSearchQuery("")); }}
                  className={`transition shrink-0 ${isLight && !isTransparentDark ? "text-slate-400 hover:text-black" : "text-zinc-400 hover:text-white"}`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className={`w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200 ${
                  isLight && !isTransparentDark
                    ? "text-slate-700 hover:text-black hover:bg-slate-100"
                    : "text-zinc-300 hover:text-white hover:bg-white/10"
                }`}
                aria-label="Search"
              >
                <Search className="w-4.5 h-4.5" />
              </button>
            )}
          </div>

          {/* Theme Toggle (Sun / Moon) */}
          <button
            onClick={toggleTheme}
            className={`w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200 cursor-pointer ${
              isLight && !isTransparentDark
                ? "text-slate-700 hover:text-black hover:bg-slate-100"
                : "text-zinc-300 hover:text-white hover:bg-white/10"
            }`}
            title={isLight ? "Switch to Dark Mode" : "Switch to Light Mode"}
            aria-label="Toggle Theme"
          >
            {isLight ? (
              <Moon className="w-4 h-4 text-slate-700 hover:text-black" />
            ) : (
              <Sun className="w-4 h-4 text-amber-400 hover:text-amber-300" />
            )}
          </button>

          {/* Language Switcher */}
          <LanguageSwitcher
            currentLang={lang as "en" | "kh"}
            onLangChange={(l) => setLang(l)}
            variant="navbar"
            theme={isLight && !isTransparentDark ? "light" : "dark"}
          />

          {/* Dynamic Notifications Bell & Dropdown */}
          <NotificationDropdown
            isLight={isLight && !isTransparentDark}
            variant="navbar"
          />

          {/* Admin shortcut pill */}
          {mounted && isAdmin && (
            <Link
              href="/admin"
              className="hidden sm:flex items-center gap-1.5 h-7 px-2.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-500 hover:bg-red-500/20 hover:text-red-400 text-[11px] font-bold tracking-wide transition-all duration-200"
            >
              <Shield className="w-3 h-3" />
              ADMIN
            </Link>
          )}

          {/* ── Profile Dropdown ── */}
          {mounted && isAuthenticated ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setProfileDropdown((p) => !p)}
                className="flex items-center gap-1.5 focus:outline-none group cursor-pointer"
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-full bg-gradient-to-br ${avatarGradient} flex items-center justify-center font-bold text-[13px] text-white shadow-md ring-2 ring-transparent group-hover:ring-red-500/40 transition-all duration-200`}
                >
                  {user?.image ? (
                    <img src={user.image} alt={avatarInitial} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    avatarInitial
                  )}
                </div>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-300 ${
                    profileDropdown ? "rotate-180" : ""
                  } ${isLight ? "text-zinc-600" : "text-zinc-400"}`}
                />
              </button>

              {/* Dropdown panel */}
              {profileDropdown && (
                <div className="absolute right-0 mt-2.5 w-60 z-50 animate-in fade-in zoom-in-95 slide-in-from-top-1 duration-150">
                  <div
                    className={`rounded-2xl shadow-2xl overflow-hidden border ${
                      isLight
                        ? "bg-white/95 backdrop-blur-2xl border-black/10 shadow-black/20 text-zinc-800"
                        : "bg-[#0f0f0f]/95 backdrop-blur-2xl border-white/[0.08] shadow-black/60 text-white"
                    }`}
                  >
                    {/* User header */}
                    <div
                      className={`px-4 pt-4 pb-3 flex items-center gap-3 border-b ${
                        isLight ? "border-black/5" : "border-white/[0.06]"
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-full bg-gradient-to-br ${avatarGradient} flex items-center justify-center font-bold text-sm text-white shadow-md shrink-0`}
                      >
                        {user?.image ? (
                          <img src={user.image} alt={avatarInitial} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          avatarInitial
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className={`text-[13px] font-semibold truncate leading-tight ${isLight ? "text-black" : "text-white"}`}>
                          {user?.name || "KhmerFlix Viewer"}
                        </p>
                        <p className="text-[11px] text-zinc-500 truncate mt-0.5">{user?.email}</p>
                        {isAdmin && (
                          <span className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded-md bg-red-500/15 text-red-500 border border-red-500/25 text-[9px] font-bold tracking-widest uppercase">
                            <Shield className="w-2.5 h-2.5" /> Administrator
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Menu items */}
                    <div className="py-1.5 px-1.5 space-y-0.5">
                      <DropItem
                        href="/profile"
                        icon={<User className="w-4 h-4" />}
                        label={t.nav.manageProfiles}
                        isLight={isLight}
                        onClick={() => setProfileDropdown(false)}
                      />
                      <DropItem
                        href="/watchlist"
                        icon={<BookMarked className="w-4 h-4" />}
                        label={t.nav.myList}
                        isLight={isLight}
                        onClick={() => setProfileDropdown(false)}
                      />
                      <DropItem
                        href="/pricing"
                        icon={<Sparkles className="w-4 h-4 text-amber-500" />}
                        label={t.nav.manageSubscription || "Manage Subscription"}
                        isLight={isLight}
                        onClick={() => setProfileDropdown(false)}
                      />
                      {isAdmin && (
                        <DropItem
                          href="/admin"
                          icon={<Shield className="w-4 h-4 text-red-500" />}
                          label={t.nav.adminPanel}
                          labelClass="text-red-500"
                          isLight={isLight}
                          onClick={() => setProfileDropdown(false)}
                        />
                      )}
                    </div>

                    {/* Sign out */}
                    <div className={`px-1.5 pb-1.5 pt-0.5 border-t ${isLight ? "border-black/5" : "border-white/[0.06]"}`}>
                      <button
                        onClick={() => {
                          setProfileDropdown(false);
                          dispatch(logout());
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] hover:text-red-500 hover:bg-red-500/10 transition-all duration-150 cursor-pointer ${
                          isLight ? "text-zinc-600" : "text-zinc-400"
                        }`}
                      >
                        <LogOut className="w-4 h-4 shrink-0" />
                        {t.nav.signOut}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`text-[13px] h-8 font-medium px-3 ${
                    isLight
                      ? "text-zinc-700 hover:text-black hover:bg-black/5"
                      : "text-zinc-300 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {t.nav.signIn}
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  size="sm"
                  className="bg-red-600 hover:bg-red-500 text-white text-[13px] h-8 font-bold px-4 shadow-md shadow-red-900/40 rounded-full transition-all duration-200"
                >
                  {t.nav.joinFree}
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

/* ── Small helper: dropdown menu item ── */
function DropItem({
  href,
  icon,
  label,
  labelClass = "",
  isLight = false,
  onClick,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  labelClass?: string;
  isLight?: boolean;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] transition-all duration-150 ${
        isLight
          ? "text-zinc-700 hover:text-black hover:bg-black/5"
          : "text-zinc-300 hover:text-white hover:bg-white/[0.07]"
      }`}
    >
      <span className={`shrink-0 ${isLight ? "text-zinc-500" : "text-zinc-400"}`}>{icon}</span>
      <span className={labelClass}>{label}</span>
    </Link>
  );
}
