"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { subscriptionApi } from "@/src/lib/api/endpoints";
import { useAppSelector } from "@/src/store/hooks";
import { Button } from "@/src/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/src/components/ui/card";
import { Sparkles, Shield, Check, Zap, AlertCircle, X, RefreshCw, CheckCircle2, Clock } from "lucide-react";
import { toast } from "sonner";
import QRCode from "react-qr-code";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/src/hooks/useLanguage";
import type { SubscriptionPlanResponse, SubscriptionResponse } from "@/src/types/movie";

const DEFAULT_PLANS: SubscriptionPlanResponse[] = [
  {
    id: "plan-basic",
    name: "Basic Single-Screen",
    priceCents: 499,
    maxVideoQuality: "720p HD",
    maxConcurrentStreams: 1,
  },
  {
    id: "plan-standard",
    name: "Standard Cinema HD",
    priceCents: 999,
    maxVideoQuality: "1080p FHD",
    maxConcurrentStreams: 2,
  },
  {
    id: "plan-vip-4k",
    name: "VIP Ultra 4K Premiere",
    priceCents: 1499,
    maxVideoQuality: "4K UHD + HDR",
    maxConcurrentStreams: 4,
  },
];

type QrState = {
  qrString: string;
  subscriptionId: string;
  amount: number;
  expiresAt: Date; // exact expiry timestamp from backend
};

type ModalPhase = "scanning" | "success" | "expired";

const QR_POLL_INTERVAL_MS = 5000; // poll every 5s

function formatCountdown(secondsLeft: number): string {
  if (secondsLeft <= 0) return "00:00";
  const m = Math.floor(secondsLeft / 60);
  const s = secondsLeft % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function PricingPage() {
  const router = useRouter();
  const { lang } = useLanguage();
  const isKhmer = lang === "kh";
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const [plans, setPlans] = useState<SubscriptionPlanResponse[]>([]);
  const [mySubscriptions, setMySubscriptions] = useState<SubscriptionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscribingId, setSubscribingId] = useState<string | null>(null);

  // QR Modal state
  const [paymentQr, setPaymentQr] = useState<QrState | null>(null);
  const [modalPhase, setModalPhase] = useState<ModalPhase>("scanning");
  const [secondsLeft, setSecondsLeft] = useState(0);

  // Refs so interval callbacks always have latest state
  const paymentQrRef = useRef<QrState | null>(null);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  paymentQrRef.current = paymentQr;

  // ────────────────────────────────────────────────────────
  // Load plans on mount
  // ────────────────────────────────────────────────────────
  useEffect(() => {
    subscriptionApi
      .getPlans()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setPlans(data);
        else setPlans(DEFAULT_PLANS);
      })
      .catch(() => setPlans(DEFAULT_PLANS))
      .finally(() => setLoading(false));

    if (isAuthenticated) {
      subscriptionApi.getMySubscriptions().then(setMySubscriptions).catch(() => {});
    }
  }, [isAuthenticated]);

  // ────────────────────────────────────────────────────────
  // Cleanup intervals when modal closes
  // ────────────────────────────────────────────────────────
  const stopIntervals = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  }, []);

  const closeModal = useCallback(() => {
    stopIntervals();
    setPaymentQr(null);
    setModalPhase("scanning");
    setSecondsLeft(0);
  }, [stopIntervals]);

  // ────────────────────────────────────────────────────────
  // Start polling + countdown after QR is generated
  // ────────────────────────────────────────────────────────
  const startQrSession = useCallback(
    (qrState: QrState) => {
      stopIntervals();

      // Countdown timer — ticks every second
      const tick = () => {
        const remaining = Math.max(
          0,
          Math.floor((qrState.expiresAt.getTime() - Date.now()) / 1000)
        );
        setSecondsLeft(remaining);
        if (remaining <= 0) {
          clearInterval(countdownIntervalRef.current!);
          setModalPhase("expired");
          clearInterval(pollIntervalRef.current!);
        }
      };
      tick();
      countdownIntervalRef.current = setInterval(tick, 1000);

      // Payment status poller — checks every 5s
      const poll = async () => {
        const qr = paymentQrRef.current;
        if (!qr) return;

        // Don't poll if already expired
        if (Date.now() >= qr.expiresAt.getTime()) {
          setModalPhase("expired");
          stopIntervals();
          return;
        }

        try {
          const status = await subscriptionApi.getSubscriptionStatus(qr.subscriptionId);
          if (status.status === "ACTIVE") {
            // Payment confirmed — show success
            clearInterval(pollIntervalRef.current!);
            clearInterval(countdownIntervalRef.current!);
            setModalPhase("success");
            // Update subscriptions list
            const updated = await subscriptionApi.getMySubscriptions();
            setMySubscriptions(updated);
          }
        } catch {
          // Network hiccup — ignore, keep polling
        }
      };

      pollIntervalRef.current = setInterval(poll, QR_POLL_INTERVAL_MS);
    },
    [stopIntervals]
  );

  // Cleanup on unmount
  useEffect(() => () => stopIntervals(), [stopIntervals]);

  // ────────────────────────────────────────────────────────
  // Handlers
  // ────────────────────────────────────────────────────────
  const activeSub = mySubscriptions.find((s) => s.status === "ACTIVE");

  const handleSubscribe = async (plan: SubscriptionPlanResponse) => {
    if (!isAuthenticated) {
      toast.error("Please sign in to subscribe.");
      router.push("/login");
      return;
    }

    setSubscribingId(plan.id);
    try {
      const response = await subscriptionApi.subscribe({ planId: plan.id });

      if (response.paymentQrCode) {
        // Determine expiry: use backend qrExpiresAt or fallback to 30 min from now
        const expiresAt = response.qrExpiresAt
          ? new Date(response.qrExpiresAt)
          : new Date(Date.now() + 30 * 60 * 1000);

        const qrState: QrState = {
          qrString: response.paymentQrCode,
          subscriptionId: response.id,
          amount: plan.priceCents / 100,
          expiresAt,
        };

        setPaymentQr(qrState);
        setModalPhase("scanning");
        startQrSession(qrState);
      } else {
        toast.success("Successfully subscribed!");
        const updated = await subscriptionApi.getMySubscriptions();
        setMySubscriptions(updated);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to process subscription.";
      toast.error(msg);
    } finally {
      setSubscribingId(null);
    }
  };

  // Manual verify — for "I have Paid" button
  const handleVerifyPayment = async () => {
    if (!paymentQr) return;
    try {
      await subscriptionApi.verifyPayment(paymentQr.subscriptionId);
      stopIntervals();
      setModalPhase("success");
      const updated = await subscriptionApi.getMySubscriptions();
      setMySubscriptions(updated);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Payment not yet confirmed.";
      toast.error(msg);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8 max-w-5xl mx-auto py-12 animate-pulse">
        <div className="h-12 w-64 mx-auto rounded-lg bg-slate-900" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-96 rounded-2xl bg-slate-900 border border-slate-800" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-12 space-y-12">
      {/* Header */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full bg-red-500/10 border border-red-500/20 px-4 py-1 text-xs font-semibold text-red-600 dark:text-red-400">
          <Sparkles className="h-3.5 w-3.5" />
          <span>{isKhmer ? "កញ្ចប់សេវាទស្សនាភាពយន្ត" : "Flexible Streaming Plans"}</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {isKhmer ? "ជ្រើសរើសកញ្ចប់សេវាភាពយន្តរបស់អ្នក" : "Choose Your Cinema Plan"}
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
          {isKhmer
            ? "ទស្សនាភាពយន្ត និងរឿងភាគគ្មានដែនកំណត់ ជាមួយកម្រិតភាពច្បាស់ Ultra HD។ អាចប្តូរ ឬបោះបង់ពេលណាក៏បានដោយគ្មានកម្រៃលាក់កំបាំង។"
            : "Unlimited movies and series with ultra HD streaming. Cancel or upgrade anytime with zero hidden fees."}
        </p>
      </div>

      {/* Active Subscription Banner */}
      {activeSub && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800/50 flex items-center justify-between gap-4 max-w-2xl mx-auto shadow-xs">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <div>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">{isKhmer ? "ការជាវសកម្ម" : "Active Subscription"}</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {isKhmer ? "អ្នកកំពុងប្រើប្រាស់កញ្ចប់សេវា " : "You are currently enrolled in the "}
                <span className="text-emerald-600 dark:text-emerald-300">{activeSub.plan.name}</span>
                {isKhmer ? "។" : " plan."}
              </p>
            </div>
          </div>
          <span className="text-xs px-2.5 py-1 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700 font-semibold">
            {isKhmer ? "សកម្ម" : "Active"}
          </span>
        </div>
      )}

      {/* Plans Grid */}
      {plans.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/30 p-12 text-center max-w-md mx-auto space-y-3 shadow-xs">
          <AlertCircle className="h-8 w-8 mx-auto text-slate-400 dark:text-slate-500" />
          <h3 className="font-bold text-slate-800 dark:text-slate-200">{isKhmer ? "មិនទាន់មានកញ្ចប់សេវាត្រូវបានផ្សព្វផ្សាយទេ" : "No plans currently published"}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">{isKhmer ? "សូមពិនិត្យមើលម្តងទៀតនៅពេលក្រោយ។" : "Please check back soon or log in as admin to publish tiers."}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan, idx) => {
            const isPopular =
              idx === 1 ||
              plan.name.toLowerCase().includes("pro") ||
              plan.name.toLowerCase().includes("standard");
            const isCurrent = activeSub?.plan.id === plan.id;
            const priceDollars = (plan.priceCents / 100).toFixed(2);

            return (
              <Card
                key={plan.id}
                className={`relative flex flex-col justify-between transition-all duration-300 ${
                  isPopular
                    ? "border-red-600 bg-white dark:bg-slate-900/90 shadow-2xl shadow-red-500/10 dark:shadow-red-950/40 scale-105 z-10"
                    : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm"
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#E50914] text-white text-[11px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider shadow-md">
                    {isKhmer ? "ពេញនិយមបំផុត" : "Most Popular"}
                  </div>
                )}

                <CardHeader>
                  <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">{plan.name}</CardTitle>
                  <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                    {isKhmer ? "ចូលទស្សនាភាពយន្ត រឿងភាគ និងភាពយន្តផ្តាច់មុខគ្រប់ពេល" : "Full access to movies, originals, and series"}
                  </CardDescription>

                  <div className="pt-4 flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-slate-900 dark:text-white">${priceDollars}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{isKhmer ? "/ ខែ" : "/ month"}</span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>
                      {isKhmer ? "កម្រិតរូបភាព: " : "Video Quality: "}
                      <strong className="text-slate-900 dark:text-white">{plan.maxVideoQuality || "HD"}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>
                      {isKhmer ? "ចំនួនអេក្រង់ទស្សនាដំណាលគ្នា: " : "Concurrent Streams: "}
                      <strong className="text-slate-900 dark:text-white">{plan.maxConcurrentStreams} {isKhmer ? "អេក្រង់" : "screens"}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>{isKhmer ? "ទស្សនាគ្មានដែនកំណត់លើទូរស័ព្ទ ថេប្លេត និងទូរទស្សន៍" : "Unlimited streaming on phone, tablet, and TV"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span>{isKhmer ? "ទាញយកទុកទស្សនាដោយមិនបាច់ប្រើអ៊ីនធឺណិត" : "Download titles to watch offline"}</span>
                  </div>
                </CardContent>

                <CardFooter className="pt-4">
                  {isCurrent ? (
                    <Button
                      disabled
                      className="w-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-semibold cursor-default"
                    >
                      {isKhmer ? "កញ្ចប់សេវាបច្ចុប្បន្ន" : "Current Plan"}
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleSubscribe(plan)}
                      disabled={subscribingId === plan.id}
                      className={`w-full font-semibold flex items-center justify-center gap-2 ${
                        isPopular
                          ? "bg-[#E50914] hover:bg-red-700 text-white shadow-lg shadow-red-600/30"
                          : "bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white"
                      }`}
                    >
                      <Zap className="h-4 w-4 fill-current" />
                      {subscribingId === plan.id
                        ? (isKhmer ? "កំពុងដំណើរការ..." : "Processing...")
                        : (isKhmer ? "ជាវឥឡូវនេះ" : "Subscribe Now")}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* ── Bakong KHQR Payment Modal ── */}
      {paymentQr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl p-6 w-full max-w-sm flex flex-col items-center shadow-2xl relative overflow-hidden">
            {/* Close */}
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 text-slate-400 hover:text-white p-1 rounded-full bg-slate-800/80 hover:bg-slate-700 transition cursor-pointer z-10"
            >
              <X className="w-4 h-4" />
            </button>

            {/* ── SUCCESS phase ── */}
            {modalPhase === "success" && (
              <div className="flex flex-col items-center gap-4 py-6 text-center">
                <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center animate-bounce">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400" />
                </div>
                <h3 className="text-xl font-black text-white">Payment Confirmed!</h3>
                <p className="text-sm text-slate-400">
                  Your KhmerFlix subscription is now <span className="text-emerald-400 font-semibold">active</span>.
                  Enjoy unlimited streaming! 🎬
                </p>
                <Button
                  onClick={closeModal}
                  className="mt-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 rounded-xl cursor-pointer"
                >
                  Start Watching
                </Button>
              </div>
            )}

            {/* ── EXPIRED phase ── */}
            {modalPhase === "expired" && (
              <div className="flex flex-col items-center gap-4 py-6 text-center">
                <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center">
                  <Clock className="w-12 h-12 text-red-400" />
                </div>
                <h3 className="text-xl font-black text-white">QR Code Expired</h3>
                <p className="text-sm text-slate-400">
                  The payment window has closed. Please generate a new QR code to complete your subscription.
                </p>
                <Button
                  onClick={closeModal}
                  className="mt-2 bg-slate-700 hover:bg-slate-600 text-white font-bold px-8 rounded-xl cursor-pointer flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" /> Try Again
                </Button>
              </div>
            )}

            {/* ── SCANNING phase ── */}
            {modalPhase === "scanning" && (
              <>
                {/* Red KHQR Header */}
                <div className="w-full bg-[#E11925] text-white py-2 px-4 rounded-xl flex items-center justify-between shadow-md mb-4">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm tracking-wider">KHQR</span>
                    <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-semibold uppercase">
                      Bakong
                    </span>
                  </div>
                  <span className="text-[11px] font-medium tracking-wide">SOPHIRAM SORN</span>
                </div>

                {/* Countdown Timer */}
                <div
                  className={`flex items-center gap-2 text-sm font-bold mb-3 ${
                    secondsLeft < 120 ? "text-red-400 animate-pulse" : "text-amber-400"
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  <span>
                    Expires in <span className="font-mono text-base">{formatCountdown(secondsLeft)}</span>
                  </span>
                </div>

                {/* Merchant Details */}
                <div className="text-center mb-4">
                  <h3 className="text-lg font-bold text-white tracking-tight">KhmerFlixMovie</h3>
                  <p className="text-[11px] text-slate-400 font-mono">sorn_sophiram@bkrt</p>
                  <div className="mt-2 flex items-baseline justify-center gap-2">
                    <span className="text-2xl font-black text-white">
                      ${paymentQr.amount.toFixed(2)}{" "}
                      <span className="text-xs text-slate-400 font-normal">USD</span>
                    </span>
                    <span className="text-xs text-red-400 font-bold">
                      ≈ ៛{(paymentQr.amount * 4100).toLocaleString()} KHR
                    </span>
                  </div>
                </div>

                {/* QR Code */}
                <div className="bg-white p-4 rounded-2xl shadow-xl border-4 border-[#E11925]/20 mb-5 relative">
                  <QRCode value={paymentQr.qrString} size={200} level="M" />
                  {/* KHQR centre logo */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-9 h-9 rounded-full bg-white shadow-md border-2 border-[#E11925] flex items-center justify-center font-black text-[10px] text-[#E11925]">
                      KHQR
                    </div>
                  </div>
                </div>

                {/* Auto-polling indicator */}
                <div className="flex items-center gap-2 text-[11px] text-slate-500 mb-4">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
                  Checking payment status automatically…
                </div>

                {/* Manual confirm button */}
                <Button
                  onClick={handleVerifyPayment}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-emerald-900/30 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>I have Paid with KHQR</span>
                </Button>

                <p className="text-[10px] text-slate-400 text-center mt-3 leading-relaxed">
                  Open <strong>Bakong</strong>, <strong>ABA</strong>, <strong>ACLEDA</strong>, or any Cambodian
                  Mobile Banking app to scan &amp; pay instantly.
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
