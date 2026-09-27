"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/src/store/hooks";
import { setActiveProfile, setCredentials, logout } from "@/src/store/slices/authSlice";
import { userApi, profileApi, notificationApi } from "@/src/lib/api/endpoints";
import { useLanguage } from "@/src/hooks/useLanguage";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import {
  User as UserIcon,
  Mail,
  Shield,
  ShieldCheck,
  Zap,
  Users,
  Plus,
  Trash2,
  Bell,
  CheckCircle2,
  Sparkles,
  Camera,
  Check,
  Calendar,
  Lock,
  ArrowRight,
  Bookmark,
  Tv,
  X,
  Smile,
  Baby,
} from "lucide-react";
import { toast } from "sonner";
import type { UserSummaryResponse, ProfileResponse } from "@/src/types/user";

// Profile color gradient presets (Netflix style)
const PROFILE_GRADIENTS = [
  "from-red-600 to-rose-800",
  "from-blue-600 to-indigo-800",
  "from-emerald-600 to-teal-800",
  "from-amber-500 to-orange-700",
  "from-purple-600 to-violet-800",
  "from-cyan-500 to-blue-700",
];

const labels = {
  en: {
    editPhoto: "Edit Photo",
    member: "Member",
    admin: "Administrator",
    vipPass: "VIP Pass",
    joinedIn: "Joined in",
    oauthProtected: "Keycloak OAuth Protected",
    myList: "My List",
    changePlan: "Change Plan",
    upgradePlan: "Upgrade Plan",
    streamingSub: "Streaming Subscription",
    active: "Active",
    freeAccess: "Free Single-Screen Access",
    unlimited4k: "Enjoy unlimited 4K Ultra HD streaming with multi-screen support.",
    upgradeToUnlock: "Upgrade to unlock 4K Ultra HD, multiple streams, and offline downloads.",
    manageSub: "Manage Subscription",
    explorePlans: "Explore Plans",
    viewingProfiles: "Viewing Profiles",
    viewingProfilesDesc: "Switch or create sub-profiles for personalized recommendations",
    addProfile: "Add Profile",
    createNewProfile: "Create New Profile",
    profileName: "Profile Name",
    profilePlaceholder: "e.g. Alex, Mom, Family",
    kidsProfile: "Kids Profile",
    kidsProfileDesc: "Only shows titles rated suitable for children under 12",
    cancel: "Cancel",
    saveProfile: "Save Profile",
    creating: "Creating...",
    watching: "Watching",
    kidsMode: "Kids Mode",
    switchText: "Switch",
    accountInfo: "Account Information",
    accountInfoDesc: "Personal identity, registered email, and authentication details",
    displayName: "Display Name",
    save: "Save",
    saving: "Saving...",
    emailAddress: "Email Address",
    verified: "Verified",
    accountRole: "Account Role",
    notifications: "Notifications",
    unread: "unread",
    allCaughtUp: "All caught up",
    signOutSession: "Sign Out of Session",
    signOutDesc: "Clear your active session and return to the login screen",
    signOut: "Sign Out",
  },
  kh: {
    editPhoto: "ប្តូររូបថត",
    member: "សមាជិក",
    admin: "អ្នកគ្រប់គ្រង",
    vipPass: "សំបុត្រ VIP",
    joinedIn: "បានចូលរួមក្នុងឆ្នាំ",
    oauthProtected: "ការពារដោយ Keycloak OAuth",
    myList: "បញ្ជីរបស់ខ្ញុំ",
    changePlan: "ប្តូរកញ្ចប់សេវា",
    upgradePlan: "ដំឡើងកញ្ចប់",
    streamingSub: "ការជាវទស្សនាភាពយន្ត",
    active: "សកម្ម",
    freeAccess: "ការទស្សនាឥតគិតថ្លៃ ១ អេក្រង់",
    unlimited4k: "រីករាយទស្សនា 4K Ultra HD គ្មានដែនកំណត់ ជាមួយការទស្សនាលើអេក្រង់ច្រើន។",
    upgradeToUnlock: "ដំឡើងកញ្ចប់ដើម្បីទទួលបានកម្រិត 4K Ultra HD, អេក្រង់ច្រើន និងទាញយកទស្សនា។",
    manageSub: "គ្រប់គ្រងការជាវ",
    explorePlans: "ស្វែងយល់កញ្ចប់សេវា",
    viewingProfiles: "កម្រងព័ត៌មានទស្សនា",
    viewingProfilesDesc: "ប្តូរ ឬបង្កើតកម្រងព័ត៌មានរងសម្រាប់ទទួលបានការណែនាំភាពយន្តផ្ទាល់ខ្លួន",
    addProfile: "បន្ថែមប្រវត្តិរូប",
    createNewProfile: "បង្កើតកម្រងព័ត៌មានថ្មី",
    profileName: "ឈ្មោះកម្រងព័ត៌មាន",
    profilePlaceholder: "ឧ. ពិសិដ្ឋ, ម៉ាក់, ក្រុមគ្រួសារ",
    kidsProfile: "កម្រងព័ត៌មានកុមារ",
    kidsProfileDesc: "បង្ហាញតែភាពយន្ត និងរឿងភាគដែលស័ក្តិសមសម្រាប់កុមារក្រោម ១២ ឆ្នាំប៉ុណ្ណោះ",
    cancel: "បោះបង់",
    saveProfile: "រក្សាទុកប្រវត្តិរូប",
    creating: "កំពុងបង្កើត...",
    watching: "កំពុងទស្សនា",
    kidsMode: "ទម្រង់កុមារ",
    switchText: "ប្តូរ",
    accountInfo: "ព័ត៌មានគណនី",
    accountInfoDesc: "អត្តសញ្ញាណផ្ទាល់ខ្លួន អ៊ីមែលដែលបានចុះឈ្មោះ និងព័ត៌មានសុវត្ថិភាព",
    displayName: "ឈ្មោះបង្ហាញ",
    save: "រក្សាទុក",
    saving: "កំពុងរក្សាទុក...",
    emailAddress: "អាសយដ្ឋានអ៊ីមែល",
    verified: "បានផ្ទៀងផ្ទាត់",
    accountRole: "តួនាទីគណនី",
    notifications: "ការជូនដំណឹង",
    unread: "មិនទាន់អាន",
    allCaughtUp: "បានអានទាំងអស់",
    signOutSession: "ចាកចេញពីសម័យប្រជុំ",
    signOutDesc: "សម្អាតសម័យប្រជុំសកម្មរបស់អ្នក និងត្រឡប់ទៅកាន់ទំព័រចូលគណនី",
    signOut: "ចាកចេញ",
  },
};

export default function ProfilePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, activeProfileId, isAuthenticated } = useAppSelector((state) => state.auth);
  const theme = useAppSelector((state) => state.ui.theme);
  const { lang } = useLanguage();
  const t = labels[lang] || labels.en;

  const [summary, setSummary] = useState<UserSummaryResponse | null>(null);
  const [profiles, setProfiles] = useState<ProfileResponse[]>([]);
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const [loading, setLoading] = useState(true);

  // Edit Name & Avatar
  const [displayName, setDisplayName] = useState("");
  const [userAvatar, setUserAvatar] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Create Profile modal
  const [showCreateProfile, setShowCreateProfile] = useState(false);
  const [newProfileName, setNewProfileName] = useState("");
  const [isKidsProfile, setIsKidsProfile] = useState(false);
  const [creatingProfile, setCreatingProfile] = useState(false);

  const loadData = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    try {
      const [sumData, profData] = await Promise.all([
        userApi.getMySummary(),
        profileApi.getProfiles(),
      ]);
      setSummary(sumData);
      setProfiles(profData);
      setDisplayName(sumData.user.displayName || "");
      if (sumData.user.avatarUrl) {
        setUserAvatar(sumData.user.avatarUrl);
      }
      if (profData.length > 0 && !activeProfileId) {
        dispatch(setActiveProfile(profData[0].id));
      }
      // Dynamic unread notifications count
      try {
        const notifData = await notificationApi.getNotifications();
        if (Array.isArray(notifData)) {
          const unread = notifData.filter((n) => !(n.isRead ?? n.read)).length;
          setUnreadNotifs(unread);
        }
      } catch {
        setUnreadNotifs(sumData.unreadNotificationsCount || 0);
      }
    } catch {
      // Ignore load error
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, activeProfileId, dispatch]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error(lang === "kh" ? "ទំហំរូបភាពលើសពីកម្រិតកំណត់ 2MB" : "Image size exceeds 2MB limit");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Url = event.target?.result as string;
      if (base64Url) {
        setUserAvatar(base64Url);
        try {
          await userApi.updateUser({ displayName, avatarUrl: base64Url });
          if (user) {
            dispatch(setCredentials({ user: { ...user, image: base64Url } }));
          }
          toast.success(lang === "kh" ? "រូបភាពគណនីត្រូវបានធ្វើបច្ចុប្បន្នភាព!" : "Profile photo updated successfully!");
        } catch {
          toast.error(lang === "kh" ? "មិនអាចធ្វើបច្ចុប្បន្នភាពរូបភាពបានទេ" : "Failed to update profile photo");
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) return;
    setIsUpdating(true);
    try {
      const updated = await userApi.updateUser({
        displayName: displayName.trim(),
        avatarUrl: userAvatar || undefined,
      });
      if (user) {
        dispatch(
          setCredentials({
            user: { ...user, name: updated.displayName, image: updated.avatarUrl || userAvatar },
          })
        );
      }
      toast.success(lang === "kh" ? "ឈ្មោះត្រូវបានកែប្រែដោយជោគជ័យ!" : "Display name updated!");
    } catch {
      toast.error(lang === "kh" ? "មិនអាចកែប្រែឈ្មោះបានទេ" : "Failed to update profile");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProfileName.trim()) return;
    setCreatingProfile(true);
    try {
      const created = await profileApi.createProfile({
        name: newProfileName.trim(),
        isKids: isKidsProfile,
      });
      toast.success(lang === "kh" ? `ប្រវត្តិរូប "${created.name}" ត្រូវបានបង្កើត!` : `Profile "${created.name}" created!`);
      setNewProfileName("");
      setIsKidsProfile(false);
      setShowCreateProfile(false);
      await loadData();
      dispatch(setActiveProfile(created.id));
    } catch {
      toast.error(lang === "kh" ? "មិនអាចបង្កើតប្រវត្តិរូបបានទេ" : "Failed to create profile.");
    } finally {
      setCreatingProfile(false);
    }
  };

  const handleDeleteProfile = async (profId: string) => {
    try {
      await profileApi.deleteProfile(profId);
      toast.success(lang === "kh" ? "ប្រវត្តិរូបត្រូវបានលុប" : "Profile removed");
      await loadData();
    } catch {
      toast.error(lang === "kh" ? "មិនអាចលុបប្រវត្តិរូបបានទេ" : "Failed to remove profile");
    }
  };

  const isAdmin =
    user?.role &&
    (user.role.toUpperCase().includes("ADMIN") || user.role.toUpperCase() === "ROLE_ADMIN");

  const memberSinceYear = summary?.user?.createdAt
    ? new Date(summary.user.createdAt).getFullYear()
    : new Date().getFullYear();

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-10 px-4 space-y-8 animate-pulse">
        <div className="h-44 rounded-3xl bg-slate-200 dark:bg-zinc-900/60 border border-slate-300 dark:border-white/5" />
        <div className="h-28 rounded-2xl bg-slate-200 dark:bg-zinc-900/60 border border-slate-300 dark:border-white/5" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-56 rounded-2xl bg-slate-200 dark:bg-zinc-900/60 border border-slate-300 dark:border-white/5 col-span-2" />
          <div className="h-56 rounded-2xl bg-slate-200 dark:bg-zinc-900/60 border border-slate-300 dark:border-white/5" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-10">

      {/* ── 1. HERO PROFILE BANNER (Light & Dark Adaptive) ── */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-gradient-to-b dark:from-zinc-900/90 dark:via-zinc-950/80 dark:to-black p-6 sm:p-8 shadow-xl dark:shadow-2xl backdrop-blur-xl transition-colors duration-300">
        {/* Ambient Top Glow */}
        <div className="absolute -top-24 left-1/4 w-96 h-48 bg-red-600/10 dark:bg-red-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-24 right-1/4 w-96 h-48 bg-purple-600/10 dark:bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8">
          {/* Avatar Picture with Interactive Camera Badge */}
          <div className="relative group shrink-0">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden ring-4 ring-slate-100 dark:ring-white/[0.08] shadow-2xl bg-slate-100 dark:bg-zinc-900 relative transition-transform duration-300 group-hover:scale-[1.02]">
              <img
                src={
                  userAvatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    displayName || user?.name || "User"
                  )}&background=e50914&color=fff&size=200&bold=true`
                }
                alt={displayName || "User Avatar"}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/60 backdrop-blur-xs opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity duration-200 cursor-pointer"
                title={t.editPhoto}
              >
                <Camera className="w-6 h-6 mb-1 text-white" />
                <span className="text-[10px] font-bold tracking-wide uppercase">{t.editPhoto}</span>
              </button>
            </div>

            {/* Quick Upload Indicator Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1.5 -right-1.5 w-8 h-8 rounded-full bg-[#E50914] hover:bg-red-700 text-white flex items-center justify-center shadow-lg cursor-pointer ring-2 ring-white dark:ring-zinc-950 transition transform hover:scale-110 active:scale-95"
              title={t.editPhoto}
            >
              <Camera className="w-4 h-4" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png, image/jpeg, image/webp"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>

          {/* User Details & Identity */}
          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {displayName || user?.name || "KhmerFlix Viewer"}
              </h1>

              {/* Status / Role Chips */}
              {isAdmin ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-500/15 border border-red-500/30 text-red-600 dark:text-red-400 text-[11px] font-bold tracking-wider uppercase">
                  <Shield className="w-3 h-3" /> {t.admin}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-[11px] font-semibold border border-slate-200 dark:border-white/5">
                  <UserIcon className="w-3 h-3" /> {t.member}
                </span>
              )}

              {summary?.hasActiveSubscription && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-[11px] font-bold tracking-wider uppercase">
                  <Sparkles className="w-3 h-3" /> {t.vipPass}
                </span>
              )}
            </div>

            <p className="text-sm text-slate-500 dark:text-zinc-400 font-mono">{user?.email || "viewer@khmerflix.com"}</p>

            <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-500 dark:text-zinc-400">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
                {t.joinedIn} {memberSinceYear}
              </span>
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
                {t.oauthProtected}
              </span>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="flex sm:flex-col gap-2 shrink-0">
            <Link href="/watchlist">
              <Button
                variant="outline"
                size="sm"
                className="w-full bg-slate-50 hover:bg-slate-100 dark:bg-zinc-900/80 border-slate-200 dark:border-white/10 text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white text-xs gap-1.5"
              >
                <Bookmark className="w-3.5 h-3.5" />
                {t.myList}
              </Button>
            </Link>
            <Link href="/pricing">
              <Button
                size="sm"
                className="w-full bg-[#E50914] hover:bg-red-700 text-white font-bold text-xs gap-1.5 shadow-md shadow-red-600/30"
              >
                <Zap className="w-3.5 h-3.5" />
                {summary?.hasActiveSubscription ? t.changePlan : t.upgradePlan}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* ── 2. STREAMING SUBSCRIPTION PASS (Light & Dark Adaptive) ── */}
      <div className="relative rounded-2xl overflow-hidden border border-red-200 dark:border-red-500/20 bg-gradient-to-r from-red-50/80 via-white to-slate-50 dark:from-red-950/30 dark:via-zinc-900/60 dark:to-zinc-950/80 p-5 sm:p-6 backdrop-blur-xl shadow-md dark:shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5 transition-colors duration-300">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center text-white shadow-lg shadow-red-600/20 shrink-0">
            <Tv className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
                {t.streamingSub}
              </span>
              {summary?.hasActiveSubscription && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                  {t.active}
                </span>
              )}
            </div>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
              {summary?.hasActiveSubscription
                ? summary.activePlanName
                : t.freeAccess}
            </h3>
            <p className="text-xs text-slate-600 dark:text-zinc-400">
              {summary?.hasActiveSubscription
                ? t.unlimited4k
                : t.upgradeToUnlock}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <Link href="/pricing" className="w-full md:w-auto">
            <Button
              className="w-full md:w-auto bg-slate-900 hover:bg-slate-800 text-white dark:bg-white/10 dark:hover:bg-white/20 dark:text-white font-semibold text-xs border border-slate-700 dark:border-white/10 gap-1.5 rounded-xl h-10 px-5 shadow-xs"
            >
              <span>{summary?.hasActiveSubscription ? t.manageSub : t.explorePlans}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* ── 3. VIEWING PROFILES (Light & Dark Adaptive with Khmer) ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-[#E50914]" />
              {t.viewingProfiles}
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              {t.viewingProfilesDesc}
            </p>
          </div>

          <Button
            size="sm"
            onClick={() => setShowCreateProfile((v) => !v)}
            className="bg-slate-900 hover:bg-slate-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-white text-xs font-semibold rounded-xl gap-1.5 border border-slate-700 dark:border-white/10 shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            {t.addProfile}
          </Button>
        </div>

        {/* Inline Create Profile Form */}
        {showCreateProfile && (
          <form
            onSubmit={handleCreateProfile}
            className="p-5 rounded-2xl bg-white dark:bg-zinc-900/90 border border-slate-200 dark:border-white/10 space-y-4 shadow-lg animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/5">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Smile className="w-4 h-4 text-[#E50914]" />
                {t.createNewProfile}
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateProfile(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-zinc-400">{t.profileName}</label>
              <Input
                placeholder={t.profilePlaceholder}
                value={newProfileName}
                onChange={(e) => setNewProfileName(e.target.value)}
                className="bg-slate-50 dark:bg-black/60 border-slate-300 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-600 focus:border-red-500"
                autoFocus
              />
            </div>

            {/* Kids Toggle */}
            <label className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/5 cursor-pointer hover:border-slate-300 dark:hover:border-white/10 transition">
              <input
                type="checkbox"
                checked={isKidsProfile}
                onChange={(e) => setIsKidsProfile(e.target.checked)}
                className="w-4 h-4 rounded text-red-600 focus:ring-red-500 bg-white dark:bg-zinc-800 border-slate-300 dark:border-zinc-700"
              />
              <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-zinc-300">
                <Baby className="w-4 h-4 text-cyan-500" />
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">{t.kidsProfile}</p>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-500">
                    {t.kidsProfileDesc}
                  </p>
                </div>
              </div>
            </label>

            <div className="flex justify-end gap-2.5 pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowCreateProfile(false)}
                className="text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white"
              >
                {t.cancel}
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={creatingProfile || !newProfileName.trim()}
                className="bg-[#E50914] hover:bg-red-700 text-white font-bold px-5"
              >
                {creatingProfile ? t.creating : t.saveProfile}
              </Button>
            </div>
          </form>
        )}

        {/* Profile Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {profiles.map((p, idx) => {
            const isActive = activeProfileId === p.id;
            const gradient = PROFILE_GRADIENTS[idx % PROFILE_GRADIENTS.length];

            return (
              <div
                key={p.id}
                onClick={() => dispatch(setActiveProfile(p.id))}
                className={`group relative p-4 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col items-center text-center ${
                  isActive
                    ? "bg-red-50/80 dark:bg-gradient-to-b dark:from-red-950/40 dark:to-zinc-900/80 border-red-300 dark:border-red-500/50 shadow-md dark:shadow-xl dark:shadow-red-950/40 ring-2 ring-red-500/30 scale-[1.02]"
                    : "bg-white hover:bg-slate-50 dark:bg-zinc-900/40 dark:hover:bg-zinc-800/60 border-slate-200 dark:border-white/[0.06] hover:border-slate-300 dark:hover:border-white/20 shadow-xs"
                }`}
              >
                {/* Avatar Icon */}
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center font-black text-xl text-white shadow-lg mb-3 transition-transform duration-300 group-hover:scale-105 relative`}
                >
                  {p.isKids ? (
                    <Baby className="w-7 h-7 text-white" />
                  ) : (
                    p.name.charAt(0).toUpperCase()
                  )}
                  {isActive && (
                    <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-black flex items-center justify-center shadow-md ring-2 ring-white dark:ring-zinc-950">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  )}
                </div>

                <span className="font-bold text-sm text-slate-900 dark:text-white truncate max-w-full">
                  {p.name}
                </span>

                {p.isKids ? (
                  <span className="mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-500/30">
                    {t.kidsMode}
                  </span>
                ) : isActive ? (
                  <span className="mt-1 text-[10px] font-bold text-red-600 dark:text-red-400 flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" /> {t.watching}
                  </span>
                ) : (
                  <span className="mt-1 text-[10px] text-slate-400 dark:text-zinc-500 group-hover:text-slate-700 dark:group-hover:text-zinc-400 transition">
                    {t.switchText}
                  </span>
                )}

                {/* Delete button (only if > 1 profile) */}
                {profiles.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteProfile(p.id);
                    }}
                    className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200"
                    title="Delete profile"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}

          {/* "+ Add Profile" slot card */}
          {!showCreateProfile && (
            <button
              onClick={() => setShowCreateProfile(true)}
              className="p-4 rounded-2xl border-2 border-dashed border-slate-300 dark:border-white/10 hover:border-red-500/50 hover:bg-red-500/[0.04] bg-slate-50/50 dark:bg-transparent transition-all duration-300 flex flex-col items-center justify-center text-center cursor-pointer group min-h-[140px]"
            >
              <div className="w-12 h-12 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-transparent group-hover:bg-red-50 dark:group-hover:bg-red-600/20 text-slate-400 dark:text-zinc-400 group-hover:text-red-600 dark:group-hover:text-red-400 flex items-center justify-center transition-colors mb-2 shadow-xs">
                <Plus className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold text-slate-600 dark:text-zinc-400 group-hover:text-slate-900 dark:group-hover:text-white transition">
                {t.addProfile}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* ── 4. ACCOUNT INFORMATION & SETTINGS (Light & Dark Adaptive) ── */}
      <div className="rounded-3xl border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900/40 backdrop-blur-xl p-6 sm:p-8 space-y-6 shadow-md dark:shadow-none transition-colors duration-300">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-[#E50914]" />
            {t.accountInfo}
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            {t.accountInfoDesc}
          </p>
        </div>

        {/* Display Name Edit Form */}
        <form onSubmit={handleUpdateName} className="space-y-2">
          <label className="text-xs font-semibold text-slate-700 dark:text-zinc-400">{t.displayName}</label>
          <div className="flex gap-3 max-w-md">
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your Name"
              className="bg-slate-50 dark:bg-black/60 border-slate-300 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-zinc-600 focus:border-red-500 h-10"
            />
            <Button
              type="submit"
              disabled={isUpdating || !displayName.trim()}
              className="bg-[#E50914] hover:bg-red-700 text-white font-bold h-10 px-5 shrink-0"
            >
              {isUpdating ? t.saving : t.save}
            </Button>
          </div>
        </form>

        {/* Account Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {/* Email */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/[0.06] space-y-1">
            <div className="flex items-center gap-2 text-slate-500 dark:text-zinc-400 text-xs">
              <Mail className="w-4 h-4 text-slate-400 dark:text-zinc-400" />
              <span>{t.emailAddress}</span>
            </div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate font-mono">
              {user?.email || "viewer@khmerflix.com"}
            </p>
            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
              <CheckCircle2 className="w-3 h-3" /> {t.verified}
            </span>
          </div>

          {/* Account Role */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/[0.06] space-y-1">
            <div className="flex items-center gap-2 text-slate-500 dark:text-zinc-400 text-xs">
              <ShieldCheck className="w-4 h-4 text-red-500 dark:text-red-400" />
              <span>{t.accountRole}</span>
            </div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white capitalize">
              {user?.role ? user.role.replace("ROLE_", "").toLowerCase() : "Viewer"}
            </p>
            <span className="text-[10px] text-slate-400 dark:text-zinc-500">Keycloak RBAC</span>
          </div>

          {/* Dynamic Notifications */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/[0.06] space-y-1">
            <div className="flex items-center gap-2 text-slate-500 dark:text-zinc-400 text-xs">
              <Bell className="w-4 h-4 text-amber-500 dark:text-amber-400" />
              <span>{t.notifications}</span>
            </div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              {unreadNotifs > 0 ? `${unreadNotifs} ${t.unread}` : t.allCaughtUp}
            </p>
            <span className="text-[10px] text-slate-400 dark:text-zinc-500">
              {unreadNotifs > 0 ? "Check bell icon above" : "System & billing alerts"}
            </span>
          </div>
        </div>

        {/* Sign Out Action */}
        <div className="pt-4 border-t border-slate-200 dark:border-white/[0.06] flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-800 dark:text-zinc-300">{t.signOutSession}</p>
            <p className="text-[11px] text-slate-500 dark:text-zinc-500">
              {t.signOutDesc}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => dispatch(logout())}
            className="border-red-300 dark:border-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 text-xs font-semibold rounded-xl"
          >
            {t.signOut}
          </Button>
        </div>
      </div>

    </div>
  );
}
