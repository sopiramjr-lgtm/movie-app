"use client";

import React, { useSyncExternalStore } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/src/store/hooks";
import { Shield, ShieldAlert, ArrowLeft, Clapperboard } from "lucide-react";
import { Button } from "@/src/components/ui/button";

const emptySubscribe = () => () => {};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-400">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-red-500 border-r-transparent" />
      </div>
    );
  }

  const isAdmin =
    isAuthenticated &&
    user?.role &&
    (user.role.toUpperCase().includes("ADMIN") || user.role.toUpperCase() === "ROLE_ADMIN");

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
        <div className="max-w-md w-full rounded-2xl border border-red-900/50 bg-slate-900/80 p-8 text-center backdrop-blur-sm shadow-2xl">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-red-950/80 border border-red-800/80 flex items-center justify-center text-red-500 mb-5">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-sm text-slate-400 mb-6 leading-relaxed">
            The Admin Portal is restricted to platform administrators. Your current account (
            <span className="text-slate-200 font-mono text-xs">{user?.email || "Guest"}</span>) does not have administrative privileges.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              variant="outline"
              onClick={() => router.push("/")}
              className="border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Return Home
            </Button>
            <Button
              onClick={() => router.push("/login")}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold"
            >
              Sign In as Admin
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
