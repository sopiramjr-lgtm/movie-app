"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Bell, Check, CheckCheck, Trash2, Film, CreditCard,
  Shield, Sparkles, AlertCircle, Clock, X
} from "lucide-react";
import { notificationApi } from "@/src/lib/api/endpoints";
import { useLanguage } from "@/src/hooks/useLanguage";
import { useAppSelector } from "@/src/store/hooks";
import { toast } from "sonner";
import type { NotificationResponse } from "@/src/types/movie";

interface Props {
  isLight?: boolean;
  theme?: "light" | "dark";
  variant?: "navbar" | "admin";
}

export function NotificationDropdown({ isLight = false, theme, variant = "navbar" }: Props) {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const { lang } = useLanguage();
  const isKhmer = lang === "kh";

  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const effectiveIsLight = theme ? theme === "light" : isLight;

  const loadNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const data = await notificationApi.getNotifications();
      const list = Array.isArray(data) ? data : [];
      setNotifications(list);
      const count = list.filter((n) => !(n.isRead ?? n.read)).length;
      setUnreadCount(count);
    } catch {
      // Ignore background fetch error
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadNotifications();
    // Poll unread notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, [loadNotifications]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = () => {
    const nextState = !isOpen;
    setIsOpen(nextState);
    if (nextState) {
      loadNotifications();
    }
  };

  const handleMarkAsRead = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      await notificationApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true, read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      // Ignore
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true, read: true }))
      );
      setUnreadCount(0);
      toast.success(isKhmer ? "បានសម្គាល់ថាបានអានទាំងអស់" : "All notifications marked as read");
    } catch {
      toast.error("Failed to mark all as read");
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await notificationApi.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      loadNotifications();
    } catch {
      // Ignore
    }
  };

  const formatTime = (isoString?: string) => {
    if (!isoString) return isKhmer ? "ថ្មីៗនេះ" : "Just now";
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return isKhmer ? "ថ្មីៗនេះ" : "Just now";
    if (diffMins < 60) return isKhmer ? `${diffMins} នាទីមុន` : `${diffMins}m ago`;
    if (diffHours < 24) return isKhmer ? `${diffHours} ម៉ោងមុន` : `${diffHours}h ago`;
    return isKhmer ? `${diffDays} ថ្ងៃមុន` : `${diffDays}d ago`;
  };

  const getIcon = (type?: string) => {
    switch (type) {
      case "BILLING":
        return <CreditCard className="w-4 h-4 text-emerald-500" />;
      case "CONTENT":
        return <Film className="w-4 h-4 text-purple-500" />;
      case "SECURITY":
        return <Shield className="w-4 h-4 text-rose-500" />;
      default:
        return <Sparkles className="w-4 h-4 text-amber-500" />;
    }
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* ── Trigger Bell Button ── */}
      <button
        onClick={handleToggle}
        className={`relative w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200 cursor-pointer ${
          effectiveIsLight
            ? "text-slate-700 hover:text-black hover:bg-slate-100"
            : "text-zinc-300 hover:text-white hover:bg-white/10"
        }`}
        aria-label="Notifications"
        title={isKhmer ? "ការជូនដំណឹង" : "Notifications"}
      >
        <Bell className="w-[18px] h-[18px]" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center min-w-[14px] h-[14px] px-1 text-[9px] font-black rounded-full bg-red-600 text-white shadow-xs ring-1 ring-white dark:ring-black animate-in zoom-in-75">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* ── Dropdown Popover ── */}
      {isOpen && (
        <div
          className={`absolute right-0 mt-2.5 w-80 sm:w-96 rounded-2xl shadow-2xl overflow-hidden z-50 border backdrop-blur-2xl transition-all animate-in fade-in zoom-in-95 slide-in-from-top-1 duration-150 ${
            effectiveIsLight
              ? "bg-white/95 border-slate-200 text-slate-800 shadow-slate-900/15"
              : "bg-[#0f0f0f]/95 border-white/[0.08] text-white shadow-black/80"
          }`}
        >
          {/* Header */}
          <div
            className={`px-4 py-3 flex items-center justify-between border-b ${
              effectiveIsLight ? "border-slate-100 bg-slate-50/70" : "border-white/[0.06] bg-white/[0.02]"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold ${effectiveIsLight ? "text-slate-900" : "text-white"}`}>
                {isKhmer ? "ការជូនដំណឹង" : "Notifications"}
              </span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30">
                  {unreadCount} {isKhmer ? "មិនទាន់អាន" : "new"}
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>{isKhmer ? "សម្គាល់ថាបានអាន" : "Mark all read"}</span>
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-100 dark:divide-white/[0.04]">
            {notifications.length === 0 ? (
              <div className="py-12 px-4 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center mx-auto text-slate-400">
                  <Bell className="w-5 h-5 opacity-40" />
                </div>
                <p className={`text-xs font-semibold ${effectiveIsLight ? "text-slate-700" : "text-zinc-300"}`}>
                  {isKhmer ? "មិនមានការជូនដំណឹងថ្មីទេ" : "No notifications yet"}
                </p>
                <p className="text-[11px] text-slate-400 max-w-[200px] mx-auto">
                  {isKhmer
                    ? "អ្នកនឹងទទួលបានការជូនដំណឹងអំពីភាពយន្តថ្មីៗ និងគណនីរបស់អ្នកនៅទីនេះ"
                    : "You will receive updates on new releases, billing, and account activity here."}
                </p>
              </div>
            ) : (
              notifications.map((item) => {
                const isRead = item.isRead ?? item.read;

                return (
                  <div
                    key={item.id}
                    onClick={() => !isRead && handleMarkAsRead(item.id)}
                    className={`relative p-3.5 flex items-start gap-3 transition-colors cursor-pointer group ${
                      !isRead
                        ? effectiveIsLight
                          ? "bg-indigo-50/50 hover:bg-indigo-50"
                          : "bg-indigo-950/20 hover:bg-indigo-950/30"
                        : effectiveIsLight
                        ? "hover:bg-slate-50"
                        : "hover:bg-white/[0.03]"
                    }`}
                  >
                    {/* Category Icon */}
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        effectiveIsLight ? "bg-slate-100" : "bg-zinc-800"
                      }`}
                    >
                      {getIcon(item.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="flex items-center gap-1.5">
                        <p
                          className={`text-xs font-bold truncate ${
                            !isRead
                              ? effectiveIsLight
                                ? "text-indigo-950 font-extrabold"
                                : "text-white font-extrabold"
                              : effectiveIsLight
                              ? "text-slate-800"
                              : "text-zinc-300"
                          }`}
                        >
                          {item.title}
                        </p>
                        {!isRead && (
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                        )}
                      </div>
                      <p
                        className={`text-[11px] line-clamp-2 mt-0.5 leading-relaxed ${
                          effectiveIsLight ? "text-slate-600" : "text-zinc-400"
                        }`}
                      >
                        {item.message}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          {formatTime(item.createdAt)}
                        </span>
                        <span className="capitalize px-1.5 py-0.2 rounded bg-slate-100 dark:bg-zinc-800 text-[9px] font-semibold">
                          {item.type || "System"}
                        </span>
                      </div>
                    </div>

                    {/* Delete button on hover */}
                    <button
                      onClick={(e) => handleDelete(item.id, e)}
                      className="absolute top-3 right-3 p-1 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition"
                      title="Dismiss"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
