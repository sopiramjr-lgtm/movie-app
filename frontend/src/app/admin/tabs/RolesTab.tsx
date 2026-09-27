"use client";

import React from "react";
import { ShieldCheck, Shield, User } from "lucide-react";

interface Props { lang: "en" | "kh"; theme: "light" | "dark"; }

const ROLES = [
  { name: "ROLE_ADMIN", description: "Full system access. Can manage all users, content, plans, settings.", icon: ShieldCheck, color: "red", permissions: ["View Dashboard", "Manage Users", "Manage Content", "Manage Plans", "Send Broadcasts", "View Audit Logs", "Manage Settings"] },
  { name: "ROLE_MODERATOR", description: "Content moderation. Can manage reviews, content, and view users.", icon: Shield, color: "blue", permissions: ["View Dashboard", "Manage Content", "Delete Reviews", "View Users"] },
  { name: "ROLE_USER", description: "Standard user. Can browse, watch, review, and manage their subscription.", icon: User, color: "green", permissions: ["Browse Content", "Watch Videos", "Submit Reviews", "Manage Watchlist", "Subscribe to Plans"] },
];

const labels = {
  en: { title: "Roles & Permissions", subtitle: "Role definitions are managed in Keycloak IAM. The roles below show the current permission structure.", permissions: "Permissions", syncedWith: "Synced with Keycloak" },
  kh: { title: "តួនាទី & សិទ្ធិ", subtitle: "តួនាទីត្រូវបានគ្រប់គ្រងក្នុង Keycloak IAM ។ ខាងក្រោមមានការបង្ហាញរចនាសម្ព័ន្ធសិទ្ធិ។", permissions: "សិទ្ធិ", syncedWith: "ធ្វើសមកាលភ័ព Keycloak" },
};

export function RolesTab({ lang, theme }: Props) {
  const t = labels[lang];
  const isDark = theme === "dark";
  const bg = isDark ? "bg-slate-900" : "bg-white";
  const textH = isDark ? "text-white" : "text-slate-800";
  const textM = isDark ? "text-slate-400" : "text-slate-500";
  const border = isDark ? "border-slate-800" : "border-slate-200";

  const colorMap: Record<string, string> = {
    red: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
    blue: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    green: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
  };
  const badgeMap: Record<string, string> = {
    red: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900",
    blue: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900",
    green: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900",
  };

  return (
    <div className="space-y-4">
      <div className={`${bg} rounded-xl border ${border} p-4 flex items-center gap-3`}>
        <ShieldCheck className="w-5 h-5 text-indigo-500 flex-shrink-0" />
        <p className={`text-sm ${textM}`}>{t.subtitle}</p>
        <span className="ml-auto text-xs font-semibold text-emerald-500 flex-shrink-0">✓ {t.syncedWith}</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {ROLES.map(role => {
          const Icon = role.icon;
          return (
            <div key={role.name} className={`${bg} rounded-xl border ${border} p-6 flex flex-col gap-4`}>
              <div className={`w-12 h-12 rounded-xl ${colorMap[role.color]} flex items-center justify-center`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <h4 className={`text-sm font-bold ${textH} font-mono`}>{role.name}</h4>
                <p className={`text-xs ${textM} mt-1`}>{role.description}</p>
              </div>
              <div>
                <p className={`text-[10px] uppercase font-bold ${textM} mb-2 tracking-wider`}>{t.permissions}</p>
                <div className="flex flex-wrap gap-1.5">
                  {role.permissions.map(p => (
                    <span key={p} className={`text-[10px] font-semibold border px-2 py-0.5 rounded-full ${badgeMap[role.color]}`}>{p}</span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
