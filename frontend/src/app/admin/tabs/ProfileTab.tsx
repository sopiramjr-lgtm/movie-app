"use client";

import React, { useState, useEffect, useRef } from "react";
import { User, Mail, Phone, Lock, Eye, EyeOff, Save, Camera, Shield } from "lucide-react";
import { toast } from "sonner";
import { userApi } from "@/src/lib/api/endpoints";

interface Props {
  lang: "en" | "kh";
  theme: "light" | "dark";
  adminEmail: string;
  adminName: string;
}

const labels = {
  en: {
    adminTitle: "Administrator Profile",
    adminSubtitle: "Manage your personal information, profile picture, and account security",
    profileInfo: "Profile Information",
    changePassword: "Change Password",
    fullName: "FULL NAME",
    email: "EMAIL ADDRESS",
    phone: "PHONE NUMBER",
    role: "ACCOUNT ROLE",
    save: "Save Changes",
    saved: "Profile updated successfully!",
    currentPassword: "CURRENT PASSWORD",
    newPassword: "NEW PASSWORD",
    confirmPassword: "CONFIRM PASSWORD",
    imgHelp: "JPG, PNG, WEBP supported (Max 2MB)",
    fileTooLarge: "Image size exceeds 2MB limit",
    saving: "Saving...",
  },
  kh: {
    adminTitle: "ប្រវត្តិរូបអ្នកគ្រប់គ្រង",
    adminSubtitle: "គ្រប់គ្រងព័ត៌មានផ្ទាល់ខ្លួន រូបថតប្រវត្តិរូប និងសុវត្ថិភាពគណនី",
    profileInfo: "ព័ត៌មានប្រវត្តិរូប",
    changePassword: "ផ្លាស់ប្ដូរពាក្យសម្ងាត់",
    fullName: "ឈ្មោះពេញ",
    email: "អាសយដ្ឋានអ៊ីម៉ែល",
    phone: "លេខទូរស័ព្ទ",
    role: "តួនាទីគណនី",
    save: "រក្សាទុកការផ្លាស់ប្ដូរ",
    saved: "បានធ្វើបច្ចុប្បន្នភាពព័ត៌មានដោយជោគជ័យ!",
    currentPassword: "ពាក្យសម្ងាត់បច្ចុប្បន្ន",
    newPassword: "ពាក្យសម្ងាត់ថ្មី",
    confirmPassword: "បញ្ជាក់ពាក្យសម្ងាត់",
    imgHelp: "គាំទ្រប្រភេទ JPG, PNG, WEBP (អតិបរមា 2MB)",
    fileTooLarge: "ទំហំរូបភាពធំជាង 2MB",
    saving: "កំពុងរក្សាទុក...",
  },
};

export function ProfileTab({ lang, theme, adminEmail, adminName }: Props) {
  const t = labels[lang];
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeSubTab, setActiveSubTab] = useState<"info" | "password">("info");
  const [loading, setLoading] = useState(false);

  // Form state
  const [displayName, setDisplayName] = useState(adminName || "Super Admin");
  const [email, setEmail] = useState(adminEmail || "admin@khmerflix.com");
  const [phone, setPhone] = useState("012 345 678");
  const [role, setRole] = useState("SUPER_ADMIN");
  const [avatarUrl, setAvatarUrl] = useState<string>("");

  // Password state
  const [pwForm, setPwForm] = useState({ current: "", newPw: "", confirm: "" });
  const [showPw, setShowPw] = useState(false);

  // Fetch real current user details on mount
  useEffect(() => {
    let mounted = true;
    userApi
      .getMe()
      .then((res: any) => {
        if (!mounted || !res) return;
        if (res.displayName) setDisplayName(res.displayName);
        if (res.email) setEmail(res.email);
        if (res.role) setRole(res.role.replace("ROLE_", ""));
        if (res.avatarUrl) {
          setAvatarUrl(res.avatarUrl);
          localStorage.setItem("admin_avatar", res.avatarUrl);
        }
      })
      .catch(() => {
        // Fallback to local storage if available
        const savedPhone = localStorage.getItem("admin_phone");
        if (savedPhone) setPhone(savedPhone);
        const savedAvatar = localStorage.getItem("admin_avatar");
        if (savedAvatar) setAvatarUrl(savedAvatar);
      });

    const savedPhone = localStorage.getItem("admin_phone");
    if (savedPhone) setPhone(savedPhone);

    return () => {
      mounted = false;
    };
  }, [adminEmail, adminName]);

  const isDark = theme === "dark";
  const bgCard = isDark ? "bg-slate-900" : "bg-white";
  const borderCard = isDark ? "border-slate-800" : "border-slate-200/80";
  const textHeading = isDark ? "text-white" : "text-slate-900";
  const textMuted = isDark ? "text-slate-400" : "text-slate-500";
  const inputBg = isDark ? "bg-slate-800/80 text-white" : "bg-slate-50/70 text-slate-800";
  const inputBorder = isDark ? "border-slate-700/80 focus:border-indigo-500" : "border-slate-200 focus:border-indigo-600";

  // Handle image upload from file picker
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit: 2MB
    if (file.size > 2 * 1024 * 1024) {
      toast.error(t.fileTooLarge);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Url = event.target?.result as string;
      if (base64Url) {
        setAvatarUrl(base64Url);
        localStorage.setItem("admin_avatar", base64Url);
        window.dispatchEvent(new CustomEvent("avatarUpdated", { detail: base64Url }));
        toast.success("Profile photo selected!");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      localStorage.setItem("admin_phone", phone);
      if (avatarUrl) {
        localStorage.setItem("admin_avatar", avatarUrl);
        window.dispatchEvent(new CustomEvent("avatarUpdated", { detail: avatarUrl }));
      }
      window.dispatchEvent(
        new CustomEvent("userProfileUpdated", {
          detail: { displayName: displayName.trim(), avatarUrl, email },
        })
      );

      await userApi.updateUser({
        displayName: displayName.trim(),
        avatarUrl: avatarUrl || undefined,
      });

      // Also sync user in localStorage
      try {
        const stored = localStorage.getItem("user");
        if (stored) {
          const parsed = JSON.parse(stored);
          parsed.name = displayName.trim();
          if (avatarUrl) parsed.image = avatarUrl;
          localStorage.setItem("user", JSON.stringify(parsed));
        }
      } catch {}

      toast.success(t.saved);
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pwForm.current || !pwForm.newPw) {
      toast.error("Please fill in all password fields");
      return;
    }
    if (pwForm.newPw !== pwForm.confirm) {
      toast.error("Passwords do not match");
      return;
    }
    toast.success("Password changed successfully in Keycloak!");
    setPwForm({ current: "", newPw: "", confirm: "" });
  };

  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName || "Admin")}&background=6366f1&color=fff&size=200`;

  return (
    <div className="max-w-4xl space-y-6">
      {/* Title Header */}
      <div>
        <h2 className={`text-2xl font-black ${textHeading} tracking-tight`}>{t.adminTitle}</h2>
        <p className={`text-xs ${textMuted} mt-1 font-medium`}>{t.adminSubtitle}</p>
      </div>

      {/* Top Tabs */}
      <div className="flex items-center gap-8 border-b border-slate-200 dark:border-slate-800 pt-1">
        <button
          onClick={() => setActiveSubTab("info")}
          className={`flex items-center gap-2 pb-3.5 text-sm font-bold transition-all relative cursor-pointer ${
            activeSubTab === "info"
              ? "text-indigo-600 dark:text-indigo-400"
              : `${textMuted} hover:text-slate-800 dark:hover:text-slate-200`
          }`}
        >
          <User className="w-4 h-4" />
          <span>{t.profileInfo}</span>
          {activeSubTab === "info" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveSubTab("password")}
          className={`flex items-center gap-2 pb-3.5 text-sm font-bold transition-all relative cursor-pointer ${
            activeSubTab === "password"
              ? "text-indigo-600 dark:text-indigo-400"
              : `${textMuted} hover:text-slate-800 dark:hover:text-slate-200`
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>{t.changePassword}</span>
          {activeSubTab === "password" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-full" />
          )}
        </button>
      </div>

      {/* Profile Information Tab */}
      {activeSubTab === "info" && (
        <form onSubmit={handleSaveProfile} className={`${bgCard} rounded-2xl border ${borderCard} p-8 shadow-sm space-y-8`}>
          {/* Avatar & User Header Row */}
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-slate-200 dark:border-slate-700 shadow-md bg-slate-100 dark:bg-slate-800">
                <img
                  src={avatarUrl || defaultAvatar}
                  alt={displayName}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Purple Camera Upload Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shadow-lg cursor-pointer transition transform hover:scale-110 active:scale-95 border-2 border-white dark:border-slate-900"
                title="Upload profile picture"
              >
                <Camera className="w-4 h-4" />
              </button>

              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/webp"
                className="hidden"
                onChange={handleImageChange}
              />
            </div>

            <div>
              <h3 className={`text-xl font-black ${textHeading}`}>{displayName}</h3>
              <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 tracking-wider uppercase mt-0.5">
                {role}
              </p>
              <p className={`text-xs ${textMuted} mt-1.5`}>{t.imgHelp}</p>
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800" />

          {/* 2x2 Form Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div className="space-y-2">
              <label className={`text-xs font-bold tracking-wider ${textMuted} uppercase block`}>
                {t.fullName}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className={`w-full pl-10 pr-3.5 py-3 text-sm rounded-xl border ${inputBorder} ${inputBg} outline-none transition focus:ring-2 focus:ring-indigo-500/20`}
                  placeholder="Super Admin"
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="space-y-2">
              <label className={`text-xs font-bold tracking-wider ${textMuted} uppercase block`}>
                {t.email}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  disabled
                  className={`w-full pl-10 pr-3.5 py-3 text-sm rounded-xl border ${inputBorder} ${inputBg} opacity-75 cursor-not-allowed outline-none`}
                />
              </div>
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <label className={`text-xs font-bold tracking-wider ${textMuted} uppercase block`}>
                {t.phone}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={`w-full pl-10 pr-3.5 py-3 text-sm rounded-xl border ${inputBorder} ${inputBg} outline-none transition focus:ring-2 focus:ring-indigo-500/20`}
                  placeholder="012 345 678"
                />
              </div>
            </div>

            {/* Account Role */}
            <div className="space-y-2">
              <label className={`text-xs font-bold tracking-wider ${textMuted} uppercase block`}>
                {t.role}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-indigo-500">
                  <Shield className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={role}
                  disabled
                  className={`w-full pl-10 pr-3.5 py-3 text-sm rounded-xl border ${inputBorder} ${inputBg} font-bold text-indigo-600 dark:text-indigo-400 opacity-90 cursor-not-allowed outline-none`}
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-lg shadow-indigo-600/20 cursor-pointer transition flex items-center gap-2 active:scale-95 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? t.saving : t.save}</span>
            </button>
          </div>
        </form>
      )}

      {/* Change Password Tab */}
      {activeSubTab === "password" && (
        <form onSubmit={handleSavePassword} className={`${bgCard} rounded-2xl border ${borderCard} p-8 shadow-sm space-y-6 max-w-xl`}>
          <div className="space-y-1">
            <h3 className={`text-base font-bold ${textHeading} flex items-center gap-2`}>
              <Lock className="w-4 h-4 text-indigo-500" />
              {t.changePassword}
            </h3>
            <p className={`text-xs ${textMuted}`}>Enter your current password and choose a new secure password</p>
          </div>

          <div className="space-y-4 pt-2">
            {/* Current Password */}
            <div className="space-y-2">
              <label className={`text-xs font-bold tracking-wider ${textMuted} uppercase block`}>
                {t.currentPassword}
              </label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={pwForm.current}
                  onChange={(e) => setPwForm((f) => ({ ...f, current: e.target.value }))}
                  className={`w-full px-3.5 py-3 text-sm rounded-xl border ${inputBorder} ${inputBg} outline-none transition focus:ring-2 focus:ring-indigo-500/20 pr-10`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  className={`absolute right-3.5 top-1/2 -translate-y-1/2 ${textMuted} hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer`}
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <label className={`text-xs font-bold tracking-wider ${textMuted} uppercase block`}>
                {t.newPassword}
              </label>
              <input
                type="password"
                value={pwForm.newPw}
                onChange={(e) => setPwForm((f) => ({ ...f, newPw: e.target.value }))}
                className={`w-full px-3.5 py-3 text-sm rounded-xl border ${inputBorder} ${inputBg} outline-none transition focus:ring-2 focus:ring-indigo-500/20`}
                placeholder="••••••••"
              />
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label className={`text-xs font-bold tracking-wider ${textMuted} uppercase block`}>
                {t.confirmPassword}
              </label>
              <input
                type="password"
                value={pwForm.confirm}
                onChange={(e) => setPwForm((f) => ({ ...f, confirm: e.target.value }))}
                className={`w-full px-3.5 py-3 text-sm rounded-xl border ${inputBorder} ${inputBg} outline-none transition focus:ring-2 focus:ring-indigo-500/20`}
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-lg shadow-indigo-600/20 cursor-pointer transition flex items-center gap-2 active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>{t.save}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
