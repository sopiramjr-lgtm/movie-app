import React from "react";
import { Navbar } from "@/src/components/common/Navbar";
import { Footer } from "@/src/components/layout/Footer";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-[#141414] text-zinc-900 dark:text-slate-100 transition-colors duration-300">
      <Navbar />
      <main className="flex-1 pt-20 sm:pt-24 pb-12 px-4 sm:px-8 max-w-7xl mx-auto w-full">{children}</main>
      <Footer />
    </div>
  );
}
