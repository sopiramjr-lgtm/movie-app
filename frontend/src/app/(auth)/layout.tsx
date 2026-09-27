"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/src/components/ui/button";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#141414] text-white relative overflow-hidden">
      {/* Netflix Cinema Background Wallpaper with dark vignette */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=1600&auto=format&fit=crop&q=80"
          alt="Cinema backdrop"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center filter brightness-[0.25] scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/70 to-[#141414]/90" />
      </div>

      {/* Top Header */}
      <header className="relative z-20 max-w-7xl w-full mx-auto px-6 py-6 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <div className="relative h-9 w-36">
            <Image
              src="/logo-dark.jpg"
              alt="KhmerFlix"
              fill
              priority
              sizes="144px"
              className="object-contain object-left rounded-sm"
            />
          </div>
        </Link>

        <Link href="/">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-zinc-400 hover:text-white hover:bg-white/10 gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Home
          </Button>
        </Link>
      </header>

      {/* Center Auth Card */}
      <div className="relative z-10 w-full max-w-md mx-auto px-4 py-8 flex items-center justify-center">
        {children}
      </div>

      {/* Cinema Footer */}
      <footer className="relative z-10 py-8 text-center text-xs text-zinc-500 border-t border-white/5 bg-black/40">
        <p>&copy; {new Date().getFullYear()} KhmerFlix Inc. All rights reserved.</p>
      </footer>
    </div>
  );
}
