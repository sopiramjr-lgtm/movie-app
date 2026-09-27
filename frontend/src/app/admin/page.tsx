"use client";

import React, { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  User, Users, Film, Star, CreditCard, Send, Search,
  Tag, Menu, Bell, Moon, Sun, ChevronLeft, ChevronRight, Settings,
  Activity, MessageCircle, Calendar, LayoutGrid, ShieldCheck,
  Database, LayoutTemplate, History, LogOut, ChevronDown
} from "lucide-react";
import { useAppSelector } from "@/src/store/hooks";
import { LanguageSwitcher } from "@/src/components/common/LanguageSwitcher";
import { NotificationDropdown } from "@/src/components/common/NotificationDropdown";

// Feature Tabs
import { DashboardTab }     from "./tabs/DashboardTab";
import { CatalogTab }       from "./tabs/CatalogTab";
import { UsersTab }         from "./tabs/UsersTab";
import { GenresTab }        from "./tabs/GenresTab";
import { ReviewsTab }       from "./tabs/ReviewsTab";
import { SubscriptionsTab } from "./tabs/SubscriptionsTab";
import { BroadcastTab }     from "./tabs/BroadcastTab";
import { RolesTab }         from "./tabs/RolesTab";
import { AuditTab }         from "./tabs/AuditTab";
import { BackupsTab }       from "./tabs/BackupsTab";
import { ReportsTab }       from "./tabs/ReportsTab";
import { AppearanceTab }    from "./tabs/AppearanceTab";
import { ProfileTab }       from "./tabs/ProfileTab";
import { SettingsTab }      from "./tabs/SettingsTab";

type AdminTab = 
  | "dashboard"
  | "catalog" 
  | "genres" 
  | "reviews"
  | "subscriptions" 
  | "reports"
  | "users" 
  | "roles" 
  | "broadcast" 
  | "audit" 
  | "backups" 
  | "appearance" 
  | "settings" 
  | "profile";

const VALID_TABS: AdminTab[] = [
  "dashboard", "catalog", "genres", "reviews", "subscriptions",
  "reports", "users", "roles", "broadcast", "audit",
  "backups", "appearance", "settings", "profile"
];

type Theme = "light" | "dark";
type Lang  = "en" | "kh";

const DICT = {
  en: {
    dashboard: "Dashboard",
    catalog: "Movies & Series",
    genres: "Genres",
    reviews: "Reviews & Ratings",
    subscriptions: "Billing & Subs",
    reports: "Financial Reports",
    users: "Users Management",
    roles: "Roles & Permissions",
    broadcast: "Broadcast",
    audit: "Audit Log",
    backups: "Backups",
    appearance: "Hero & Footer",
    settings: "Settings",
    profile: "Profile Settings",
    secMain: "MAIN",
    secCatalog: "CATALOG",
    secSales: "SALES & REVENUE",
    secUsers: "CUSTOMERS & ACCESS",
    secConfig: "SETTINGS & CONFIG",
    notifications: "Notifications",
    markAll: "Mark all read",
    search: "Search admin... (Ctrl+/)",
    logout: "Log out",
    adminBadge: "Admin Portal",
  },
  kh: {
    dashboard: "ផ្ទាំងគ្រប់គ្រង",
    catalog: "ភាពយន្ត & ភាគ",
    genres: "ប្រភេទភាពយន្ត",
    reviews: "មតិ & ការវាយតម្លៃ",
    subscriptions: "ការទូទាត់ & ជាវ",
    reports: "របាយការណ៍ហិរញ្ញវត្ថុ",
    users: "អ្នកប្រើប្រាស់",
    roles: "តួនាទី & សិទ្ធិ",
    broadcast: "ការផ្សាយសារ",
    audit: "កំណត់ហេតុសវនកម្ម",
    backups: "ការបម្រុងទុក",
    appearance: "Hero & Footer",
    settings: "ការកំណត់ប្រព័ន្ធ",
    profile: "ព័ត៌មានគណនី",
    secMain: "ម៉ឺនុយមេ",
    secCatalog: "ភាពយន្ត & មាតិកា",
    secSales: "ការលក់ & ចំណូល",
    secUsers: "អតិថិជន & សិទ្ធិ",
    secConfig: "ការកំណត់ & ប្រព័ន្ធ",
    notifications: "ការជូនដំណឹង",
    markAll: "សម្គាល់ថាបានអាន",
    search: "ស្វែងរក... (Ctrl+/)",
    logout: "ចាកចេញ",
    adminBadge: "ផ្ទាំងគ្រប់គ្រង",
  },
};

interface NavSection {
  titleKey: keyof typeof DICT.en;
  items: { id: AdminTab; labelKey: keyof typeof DICT.en; icon: React.ElementType }[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    titleKey: "secMain",
    items: [
      { id: "dashboard", labelKey: "dashboard", icon: LayoutGrid },
    ],
  },
  {
    titleKey: "secCatalog",
    items: [
      { id: "catalog", labelKey: "catalog", icon: Film },
      { id: "genres", labelKey: "genres", icon: Tag },
      { id: "reviews", labelKey: "reviews", icon: MessageCircle },
    ],
  },
  {
    titleKey: "secSales",
    items: [
      { id: "subscriptions", labelKey: "subscriptions", icon: CreditCard },
      { id: "reports", labelKey: "reports", icon: Activity },
    ],
  },
  {
    titleKey: "secUsers",
    items: [
      { id: "users", labelKey: "users", icon: Users },
      { id: "roles", labelKey: "roles", icon: ShieldCheck },
    ],
  },
  {
    titleKey: "secConfig",
    items: [
      { id: "broadcast", labelKey: "broadcast", icon: Send },
      { id: "audit", labelKey: "audit", icon: History },
      { id: "backups", labelKey: "backups", icon: Database },
      { id: "appearance", labelKey: "appearance", icon: LayoutTemplate },
      { id: "settings", labelKey: "settings", icon: Settings },
      { id: "profile", labelKey: "profile", icon: User },
    ],
  },
];

function AdminPageContent() {
  const { user: authUser } = useAppSelector((state) => state.auth);
  const [currentAdminUser, setCurrentAdminUser] = useState<{ name: string; email: string; avatarUrl?: string }>({
    name: authUser?.name || "Admin",
    email: authUser?.email || "admin@khmerflix.com",
    avatarUrl: authUser?.image,
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("user");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setCurrentAdminUser({
            name: parsed.displayName || parsed.name || authUser?.name || "Admin",
            email: parsed.email || authUser?.email || "admin@khmerflix.com",
            avatarUrl: parsed.avatarUrl || parsed.image || authUser?.image,
          });
        } catch {}
      }
    }
  }, [authUser]);

  useEffect(() => {
    const handleProfileUpdate = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail) {
        setCurrentAdminUser((prev) => ({
          ...prev,
          name: detail.displayName || detail.name || prev.name,
          avatarUrl: detail.avatarUrl || prev.avatarUrl,
        }));
      }
    };
    window.addEventListener("userProfileUpdated", handleProfileUpdate);
    return () => window.removeEventListener("userProfileUpdated", handleProfileUpdate);
  }, []);

  const searchParams = useSearchParams();

  // Read initial tab from URL ?tab=... or localStorage or fallback to "dashboard"
  const tabParam = searchParams.get("tab") as AdminTab | null;
  const [activeTab, setActiveTab] = useState<AdminTab>(() => {
    if (tabParam && VALID_TABS.includes(tabParam)) return tabParam;
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("admin_active_tab") as AdminTab;
      if (saved && VALID_TABS.includes(saved)) return saved;
    }
    return "dashboard";
  });

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [theme, setTheme] = useState<Theme>("light");
  const [lang, setLang] = useState<Lang>("en");

  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Sync tab with URL search parameter when navigating with browser back/forward
  useEffect(() => {
    if (tabParam && VALID_TABS.includes(tabParam) && tabParam !== activeTab) {
      setActiveTab(tabParam);
    }
  }, [tabParam, activeTab]);

  // Tab switch handler that updates state, localStorage, and URL
  const handleSelectTab = (tabId: AdminTab) => {
    setActiveTab(tabId);
    if (typeof window !== "undefined") {
      localStorage.setItem("admin_active_tab", tabId);
      const url = new URL(window.location.href);
      url.searchParams.set("tab", tabId);
      window.history.pushState({}, "", url.toString());
    }
  };

  // Sync language with localStorage
  useEffect(() => {
    const saved = localStorage.getItem("khmerflix_lang");
    if (saved === "kh" || saved === "en") setLang(saved as Lang);
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail === "kh" || detail === "en") setLang(detail);
    };
    window.addEventListener("languageChange", handler);
    return () => window.removeEventListener("languageChange", handler);
  }, []);

  const handleSetLang = (l: Lang) => {
    setLang(l);
    localStorage.setItem("khmerflix_lang", l);
  };

  // Sync dark class on document element
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", theme === "dark");
    }
  }, [theme]);

  // Close dropdowns on outside click
  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const [adminAvatar, setAdminAvatar] = useState<string>("");

  // Sync admin avatar on mount and on custom event
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("admin_avatar");
      if (saved) setAdminAvatar(saved);
      const handler = (e: Event) => {
        const detail = (e as CustomEvent).detail;
        if (detail) setAdminAvatar(detail);
      };
      window.addEventListener("avatarUpdated", handler);
      return () => window.removeEventListener("avatarUpdated", handler);
    }
  }, []);

  const t = DICT[lang];

  // Theme-adaptive styling
  const bgMain = theme === "light" ? "bg-[#f5f5f9]" : "bg-slate-950";
  const bgCard = theme === "light" ? "bg-white" : "bg-slate-900";
  const borderCard = theme === "light" ? "border-slate-200" : "border-slate-800";
  const textHeading = theme === "light" ? "text-slate-800" : "text-white";
  const textMuted = theme === "light" ? "text-slate-500" : "text-slate-400";
  const bgHover = theme === "light" ? "hover:bg-slate-50" : "hover:bg-slate-800";
  const khmerFont = lang === "kh" ? "font-[\"Kantumruy_Pro\",sans-serif]" : "font-sans";

  const renderTab = () => {
    const props = { lang, theme };
    switch (activeTab) {
      case "dashboard":     return <DashboardTab     {...props} />;
      case "catalog":       return <CatalogTab       {...props} />;
      case "genres":        return <GenresTab        {...props} />;
      case "reviews":       return <ReviewsTab       {...props} />;
      case "subscriptions": return <SubscriptionsTab {...props} />;
      case "reports":       return <ReportsTab       {...props} />;
      case "users":         return <UsersTab         {...props} />;
      case "roles":         return <RolesTab         {...props} />;
      case "broadcast":     return <BroadcastTab     {...props} />;
      case "audit":         return <AuditTab         {...props} />;
      case "backups":       return <BackupsTab       {...props} />;
      case "appearance":    return <AppearanceTab    {...props} />;
      case "settings":      return <SettingsTab      {...props} />;
      case "profile":       return <ProfileTab       {...props} adminEmail={currentAdminUser.email} adminName={currentAdminUser.name} />;
      default:              return null;
    }
  };

  return (
    <div className={`flex h-screen ${bgMain} ${textMuted} ${khmerFont} overflow-hidden transition-colors duration-300`}>
      {/* ── Sidebar with Original Logo & Active Focus Indicator Line ── */}
      <aside
        className={`relative ${bgCard} flex flex-col z-20 flex-shrink-0 transition-all duration-300 shadow-[0_0_15px_0_rgba(0,0,0,0.05)] ${
          sidebarOpen ? "w-64" : "w-20"
        } ${theme === "dark" ? "border-r border-slate-800 shadow-none" : ""}`}
      >
        {/* Floating Circular Toggle Button */}
        <button
          onClick={() => setSidebarOpen(s => !s)}
          className={`absolute -right-4 top-8 w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center shadow-lg cursor-pointer transition-transform z-50 ${
            theme === "dark" ? "border-4 border-slate-950" : "border-4 border-[#f5f5f9]"
          } hover:bg-indigo-600`}
        >
          {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>

        {/* Icon-only Logo (No words) */}
        <div className={`h-16 flex items-center mt-4 whitespace-nowrap overflow-hidden transition-all duration-300 ${
          sidebarOpen ? "px-6" : "px-0 justify-center"
        }`}>
          <div className="flex items-center cursor-pointer group" title="KhmerFlix">
            <div className="flex-shrink-0 flex items-center justify-center">
              <img
                src="/icon.png"
                alt="KhmerFlix"
                className="h-10 w-10 object-contain rounded-xl shadow-xs transition-transform duration-200 group-hover:scale-105"
              />
            </div>
          </div>
        </div>

        {/* Grouped Navigation with Original Active Style & Right Indicator Line */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-3 space-y-4 mt-1 scrollbar-subtle">
          {NAV_SECTIONS.map((sec, sIdx) => (
            <div key={sIdx} className="space-y-0.5">
              {sidebarOpen && (
                <div className="px-3 pb-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  {t[sec.titleKey]}
                </div>
              )}
              {sec.items.map(item => {
                const Icon = item.icon;
                const active = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectTab(item.id)}
                    title={!sidebarOpen ? t[item.labelKey] : undefined}
                    className={`relative flex items-center transition cursor-pointer ${
                      sidebarOpen ? "w-full gap-3 px-3 py-2.5 rounded-lg" : "justify-center w-12 h-12 rounded-xl mb-1"
                    } ${
                      active
                        ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 font-medium"
                        : `${textMuted} ${bgHover}`
                    }`}
                  >
                    <Icon className={`flex-shrink-0 ${sidebarOpen ? "w-4 h-4" : "w-5 h-5"} ${
                      active ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400"
                    }`} />
                    {sidebarOpen && (
                      <span className="text-sm font-medium truncate">{t[item.labelKey]}</span>
                    )}

                    {/* Original Active Indicator Bar on the right edge */}
                    {active && (
                      <div className={`absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-indigo-500 ${
                        sidebarOpen ? "rounded-l-md" : "rounded-full right-1"
                      }`} />
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Sidebar Footer Log out */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => { window.location.href = "/login"; }}
            className={`w-full flex items-center ${
              sidebarOpen ? "gap-3 px-3 py-2 rounded-lg text-sm font-medium" : "justify-center w-12 h-12 rounded-xl"
            } text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer`}
          >
            <LogOut className="w-4 h-4" />
            {sidebarOpen && <span>{t.logout}</span>}
          </button>
        </div>
      </aside>

      {/* ── Main Content Area ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className={`h-16 mx-4 mt-4 mb-2 ${bgCard} border ${borderCard} rounded-xl shadow-[0_2px_6px_0_rgba(0,0,0,0.04)] flex items-center justify-between px-4 z-10 flex-shrink-0 transition-colors`}>
          {/* Left: Breadcrumbs */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(s => !s)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 cursor-pointer lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <span>Admin</span>
              <span>›</span>
              <span className={`font-semibold ${textHeading} capitalize`}>
                {t[activeTab as keyof typeof t] || activeTab}
              </span>
            </div>
          </div>

          {/* Right: Actions, Real Cambodia Flag Language Switcher, Theme Toggle, Profile */}
          <div className="flex items-center gap-4 sm:gap-6">
            {/* Real Official Cambodia Flag Language Switcher */}
            <LanguageSwitcher currentLang={lang} onLangChange={handleSetLang} variant="admin" theme={theme} />

            {/* Dark/Light Mode */}
            <button
              onClick={() => setTheme(th => th === "light" ? "dark" : "light")}
              className="text-slate-400 hover:text-yellow-500 cursor-pointer transition"
            >
              {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>

            {/* Notifications */}
            <NotificationDropdown theme={theme} variant="admin" />

            {/* User Avatar Profile */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(o => !o)}
                className="w-8 h-8 rounded-full bg-slate-200 border-2 border-slate-300 dark:border-slate-700 shadow-sm flex items-center justify-center overflow-hidden cursor-pointer"
              >
                <img
                  src={adminAvatar || currentAdminUser.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentAdminUser.name || "Admin")}&background=6366f1&color=fff&size=128`}
                  alt="Admin"
                  className="w-full h-full object-cover"
                />
              </button>

              {profileOpen && (
                <div className={`absolute right-0 mt-3 w-56 ${bgCard} border ${borderCard} rounded-xl shadow-xl py-1 z-50 overflow-hidden`}>
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                    <p className={`text-sm font-semibold ${textHeading} truncate`}>{currentAdminUser.name || "Admin User"}</p>
                    <p className={`text-xs ${textMuted} truncate mt-0.5`}>{currentAdminUser.email || "admin@khmerflix.com"}</p>
                  </div>
                  <button
                    onClick={() => { setProfileOpen(false); handleSelectTab("profile"); }}
                    className={`w-full text-left px-4 py-2.5 text-sm ${textHeading} ${bgHover} transition flex items-center gap-2 cursor-pointer`}
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    {t.profile}
                  </button>
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      if (typeof window !== "undefined") {
                        localStorage.removeItem("access_token");
                        localStorage.removeItem("refresh_token");
                        localStorage.removeItem("user");
                        localStorage.removeItem("admin_avatar");
                        localStorage.removeItem("admin_active_tab");
                      }
                      window.location.href = "/login";
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm text-red-600 ${bgHover} transition flex items-center gap-2 cursor-pointer`}
                  >
                    <LogOut className="w-4 h-4" />
                    {t.logout}
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Scrollable Page Main Content */}
        <main className="flex-1 overflow-y-auto p-6 w-full">
          <div className="w-full">
            {renderTab()}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-[#f5f5f9] dark:bg-slate-950">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <AdminPageContent />
    </Suspense>
  );
}
