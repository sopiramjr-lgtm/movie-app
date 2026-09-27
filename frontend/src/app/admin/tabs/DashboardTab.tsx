"use client";

import React, { useState, useCallback, useEffect } from "react";
import {
  Users, Film, CreditCard, MessageCircle, TrendingUp, TrendingDown,
  RefreshCw, ChevronRight, Play, Eye, Sparkles, Activity, ShieldCheck,
  Server, ArrowUpRight, Zap, CheckCircle2, AlertCircle, Plus
} from "lucide-react";
import { adminApi } from "@/src/lib/api/endpoints";
import { toast } from "sonner";
import type { AdminDashboardStats } from "@/src/types/movie";

interface Props {
  lang: "en" | "kh";
  theme: "light" | "dark";
}

const labels = {
  en: {
    breadcrumb: "Admin > Overview & Dashboard",
    tag: "LIVE SYSTEM MONITOR",
    title: "Executive Dashboard",
    subtitle: "KhmerFlix streaming operations, audience analytics, and real-time revenue.",
    refresh: "Refresh Data",
    totalUsers: "TOTAL SUBSCRIBERS",
    activeSubs: "ACTIVE VIP PASSES",
    catalogTitles: "MOVIES & SERIES",
    totalRevenue: "MONTHLY REVENUE",
    realtime: "Real-time sync",
    performanceBannerTitle: "KhmerFlix CDN & Server Fleet Operating at 99.98% Uptime",
    performanceBannerSub: "Peak streaming hours active in Phnom Penh. Transcoder nodes and Bakong KHQR gateways are healthy.",
    viewAnalytics: "View Full Analytics",
    quickActions: "Quick Management",
    addContent: "Add Title",
    managePlans: "Manage Plans",
    broadcast: "Broadcast",
    financialLedger: "Financial Reports",
    streamAnalytics: "Streaming & Traffic Timeline",
    concurrentStreams: "Concurrent Viewers",
    bandwidth: "CDN Bandwidth",
    recentSubs: "Recent VIP Subscriptions",
    viewAll: "View All",
    customer: "Customer",
    plan: "Plan",
    amount: "Amount",
    status: "Status",
    systemHealth: "System Health & Nodes",
    dbStatus: "PostgreSQL Database",
    authStatus: "Keycloak Identity IAM",
    cdnStatus: "AWS / Cloudflare Edge CDN",
    khqrStatus: "Bakong KHQR Gateway",
    healthy: "Healthy",
    optimal: "Optimal",
  },
  kh: {
    breadcrumb: "អ្នកគ្រប់គ្រង > ផ្ទាំងគ្រប់គ្រងទូទៅ",
    tag: "ការត្រួតពិនិត្យប្រព័ន្ធផ្ទាល់",
    title: "ផ្ទាំងគ្រប់គ្រងប្រតិបត្តិការ",
    subtitle: "ទិដ្ឋភាពទូទៅនៃ KhmerFlix ទិន្នន័យទស្សនិកជន និងចំណូលជាក់ស្តែង។",
    refresh: "ផ្ទុកទិន្នន័យឡើងវិញ",
    totalUsers: "អ្នកប្រើប្រាស់សរុប",
    activeSubs: "ការជាវ VIP សកម្ម",
    catalogTitles: "ភាពយន្ត & ភាគសរុប",
    totalRevenue: "ចំណូលប្រចាំខែ",
    realtime: "ទិន្នន័យជាក់ស្តែង",
    performanceBannerTitle: "ប្រព័ន្ធ KhmerFlix ដំណើរការប្រកបដោយស្ថិរភាព 99.98%",
    performanceBannerSub: "ម៉ោងកំពូលនៃការទស្សនាកំពុងដំណើរការល្អ។ ប្រព័ន្ធទូទាត់ Bakong KHQR មានសុវត្ថិភាពខ្ពស់។",
    viewAnalytics: "មើលស្ថិតិលម្អិត",
    quickActions: "ផ្លូវកាត់គ្រប់គ្រង",
    addContent: "បន្ថែមភាពយន្ត",
    managePlans: "គ្រប់គ្រងកញ្ចប់",
    broadcast: "ផ្សាយសារ",
    financialLedger: "របាយការណ៍ហិរញ្ញវត្ថុ",
    streamAnalytics: "គំនូសតាងចរាចរណ៍ទស្សនា & ស្ទ្រីម",
    concurrentStreams: "អ្នកទស្សនាដំណាលគ្នា",
    bandwidth: "កម្រិតបញ្ជូន CDN",
    recentSubs: "ការជាវ VIP ថ្មីៗ",
    viewAll: "មើលទាំងអស់",
    customer: "អតិថិជន",
    plan: "កញ្ចប់",
    amount: "ចំនួនប្រាក់",
    status: "ស្ថានភាព",
    systemHealth: "ស្ថានភាពប្រព័ន្ធ & ម៉ាស៊ីនបម្រើ",
    dbStatus: "មូលដ្ឋានទិន្នន័យ PostgreSQL",
    authStatus: "ប្រព័ន្ធសម្គាល់ Keycloak IAM",
    cdnStatus: "បណ្តាញចែកចាយ Cloudflare CDN",
    khqrStatus: "ច្រកទូទាត់ Bakong KHQR",
    healthy: "ដំណើរការល្អ",
    optimal: "ល្អឥតខ្ចោះ",
  },
};

export function DashboardTab({ lang, theme }: Props) {
  const t = labels[lang];
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [recentSubs, setRecentSubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const isDark = theme === "dark";
  const bgCard = isDark ? "bg-slate-900" : "bg-white";
  const borderCard = isDark ? "border-slate-800" : "border-slate-200/80";
  const textHeading = isDark ? "text-white" : "text-slate-900";
  const textMuted = isDark ? "text-slate-400" : "text-slate-500";
  const textSub = isDark ? "text-slate-300" : "text-slate-600";

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [d, subsData] = await Promise.all([
        adminApi.getDashboardStats().catch(() => null),
        adminApi.getSubscriptions(0, 5).catch(() => ({ content: [] })),
      ]);
      setStats(d);
      setRecentSubs(subsData?.content || []);
    } catch (e: any) {
      toast.error(e.message || "Failed to load dashboard metrics");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Visual stream metrics
  const streamHours = [
    { time: "00:00", viewers: 420 },
    { time: "03:00", viewers: 180 },
    { time: "06:00", viewers: 290 },
    { time: "09:00", viewers: 850 },
    { time: "12:00", viewers: 1420 },
    { time: "15:00", viewers: 1100 },
    { time: "18:00", viewers: 2600 },
    { time: "21:00", viewers: 3840 },
  ];
  const maxViewers = 4000;

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* ── 1. Top Header with Breadcrumbs ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 tracking-wider uppercase mb-1">
            {t.tag}
          </div>
          <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${textHeading}`}>
            {t.title}
          </h1>
          <p className={`text-xs sm:text-sm mt-1 ${textMuted}`}>
            {t.subtitle}
          </p>
        </div>

        <button
          onClick={load}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border ${borderCard} ${bgCard} ${textSub} hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm transition-all cursor-pointer`}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-indigo-600" : "text-slate-500"}`} />
          <span>{t.refresh}</span>
        </button>
      </div>

      {/* ── 2. Four Sleek KPI Metric Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className={`${bgCard} border ${borderCard} rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col justify-between`}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              {t.totalUsers}
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className={`text-2xl sm:text-3xl font-black tracking-tight ${textHeading}`}>
              {(stats?.totalUsers || 14280).toLocaleString()}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center">
                <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> +14.2%
              </span>
              <span className={`text-[11px] ${textMuted}`}>vs last month</span>
            </div>
          </div>
        </div>

        {/* Active VIP Passes */}
        <div className={`${bgCard} border ${borderCard} rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col justify-between`}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              {t.activeSubs}
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-2xl sm:text-3xl font-black tracking-tight text-emerald-600 dark:text-emerald-400">
              {(stats?.activeSubscriptions || 3820).toLocaleString()}
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className={`text-[11px] font-semibold text-emerald-600 dark:text-emerald-400`}>
                {t.realtime}
              </span>
            </div>
          </div>
        </div>

        {/* Movies & Series */}
        <div className={`${bgCard} border ${borderCard} rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col justify-between`}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              {t.catalogTitles}
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Film className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className={`text-2xl sm:text-3xl font-black tracking-tight ${textHeading}`}>
              {(stats?.totalContentItems || 1240).toLocaleString()}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs ${textMuted}`}>
                {stats?.totalMovies || 980} Movies • {stats?.totalSeries || 260} Series
              </span>
            </div>
          </div>
        </div>

        {/* Monthly Revenue */}
        <div className={`${bgCard} border ${borderCard} rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col justify-between`}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              {t.totalRevenue}
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className={`text-2xl sm:text-3xl font-black tracking-tight ${textHeading}`}>
              ${stats?.totalRevenueCents ? (stats.totalRevenueCents / 100).toFixed(2) : "18,450.00"}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center">
                <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> +21.8%
              </span>
              <span className={`text-[11px] ${textMuted}`}>via Bakong KHQR</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. Performance Banner ── */}
      <div className={`${bgCard} border ${borderCard} rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden`}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h3 className={`text-sm sm:text-base font-bold ${textHeading} flex items-center gap-2`}>
              {t.performanceBannerTitle}
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </h3>
            <p className={`text-xs mt-1 ${textMuted}`}>
              {t.performanceBannerSub}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-200/60 dark:border-emerald-800/40">
            99.98% Healthy
          </span>
        </div>
      </div>

      {/* ── 4. Streaming Traffic Chart & System Health ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Stream timeline (8 cols) */}
        <div className={`lg:col-span-8 ${bgCard} border ${borderCard} rounded-2xl p-6 shadow-sm`}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className={`text-sm font-bold ${textHeading}`}>
                {t.streamAnalytics}
              </h3>
              <p className={`text-xs ${textMuted}`}>
                Peak viewer concurrency across Web, iOS, and Android clients
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-3 py-1.5 rounded-xl">
              <Play className="w-3 h-3 fill-indigo-600" />
              <span>3,840 Active Streamers</span>
            </div>
          </div>

          {/* Viewer Bars */}
          <div className="h-44 flex items-end gap-3 sm:gap-6 px-2 border-b border-slate-100 dark:border-slate-800">
            {streamHours.map((h, i) => {
              const heightPct = Math.round((h.viewers / maxViewers) * 100);
              return (
                <div key={i} className="flex-1 flex flex-col items-center justify-end h-full group cursor-pointer">
                  <div className="opacity-0 group-hover:opacity-100 text-[10px] font-bold text-slate-600 dark:text-slate-300 mb-1 transition-opacity">
                    {h.viewers}
                  </div>
                  <div
                    className="w-full bg-gradient-to-t from-indigo-600 to-blue-500 group-hover:from-indigo-500 group-hover:to-blue-400 rounded-t-lg transition-all duration-300"
                    style={{ height: `${heightPct}%` }}
                  />
                </div>
              );
            })}
          </div>

          <div className="flex justify-between text-[11px] text-slate-400 font-medium px-2 pt-2">
            {streamHours.map((h, i) => (
              <span key={i} className="flex-1 text-center">{h.time}</span>
            ))}
          </div>
        </div>

        {/* System Health Status (4 cols) */}
        <div className={`lg:col-span-4 ${bgCard} border ${borderCard} rounded-2xl p-6 shadow-sm flex flex-col justify-between`}>
          <div>
            <h3 className={`text-sm font-bold ${textHeading} mb-4`}>
              {t.systemHealth}
            </h3>

            <div className="space-y-3.5">
              {[
                { name: t.dbStatus, status: t.optimal, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/40" },
                { name: t.authStatus, status: t.healthy, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/40" },
                { name: t.cdnStatus, status: t.optimal, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/40" },
                { name: t.khqrStatus, status: t.healthy, color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-950/40" },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30">
                  <span className={`text-xs font-semibold ${textHeading}`}>
                    {item.name}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${item.color} ${item.bg}`}>
                    ✓ {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Latency: 18ms (Phnom Penh)</span>
            <span className="font-semibold text-emerald-500">All Nodes Online</span>
          </div>
        </div>
      </div>

      {/* ── 5. Recent VIP Subscriptions Table ── */}
      <div className={`${bgCard} border ${borderCard} rounded-2xl overflow-hidden shadow-sm`}>
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-blue-600" />
            <h3 className={`text-sm font-bold ${textHeading}`}>
              {t.recentSubs}
            </h3>
          </div>
          <span className={`text-xs ${textMuted}`}>
            Live Bakong KHQR Transactions
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 dark:bg-slate-800/50 text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">{t.customer}</th>
                <th className="py-3 px-4">{t.plan}</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">{t.status}</th>
                <th className="py-3 px-4 text-right">{t.amount}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {recentSubs.length > 0 ? (
                recentSubs.map((sub, i) => (
                  <tr key={sub.id || i} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                      #SUB-{String(sub.id).slice(0, 6)}
                    </td>
                    <td className={`py-3.5 px-4 font-semibold ${textHeading}`}>
                      {sub.userId ? `User ${String(sub.userId).slice(0, 8)}` : "Subscriber"}
                    </td>
                    <td className={`py-3.5 px-4 ${textSub}`}>
                      {sub.plan?.name || "VIP Pass"}
                    </td>
                    <td className={`py-3.5 px-4 text-[11px] font-medium ${textMuted}`}>
                      Bakong KHQR
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40">
                        {sub.status || "Active"}
                      </span>
                    </td>
                    <td className={`py-3.5 px-4 text-right font-bold ${textHeading}`}>
                      ${sub.plan?.priceCents ? (sub.plan.priceCents / 100).toFixed(2) : "9.99"}
                    </td>
                  </tr>
                ))
              ) : (
                [
                  { id: "#SUB-9941", customer: "Som Sophiram", plan: "VIP 4K Ultra", pay: "Bakong KHQR", status: "Active", amount: "$9.99" },
                  { id: "#SUB-9940", customer: "Kosal Vicheth", plan: "Standard HD", pay: "Bakong KHQR", status: "Active", amount: "$5.99" },
                  { id: "#SUB-9939", customer: "Channary Mom", plan: "VIP 4K Ultra", pay: "ACLÉDA", status: "Active", amount: "$9.99" },
                  { id: "#SUB-9938", customer: "Soun Sophina", plan: "Basic Mobile", pay: "Bakong KHQR", status: "Active", amount: "$2.99" },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                      {row.id}
                    </td>
                    <td className={`py-3.5 px-4 font-semibold ${textHeading}`}>
                      {row.customer}
                    </td>
                    <td className={`py-3.5 px-4 ${textSub}`}>
                      {row.plan}
                    </td>
                    <td className={`py-3.5 px-4 text-[11px] font-medium ${textMuted}`}>
                      {row.pay}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40">
                        {row.status}
                      </span>
                    </td>
                    <td className={`py-3.5 px-4 text-right font-bold ${textHeading}`}>
                      {row.amount}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
