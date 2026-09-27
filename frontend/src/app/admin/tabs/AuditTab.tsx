"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  History, User, Film, ShieldCheck, CreditCard, Star, RefreshCw,
  Search, Filter, Download, Plus, Trash2, Eye, Copy, Check,
  AlertTriangle, CheckCircle2, XCircle, ArrowUpDown, ChevronLeft,
  ChevronRight, Clock, Shield, Sparkles, FileText, Code, Database,
  Radio, X, Send, Activity, Info
} from "lucide-react";
import { adminApi } from "@/src/lib/api/endpoints";
import { toast } from "sonner";
import type { AuditLogResponse } from "@/src/types/movie";

interface Props {
  lang: "en" | "kh";
  theme: "light" | "dark";
}

// Action metadata mapping for icons, colors, and badges
const ACTION_META: Record<string, { icon: React.ElementType; color: string; badge: string; label: string; labelKh: string }> = {
  USER_LOGIN:       { icon: User,         color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",     badge: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/50", label: "User Login", labelKh: "ការចូលគណនី" },
  AUTH_FAILED:      { icon: AlertTriangle,color: "bg-rose-500/10 text-rose-600 dark:text-rose-400",     badge: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800/50", label: "Auth Failed", labelKh: "បរាជ័យចូល" },
  CONTENT_CREATED:  { icon: Film,         color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400", badge: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/50", label: "Content Created", labelKh: "បង្កើតមាតិកា" },
  CONTENT_UPDATED:  { icon: Film,         color: "bg-teal-500/10 text-teal-600 dark:text-teal-400",        badge: "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-900/30 dark:text-teal-400 dark:border-teal-800/50", label: "Content Updated", labelKh: "កែប្រែមាតិកា" },
  CONTENT_DELETED:  { icon: Trash2,       color: "bg-rose-500/10 text-rose-600 dark:text-rose-400",     badge: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800/50", label: "Content Deleted", labelKh: "លុបមាតិកា" },
  GENRE_CREATED:    { icon: Sparkles,     color: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",        badge: "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-400 dark:border-cyan-800/50", label: "Genre Created", labelKh: "បង្កើតប្រភេទ" },
  USER_BANNED:      { icon: ShieldCheck,  color: "bg-amber-500/10 text-amber-600 dark:text-amber-400",     badge: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50", label: "User Banned", labelKh: "ផ្អាកអ្នកប្រើ" },
  ROLE_CHANGED:     { icon: Shield,       color: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",  badge: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800/50", label: "Role Changed", labelKh: "ប្តូរតួនាទី" },
  PLAN_CREATED:     { icon: CreditCard,   color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400", badge: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/50", label: "Plan Created", labelKh: "បង្កើតកញ្ចប់" },
  BROADCAST_SENT:   { icon: Send,         color: "bg-purple-500/10 text-purple-600 dark:text-purple-400",  badge: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800/50", label: "Broadcast Sent", labelKh: "ផ្ញើសារផ្សាយ" },
  REVIEW_DELETED:   { icon: Star,         color: "bg-pink-500/10 text-pink-600 dark:text-pink-400",        badge: "bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-900/30 dark:text-pink-400 dark:border-pink-800/50", label: "Review Deleted", labelKh: "លុបការវាយតម្លៃ" },
  BACKUP_CREATED:   { icon: Database,     color: "bg-sky-500/10 text-sky-600 dark:text-sky-400",           badge: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-900/30 dark:text-sky-400 dark:border-sky-800/50", label: "Backup Created", labelKh: "បង្កើតបម្រុងទុក" },
  SETTINGS_UPDATED: { icon: Activity,     color: "bg-violet-500/10 text-violet-600 dark:text-violet-400",  badge: "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-900/30 dark:text-violet-400 dark:border-violet-800/50", label: "Settings Updated", labelKh: "កែប្រែការកំណត់" },
};

const labels = {
  en: {
    title: "System Audit Ledger",
    subtitle: "Real-time tamper-evident administrative events, access logs, and modification history.",
    notice: "Live audit logs dynamically streamed from PostgreSQL audit ledger via Spring Boot backend.",
    action: "Action",
    actor: "Admin Actor",
    target: "Target Entity",
    details: "Event Summary & Details",
    timestamp: "Timestamp",
    targetId: "Target ID",
    status: "Status",
    noLogs: "No audit logs match your filter criteria.",
    searchPlaceholder: "Search logs by action, admin, entity, ID, IP...",
    allActions: "All Actions",
    allEntities: "All Entities",
    allStatuses: "All Statuses",
    allTime: "All Time",
    today: "Today",
    last7Days: "Last 7 Days",
    last30Days: "Last 30 Days",
    success: "Success",
    warning: "Warning",
    failure: "Failure",
    autoRefresh: "Auto-refresh",
    refreshNow: "Refresh",
    exportCsv: "Export CSV",
    exportJson: "Export JSON",
    recordEvent: "Record Log",
    clearLogs: "Clear Ledger",
    totalEvents: "Total Audit Events",
    successRate: "Successful Operations",
    securityAlerts: "Security & Warnings",
    activeActors: "Active Admin Actors",
    eventDetailTitle: "Audit Event Inspector",
    close: "Close",
    copyId: "Copy ID",
    copied: "Copied to clipboard!",
    rawJson: "Raw JSON Payload",
    createLogTitle: "Record Audit Log Event",
    actionName: "Action Name",
    targetType: "Target Entity Type",
    targetIdOptional: "Target UUID (Optional)",
    detailsDesc: "Operation Description / Details",
    statusSelect: "Execution Status",
    cancel: "Cancel",
    saveLog: "Save Audit Log",
    clearConfirmTitle: "Clear All Audit Logs?",
    clearConfirmDesc: "This will permanently delete all audit event entries from PostgreSQL. This action cannot be undone.",
    clearConfirmBtn: "Yes, Clear Ledger",
    showing: "Showing",
    to: "to",
    of: "of",
    events: "events",
  },
  kh: {
    title: "កំណត់ហេតុសវនកម្មប្រព័ន្ធ",
    subtitle: "ព្រឹត្តិការណ៍រដ្ឋបាលជាក់ស្តែង កំណត់ត្រាចូលប្រើប្រាស់ និងប្រវត្តិការកែប្រែមាតិកា។",
    notice: "កំណត់ហេតុសវនកម្មជាក់ស្តែងពីមូលដ្ឋានទិន្នន័យ PostgreSQL តាមរយៈ Spring Boot backend។",
    action: "សកម្មភាព",
    actor: "អ្នកគ្រប់គ្រង",
    target: "ទិសដៅ",
    details: "សេចក្តីសង្ខេប & ព័ត៌មានលម្អិត",
    timestamp: "ពេលវេលា",
    targetId: "លេខសម្គាល់",
    status: "ស្ថានភាព",
    noLogs: "មិនមានកំណត់ហេតុដែលត្រូវនឹងការស្វែងរករបស់អ្នកទេ។",
    searchPlaceholder: "ស្វែងរកតាមសកម្មភាព, អ្នកគ្រប់គ្រង, ប្រភេទ, ID, IP...",
    allActions: "សកម្មភាពទាំងអស់",
    allEntities: "ទិសដៅទាំងអស់",
    allStatuses: "ស្ថានភាពទាំងអស់",
    allTime: "គ្រប់ពេល",
    today: "ថ្ងៃនេះ",
    last7Days: "៧ ថ្ងៃចុងក្រោយ",
    last30Days: "៣០ ថ្ងៃចុងក្រោយ",
    success: "ជោគជ័យ",
    warning: "ការព្រមាន",
    failure: "បរាជ័យ",
    autoRefresh: "ផ្ទុកឡើងវិញស្វ័យប្រវត្តិ",
    refreshNow: "ផ្ទុកឡើងវិញ",
    exportCsv: "ទាញយក CSV",
    exportJson: "ទាញយក JSON",
    recordEvent: "កត់ត្រាសវនកម្ម",
    clearLogs: "សម្អាតកំណត់ហេតុ",
    totalEvents: "ព្រឹត្តិការណ៍សរុប",
    successRate: "ប្រតិបត្តិការជោគជ័យ",
    securityAlerts: "សន្តិសុខ & ការព្រមាន",
    activeActors: "អ្នកគ្រប់គ្រងសកម្ម",
    eventDetailTitle: "ព័ត៌មានលម្អិតព្រឹត្តិការណ៍សវនកម្ម",
    close: "បិទ",
    copyId: "ចម្លង ID",
    copied: "បានចម្លងទៅកាន់ clipboard!",
    rawJson: "ទិន្នន័យ JSON ដើម",
    createLogTitle: "កត់ត្រាព្រឹត្តិការណ៍សវនកម្មថ្មី",
    actionName: "ឈ្មោះសកម្មភាព",
    targetType: "ប្រភេទអង្គភាពទិសដៅ",
    targetIdOptional: "លេខសម្គាល់ UUID ទិសដៅ (ស្រេចចិត្ត)",
    detailsDesc: "ការពិពណ៌នាប្រតិបត្តិការ / ព័ត៌មានលម្អិត",
    statusSelect: "ស្ថានភាពដំណើរការ",
    cancel: "បោះបង់",
    saveLog: "រក្សាទុកកំណត់ហេតុ",
    clearConfirmTitle: "សម្អាតកំណត់ហេតុសវនកម្មទាំងអស់?",
    clearConfirmDesc: "សកម្មភាពនេះនឹងលុបកំណត់ហេតុទាំងអស់ចេញពី PostgreSQL ដោយមិនអាចស្តារឡើងវិញបានទេ។",
    clearConfirmBtn: "យល់ព្រម, សម្អាតទាំងអស់",
    showing: "បង្ហាញពី",
    to: "ដល់",
    of: "នៃ",
    events: "ព្រឹត្តិការណ៍",
  },
};

export function AuditTab({ lang, theme }: Props) {
  const isKhmer = lang === "kh";
  const t = labels[lang];

  // Core Data
  const [logs, setLogs] = useState<AuditLogResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAction, setSelectedAction] = useState("ALL");
  const [selectedEntity, setSelectedEntity] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedDateRange, setSelectedDateRange] = useState("ALL");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals
  const [detailLog, setDetailLog] = useState<AuditLogResponse | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New Log Form
  const [newAction, setNewAction] = useState("CONTENT_CREATED");
  const [newTargetType, setNewTargetType] = useState("CONTENT");
  const [newTargetId, setNewTargetId] = useState("");
  const [newDetails, setNewDetails] = useState("");
  const [newStatus, setNewStatus] = useState("SUCCESS");
  const [submitting, setSubmitting] = useState(false);

  // Theme Helpers
  const isDark = theme === "dark";
  const bg = isDark ? "bg-slate-900" : "bg-white";
  const bgCard = isDark ? "bg-slate-900/90" : "bg-white";
  const textH = isDark ? "text-white" : "text-slate-900";
  const textM = isDark ? "text-slate-400" : "text-slate-500";
  const border = isDark ? "border-slate-800" : "border-slate-200";
  const bgSubtle = isDark ? "bg-slate-950/60" : "bg-slate-50/70";

  // Data Fetching
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi.getAuditLogs();
      setLogs(Array.isArray(data) ? data : []);
    } catch (e: any) {
      toast.error(e.message || "Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Auto-refresh interval (every 15s when enabled)
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      load();
    }, 15000);
    return () => clearInterval(interval);
  }, [autoRefresh, load]);

  // KPI Calculations
  const stats = useMemo(() => {
    const total = logs.length;
    const success = logs.filter(l => (l.status || "SUCCESS") === "SUCCESS").length;
    const warnings = logs.filter(l => l.status === "WARNING" || l.status === "FAILURE" || l.action.includes("BANNED") || l.action.includes("FAILED")).length;
    const uniqueActors = new Set(logs.map(l => l.adminEmail)).size;
    return { total, success, warnings, uniqueActors };
  }, [logs]);

  // Distinct Filter Options
  const distinctActions = useMemo(() => {
    const set = new Set(logs.map(l => l.action).filter(Boolean));
    return Array.from(set);
  }, [logs]);

  const distinctEntities = useMemo(() => {
    const set = new Set(logs.map(l => l.targetType).filter(Boolean));
    return Array.from(set);
  }, [logs]);

  // Filtered & Sorted Data
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      // Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchAction = log.action?.toLowerCase().includes(q);
        const matchEmail = log.adminEmail?.toLowerCase().includes(q);
        const matchName = log.adminName?.toLowerCase().includes(q);
        const matchType = log.targetType?.toLowerCase().includes(q);
        const matchId = log.targetId?.toLowerCase().includes(q);
        const matchDetails = log.details?.toLowerCase().includes(q);
        const matchIp = log.ipAddress?.toLowerCase().includes(q);
        if (!matchAction && !matchEmail && !matchName && !matchType && !matchId && !matchDetails && !matchIp) {
          return false;
        }
      }

      // Action filter
      if (selectedAction !== "ALL" && log.action !== selectedAction) {
        return false;
      }

      // Entity filter
      if (selectedEntity !== "ALL" && log.targetType !== selectedEntity) {
        return false;
      }

      // Status filter
      if (selectedStatus !== "ALL") {
        const status = log.status || "SUCCESS";
        if (status !== selectedStatus) return false;
      }

      // Date Range filter
      if (selectedDateRange !== "ALL" && log.createdAt) {
        const logDate = new Date(log.createdAt).getTime();
        const now = Date.now();
        if (selectedDateRange === "TODAY") {
          const oneDayAgo = now - 24 * 60 * 60 * 1000;
          if (logDate < oneDayAgo) return false;
        } else if (selectedDateRange === "7D") {
          const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
          if (logDate < sevenDaysAgo) return false;
        } else if (selectedDateRange === "30D") {
          const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
          if (logDate < thirtyDaysAgo) return false;
        }
      }

      return true;
    }).sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });
  }, [logs, searchQuery, selectedAction, selectedEntity, selectedStatus, selectedDateRange, sortOrder]);

  // Paginated Slices
  const totalPages = Math.ceil(filteredLogs.length / pageSize) || 1;
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredLogs.slice(start, start + pageSize);
  }, [filteredLogs, currentPage, pageSize]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedAction, selectedEntity, selectedStatus, selectedDateRange, pageSize]);

  // Copy helper
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    toast.success(t.copied);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Export CSV
  const handleExportCSV = () => {
    if (filteredLogs.length === 0) {
      toast.error("No logs to export");
      return;
    }
    const headers = ["ID", "Timestamp", "Admin Actor", "Admin Email", "Action", "Target Type", "Target ID", "Status", "IP Address", "Details"];
    const rows = filteredLogs.map(l => [
      `"${l.id}"`,
      `"${l.createdAt}"`,
      `"${l.adminName || 'Admin'}"`,
      `"${l.adminEmail}"`,
      `"${l.action}"`,
      `"${l.targetType}"`,
      `"${l.targetId || ''}"`,
      `"${l.status || 'SUCCESS'}"`,
      `"${l.ipAddress || '127.0.0.1'}"`,
      `"${(l.details || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `khmerflix_audit_ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Audit log CSV exported successfully");
  };

  // Export JSON
  const handleExportJSON = () => {
    if (filteredLogs.length === 0) {
      toast.error("No logs to export");
      return;
    }
    const jsonStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(filteredLogs, null, 2));
    const link = document.createElement("a");
    link.setAttribute("href", jsonStr);
    link.setAttribute("download", `khmerflix_audit_ledger_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Audit log JSON exported successfully");
  };

  // Handle Create Audit Log Event
  const handleCreateAuditLog = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await adminApi.createAuditLog({
        action: newAction.trim(),
        targetType: newTargetType.trim(),
        targetId: newTargetId.trim() || undefined,
        details: newDetails.trim() || undefined,
        status: newStatus,
      });
      toast.success("Audit log event recorded successfully");
      setShowCreateModal(false);
      setNewDetails("");
      setNewTargetId("");
      await load();
    } catch (err: any) {
      toast.error(err.message || "Failed to create audit log event");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Clear Audit Logs
  const handleClearAuditLogs = async () => {
    setSubmitting(true);
    try {
      await adminApi.clearAuditLogs();
      toast.success("Audit ledger cleared successfully");
      setShowClearModal(false);
      await load();
    } catch (err: any) {
      toast.error(err.message || "Failed to clear audit ledger");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── 1. Top KPI Summary Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Events */}
        <div className={`${bgCard} p-4 rounded-2xl border ${border} shadow-xs flex items-center justify-between`}>
          <div className="space-y-1">
            <p className={`text-xs font-semibold uppercase tracking-wider ${textM}`}>{t.totalEvents}</p>
            <p className={`text-2xl font-extrabold ${textH}`}>{stats.total}</p>
            <p className="text-[11px] text-indigo-500 font-medium flex items-center gap-1">
              <Database className="w-3 h-3" /> PostgreSQL Ledger
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <History className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Successful Operations */}
        <div className={`${bgCard} p-4 rounded-2xl border ${border} shadow-xs flex items-center justify-between`}>
          <div className="space-y-1">
            <p className={`text-xs font-semibold uppercase tracking-wider ${textM}`}>{t.successRate}</p>
            <p className={`text-2xl font-extrabold text-emerald-600 dark:text-emerald-400`}>{stats.success}</p>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> {stats.total > 0 ? Math.round((stats.success / stats.total) * 100) : 100}% verified
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Security & Warnings */}
        <div className={`${bgCard} p-4 rounded-2xl border ${border} shadow-xs flex items-center justify-between`}>
          <div className="space-y-1">
            <p className={`text-xs font-semibold uppercase tracking-wider ${textM}`}>{t.securityAlerts}</p>
            <p className={`text-2xl font-extrabold ${stats.warnings > 0 ? "text-amber-500" : textH}`}>{stats.warnings}</p>
            <p className="text-[11px] text-amber-500 font-medium flex items-center gap-1">
              <Shield className="w-3 h-3" /> Auth, Bans & Flags
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Active Admin Actors */}
        <div className={`${bgCard} p-4 rounded-2xl border ${border} shadow-xs flex items-center justify-between`}>
          <div className="space-y-1">
            <p className={`text-xs font-semibold uppercase tracking-wider ${textM}`}>{t.activeActors}</p>
            <p className={`text-2xl font-extrabold ${textH}`}>{stats.uniqueActors}</p>
            <p className="text-[11px] text-blue-500 font-medium flex items-center gap-1">
              <User className="w-3 h-3" /> Keycloak Verified
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
            <User className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* ── 2. Information Banner & Action Controls Bar ── */}
      <div className={`${bgCard} rounded-2xl border ${border} p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4`}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <Activity className="w-4.5 h-4.5" />
          </div>
          <div>
            <h2 className={`text-sm sm:text-base font-bold ${textH}`}>{t.title}</h2>
            <p className={`text-xs ${textM}`}>{t.notice}</p>
          </div>
        </div>

        {/* Quick Toolbar Options */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Auto Refresh toggle */}
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition cursor-pointer ${
              autoRefresh
                ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                : `${bgSubtle} ${border} ${textM} hover:text-slate-800 dark:hover:text-white`
            }`}
            title="Auto-refresh ledger every 15 seconds"
          >
            <span className={`w-2 h-2 rounded-full ${autoRefresh ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
            {t.autoRefresh}
          </button>

          {/* Refresh Now */}
          <button
            onClick={load}
            disabled={loading}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border ${border} ${bgSubtle} ${textM} hover:text-indigo-600 hover:border-indigo-300 transition cursor-pointer`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-indigo-600" : ""}`} />
            <span>{t.refreshNow}</span>
          </button>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border ${border} ${bgSubtle} ${textM} hover:text-slate-900 dark:hover:text-white hover:border-slate-300 transition cursor-pointer`}
            title="Download CSV report"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t.exportCsv}</span>
          </button>

          {/* Export JSON */}
          <button
            onClick={handleExportJSON}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border ${border} ${bgSubtle} ${textM} hover:text-slate-900 dark:hover:text-white hover:border-slate-300 transition cursor-pointer`}
            title="Download JSON report"
          >
            <Code className="w-3.5 h-3.5" />
            <span>{t.exportJson}</span>
          </button>

          {/* Record Log Button */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t.recordEvent}</span>
          </button>

          {/* Clear Logs Button */}
          <button
            onClick={() => setShowClearModal(true)}
            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-transparent hover:border-rose-200 dark:hover:border-rose-900 transition cursor-pointer"
            title="Prune/Clear all audit logs"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── 3. Filters & Search Section ── */}
      <div className={`${bgCard} rounded-2xl border ${border} p-4 shadow-xs space-y-3`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${textM}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className={`w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border ${border} ${bgSubtle} ${textH} placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Dropdowns Grid */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Filter by Action */}
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border ${border} ${bgSubtle} ${textH} focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer`}
            >
              <option value="ALL">{t.allActions}</option>
              {distinctActions.map(action => (
                <option key={action} value={action}>
                  {ACTION_META[action] ? (isKhmer ? ACTION_META[action].labelKh : ACTION_META[action].label) : action.replace(/_/g, " ")}
                </option>
              ))}
            </select>

            {/* Filter by Target Entity */}
            <select
              value={selectedEntity}
              onChange={(e) => setSelectedEntity(e.target.value)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border ${border} ${bgSubtle} ${textH} focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer`}
            >
              <option value="ALL">{t.allEntities}</option>
              {distinctEntities.map(entity => (
                <option key={entity} value={entity}>{entity}</option>
              ))}
            </select>

            {/* Filter by Status */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border ${border} ${bgSubtle} ${textH} focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer`}
            >
              <option value="ALL">{t.allStatuses}</option>
              <option value="SUCCESS">{t.success}</option>
              <option value="WARNING">{t.warning}</option>
              <option value="FAILURE">{t.failure}</option>
            </select>

            {/* Filter by Date Range */}
            <select
              value={selectedDateRange}
              onChange={(e) => setSelectedDateRange(e.target.value)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border ${border} ${bgSubtle} ${textH} focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer`}
            >
              <option value="ALL">{t.allTime}</option>
              <option value="TODAY">{t.today}</option>
              <option value="7D">{t.last7Days}</option>
              <option value="30D">{t.last30Days}</option>
            </select>

            {/* Sort Toggle */}
            <button
              onClick={() => setSortOrder(s => s === "desc" ? "asc" : "desc")}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border ${border} ${bgSubtle} ${textM} hover:text-indigo-600 flex items-center gap-1.5 transition cursor-pointer`}
              title="Toggle sort order"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>{sortOrder === "desc" ? "Newest" : "Oldest"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── 4. Main Audit Logs Table ── */}
      <div className={`${bgCard} rounded-2xl border ${border} shadow-xs overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className={`text-xs uppercase ${textM} font-bold tracking-wider border-b ${border} ${bgSubtle}`}>
              <tr>
                <th className="py-3.5 px-4">{t.action}</th>
                <th className="py-3.5 px-4">{t.actor}</th>
                <th className="py-3.5 px-4">{t.target}</th>
                <th className="py-3.5 px-4">{t.details}</th>
                <th className="py-3.5 px-4">{t.status}</th>
                <th className="py-3.5 px-4">{t.timestamp}</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${border}`}>
              {loading && logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                      <p className={`text-xs ${textM}`}>Querying PostgreSQL audit ledger...</p>
                    </div>
                  </td>
                </tr>
              ) : paginatedLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                        <History className="w-6 h-6" />
                      </div>
                      <p className={`text-sm font-semibold ${textH}`}>{t.noLogs}</p>
                      <p className={`text-xs ${textM}`}>Try resetting your search filters or record a new audit event.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedLogs.map((log) => {
                  const meta = ACTION_META[log.action] || {
                    icon: History,
                    color: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
                    badge: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
                    label: log.action.replace(/_/g, " "),
                    labelKh: log.action.replace(/_/g, " "),
                  };
                  const Icon = meta.icon;
                  const logStatus = log.status || "SUCCESS";

                  return (
                    <tr
                      key={log.id}
                      className="hover:bg-indigo-500/[0.02] dark:hover:bg-indigo-500/[0.04] transition-colors group cursor-default"
                    >
                      {/* 1. Action Badge */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${meta.badge}`}>
                          <Icon className="w-3.5 h-3.5 shrink-0" />
                          <span>{isKhmer ? meta.labelKh : meta.label}</span>
                        </span>
                      </td>

                      {/* 2. Admin Actor */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white text-[11px] font-bold shrink-0 shadow-xs">
                            {(log.adminName || log.adminEmail || "A").charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className={`text-xs font-semibold ${textH} truncate max-w-[160px]`}>
                              {log.adminName || "System Admin"}
                            </p>
                            <p className={`text-[11px] ${textM} truncate max-w-[160px]`}>
                              {log.adminEmail || "admin@khmerflix.com"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* 3. Target Entity & ID */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                            log.targetType === "USER"
                              ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300"
                              : log.targetType === "CONTENT"
                              ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300"
                              : log.targetType === "SUBSCRIPTION_PLAN"
                              ? "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300"
                              : log.targetType === "NOTIFICATION"
                              ? "bg-pink-100 dark:bg-pink-900/40 text-pink-700 dark:text-pink-300"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                          }`}>
                            {log.targetType || "SYSTEM"}
                          </span>
                          {log.targetId && (
                            <div className="flex items-center gap-1 font-mono text-[10px] text-slate-400">
                              <span>{String(log.targetId).slice(0, 8)}...</span>
                              <button
                                onClick={() => handleCopy(log.targetId!)}
                                className="hover:text-indigo-600 transition"
                                title="Copy Target UUID"
                              >
                                {copiedId === log.targetId ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-2.5 h-2.5" />}
                              </button>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* 4. Details */}
                      <td className="py-3.5 px-4 max-w-[260px]">
                        <p className={`text-xs ${textH} truncate font-medium`} title={log.details || "No additional description"}>
                          {log.details || "Administrative event processed successfully."}
                        </p>
                        <p className="text-[10px] font-mono text-slate-400 flex items-center gap-1 mt-0.5">
                          <span>IP: {log.ipAddress || "127.0.0.1"}</span>
                        </p>
                      </td>

                      {/* 5. Status Pill */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          logStatus === "SUCCESS"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/60"
                            : logStatus === "WARNING"
                            ? "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/60"
                            : "bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/60"
                        }`}>
                          {logStatus === "SUCCESS" && <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />}
                          {logStatus === "WARNING" && <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0" />}
                          {logStatus === "FAILURE" && <XCircle className="w-3 h-3 text-rose-500 shrink-0" />}
                          <span>{logStatus}</span>
                        </span>
                      </td>

                      {/* 6. Timestamp */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <p className={`text-xs font-medium ${textH}`}>
                            {log.createdAt ? new Date(log.createdAt).toLocaleDateString() : "Today"}
                          </p>
                          <p className={`text-[10px] ${textM}`}>
                            {log.createdAt ? new Date(log.createdAt).toLocaleTimeString() : "Just now"}
                          </p>
                        </div>
                      </td>

                      {/* 7. Per-Row Action Buttons */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setDetailLog(log)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition cursor-pointer"
                            title="Inspect Event Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleCopy(log.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                            title="Copy Audit Event ID"
                          >
                            {copiedId === log.id ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── 5. Pagination Footer ── */}
        <div className={`p-4 border-t ${border} ${bgSubtle} flex flex-col sm:flex-row items-center justify-between gap-3 text-xs ${textM}`}>
          <div className="flex items-center gap-2">
            <span>
              {t.showing} <span className={`font-bold ${textH}`}>{filteredLogs.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}</span> {t.to}{" "}
              <span className={`font-bold ${textH}`}>{Math.min(currentPage * pageSize, filteredLogs.length)}</span> {t.of}{" "}
              <span className={`font-bold ${textH}`}>{filteredLogs.length}</span> {t.events}
            </span>

            {/* Page Size Selector */}
            <div className="flex items-center gap-1.5 ml-4">
              <span>Per page:</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className={`px-2 py-1 rounded-lg border ${border} ${bg} ${textH} text-xs font-semibold focus:outline-none`}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`p-1.5 rounded-lg border ${border} ${bg} ${textH} disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 transition`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 font-semibold">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={`p-1.5 rounded-lg border ${border} ${bg} ${textH} disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 transition`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── MODAL 1: Detail Inspector Modal ── */}
      {detailLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className={`w-full max-w-2xl rounded-2xl ${bg} border ${border} shadow-2xl overflow-hidden flex flex-col max-h-[90vh]`}>
            {/* Modal Header */}
            <div className={`p-5 border-b ${border} flex items-center justify-between`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={`text-base font-bold ${textH}`}>{t.eventDetailTitle}</h3>
                  <p className={`text-xs ${textM}`}>ID: {detailLog.id}</p>
                </div>
              </div>
              <button
                onClick={() => setDetailLog(null)}
                className={`p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1 text-xs sm:text-sm">
              {/* Top Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className={`p-3.5 rounded-xl border ${border} ${bgSubtle} space-y-1`}>
                  <p className={`text-[11px] font-semibold uppercase ${textM}`}>{t.action}</p>
                  <p className={`text-sm font-bold ${textH}`}>{detailLog.action}</p>
                </div>

                <div className={`p-3.5 rounded-xl border ${border} ${bgSubtle} space-y-1`}>
                  <p className={`text-[11px] font-semibold uppercase ${textM}`}>{t.status}</p>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    (detailLog.status || "SUCCESS") === "SUCCESS"
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                      : "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400"
                  }`}>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {detailLog.status || "SUCCESS"}
                  </span>
                </div>

                <div className={`p-3.5 rounded-xl border ${border} ${bgSubtle} space-y-1`}>
                  <p className={`text-[11px] font-semibold uppercase ${textM}`}>{t.actor}</p>
                  <p className={`text-xs font-bold ${textH}`}>{detailLog.adminName || "Admin"}</p>
                  <p className={`text-[11px] text-indigo-500`}>{detailLog.adminEmail}</p>
                </div>

                <div className={`p-3.5 rounded-xl border ${border} ${bgSubtle} space-y-1`}>
                  <p className={`text-[11px] font-semibold uppercase ${textM}`}>Client IP & Origin</p>
                  <p className={`text-xs font-mono font-bold ${textH}`}>{detailLog.ipAddress || "127.0.0.1"}</p>
                  <p className={`text-[11px] ${textM}`}>{detailLog.createdAt ? new Date(detailLog.createdAt).toLocaleString() : "Just now"}</p>
                </div>

                <div className={`p-3.5 rounded-xl border ${border} ${bgSubtle} space-y-1`}>
                  <p className={`text-[11px] font-semibold uppercase ${textM}`}>{t.target}</p>
                  <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-xs font-bold">
                    {detailLog.targetType}
                  </span>
                </div>

                <div className={`p-3.5 rounded-xl border ${border} ${bgSubtle} space-y-1`}>
                  <p className={`text-[11px] font-semibold uppercase ${textM}`}>{t.targetId}</p>
                  <div className="flex items-center justify-between font-mono text-xs">
                    <span className="truncate max-w-[180px]">{detailLog.targetId || "None"}</span>
                    {detailLog.targetId && (
                      <button
                        onClick={() => handleCopy(detailLog.targetId!)}
                        className="text-indigo-500 hover:underline text-[11px] flex items-center gap-1"
                      >
                        <Copy className="w-3 h-3" /> Copy
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Event Description */}
              <div className={`p-4 rounded-xl border ${border} ${bgSubtle} space-y-1.5`}>
                <p className={`text-[11px] font-semibold uppercase ${textM}`}>{t.details}</p>
                <p className={`text-sm ${textH} leading-relaxed`}>
                  {detailLog.details || "No additional metadata or human description attached to this log."}
                </p>
              </div>

              {/* Raw JSON Payload */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className={`text-xs font-bold ${textH} flex items-center gap-1.5`}>
                    <Code className="w-4 h-4 text-indigo-500" />
                    {t.rawJson}
                  </p>
                  <button
                    onClick={() => handleCopy(JSON.stringify(detailLog, null, 2))}
                    className="text-xs text-indigo-500 hover:underline flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" /> {t.copyId}
                  </button>
                </div>
                <pre className="p-4 rounded-xl bg-slate-950 text-slate-200 text-xs font-mono overflow-x-auto max-h-48 border border-slate-800 leading-normal">
                  {JSON.stringify(detailLog, null, 2)}
                </pre>
              </div>
            </div>

            {/* Modal Footer */}
            <div className={`p-4 border-t ${border} ${bgSubtle} flex justify-end`}>
              <button
                onClick={() => setDetailLog(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700 transition cursor-pointer"
              >
                {t.close}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 2: Record Custom Audit Log Event ── */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className={`w-full max-w-lg rounded-2xl ${bg} border ${border} shadow-2xl overflow-hidden`}>
            <div className={`p-5 border-b ${border} flex items-center justify-between`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={`text-base font-bold ${textH}`}>{t.createLogTitle}</h3>
                  <p className={`text-xs ${textM}`}>Stream dynamic administrative action to ledger</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAuditLog} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className={`text-xs font-bold ${textH}`}>{t.actionName}</label>
                <select
                  value={newAction}
                  onChange={(e) => setNewAction(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border ${border} ${bgSubtle} ${textH} text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500`}
                >
                  <option value="CONTENT_CREATED">CONTENT_CREATED</option>
                  <option value="CONTENT_UPDATED">CONTENT_UPDATED</option>
                  <option value="CONTENT_DELETED">CONTENT_DELETED</option>
                  <option value="GENRE_CREATED">GENRE_CREATED</option>
                  <option value="PLAN_CREATED">PLAN_CREATED</option>
                  <option value="USER_BANNED">USER_BANNED</option>
                  <option value="ROLE_CHANGED">ROLE_CHANGED</option>
                  <option value="BROADCAST_SENT">BROADCAST_SENT</option>
                  <option value="BACKUP_CREATED">BACKUP_CREATED</option>
                  <option value="SETTINGS_UPDATED">SETTINGS_UPDATED</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className={`text-xs font-bold ${textH}`}>{t.targetType}</label>
                  <select
                    value={newTargetType}
                    onChange={(e) => setNewTargetType(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border ${border} ${bgSubtle} ${textH} text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500`}
                  >
                    <option value="CONTENT">CONTENT</option>
                    <option value="USER">USER</option>
                    <option value="GENRE">GENRE</option>
                    <option value="SUBSCRIPTION_PLAN">SUBSCRIPTION_PLAN</option>
                    <option value="NOTIFICATION">NOTIFICATION</option>
                    <option value="REVIEW">REVIEW</option>
                    <option value="SYSTEM">SYSTEM</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className={`text-xs font-bold ${textH}`}>{t.statusSelect}</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border ${border} ${bgSubtle} ${textH} text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500`}
                  >
                    <option value="SUCCESS">SUCCESS</option>
                    <option value="WARNING">WARNING</option>
                    <option value="FAILURE">FAILURE</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className={`text-xs font-bold ${textH}`}>{t.targetIdOptional}</label>
                <input
                  type="text"
                  placeholder="e.g. b0000001-0000-0000-0000-000000000001"
                  value={newTargetId}
                  onChange={(e) => setNewTargetId(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border ${border} ${bgSubtle} ${textH} text-xs font-mono placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500`}
                />
              </div>

              <div className="space-y-1">
                <label className={`text-xs font-bold ${textH}`}>{t.detailsDesc}</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe the administrative operation performed..."
                  value={newDetails}
                  onChange={(e) => setNewDetails(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border ${border} ${bgSubtle} ${textH} text-xs placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none`}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold border ${border} ${bgSubtle} ${textM} hover:text-slate-800 dark:hover:text-white transition cursor-pointer`}
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs transition cursor-pointer flex items-center gap-1.5"
                >
                  {submitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  {t.saveLog}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 3: Clear Audit Logs Confirmation ── */}
      {showClearModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className={`w-full max-w-md rounded-2xl ${bg} border ${border} shadow-2xl p-6 space-y-4`}>
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1.5">
              <h3 className={`text-base font-bold ${textH}`}>{t.clearConfirmTitle}</h3>
              <p className={`text-xs ${textM} leading-relaxed`}>{t.clearConfirmDesc}</p>
            </div>
            <div className="flex justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowClearModal(false)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold border ${border} ${bgSubtle} ${textM} hover:text-slate-800 dark:hover:text-white transition cursor-pointer`}
              >
                {t.cancel}
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleClearAuditLogs}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-xs transition cursor-pointer flex items-center gap-1.5"
              >
                {submitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                {t.clearConfirmBtn}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
