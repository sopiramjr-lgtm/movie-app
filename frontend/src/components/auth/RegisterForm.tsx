"use client";

import React, { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { registerSchema, type RegisterInput } from "@/src/lib/validators/auth.schema";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/src/components/ui/card";
import { PasswordValidationDisplay } from "./PasswordValidationDisplay";
import { authApi } from "@/src/lib/api/endpoints";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Film, User, Mail, Lock, Eye, EyeOff, Sparkles, ArrowRight, MailCheck } from "lucide-react";
import { signIn } from "@/src/lib/auth/auth-client";

export function RegisterForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);
  const [resending, setResending] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const passwordValue = useWatch({ control, name: "password" }) || "";
  const confirmPasswordValue = useWatch({ control, name: "confirmPassword" }) || "";

  const onSubmit = async (data: RegisterInput) => {
    if (!agreeTerms) {
      toast.error("Please agree to the Terms of Service to create an account.");
      return;
    }

    try {
      await authApi.signup({
        email: data.email,
        password: data.password,
        displayName: data.name,
      });

      toast.success("Account created! Verification email dispatched to your inbox.");
      setRegisteredEmail(data.email);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Registration failed. Please try again.";
      toast.error(message);
    }
  };

  const handleResendEmail = async () => {
    if (!registeredEmail) return;
    setResending(true);
    try {
      await authApi.resendVerificationEmail(registeredEmail);
      toast.success("Verification email resent! Please check your inbox.");
    } catch {
      toast.error("Failed to resend verification email. Please try again later.");
    } finally {
      setResending(false);
    }
  };

  if (registeredEmail) {
    return (
      <Card className="w-full max-w-md mx-auto border-slate-800/80 bg-slate-900/90 shadow-2xl backdrop-blur-md">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-600/30 mb-3 animate-pulse">
            <MailCheck className="w-7 h-7" />
          </div>
          <CardTitle className="text-2xl font-extrabold text-white tracking-tight">
            Verify Your Email
          </CardTitle>
          <CardDescription className="text-xs text-slate-400">
            Activation link dispatched to your inbox
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-left space-y-2">
            <p className="text-xs text-slate-300 leading-relaxed">
              We have dispatched a verification email to:
            </p>
            <p className="font-mono text-xs text-emerald-400 font-semibold break-all bg-emerald-950/40 p-2 rounded border border-emerald-800/60">
              {registeredEmail}
            </p>
            <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
              Please check your inbox (or spam folder) and click the confirmation link to activate your CineStream streaming account before signing in.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 pt-2">
          <Button
            onClick={() => router.push("/login")}
            className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-semibold"
          >
            Continue to Sign In
          </Button>
          <Button
            variant="outline"
            onClick={handleResendEmail}
            disabled={resending}
            className="w-full border-slate-800 text-slate-300 hover:text-white text-xs"
          >
            {resending ? "Resending..." : "Resend Verification Email"}
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto border-slate-800/80 bg-slate-900/90 shadow-2xl backdrop-blur-md">
      <CardHeader className="text-center pb-4">
        {/* Brand Icon */}
        <div className="mx-auto w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center text-white shadow-lg shadow-red-600/30 mb-3">
          <Film className="w-6 h-6" />
        </div>
        <CardTitle className="text-2xl font-extrabold text-white tracking-tight flex items-center justify-center gap-2">
          Create Account
          <Sparkles className="w-4 h-4 text-amber-400" />
        </CardTitle>
        <CardDescription className="text-xs text-slate-400">
          Join CineStream to unlock unlimited streaming, watchlists, and cinema discovery
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              Full Name
            </label>
            <div className="relative">
              <Input
                placeholder="Alex Morgan"
                className="bg-slate-950/80 border-slate-800 text-white placeholder:text-slate-600 pl-3 focus:border-red-500 transition"
                {...register("name")}
              />
            </div>
            {errors.name && (
              <p className="text-xs text-red-400 mt-1 font-medium">{errors.name.message}</p>
            )}
          </div>

          {/* Email Address */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              Email Address
            </label>
            <div className="relative">
              <Input
                type="email"
                placeholder="alex@example.com"
                className="bg-slate-950/80 border-slate-800 text-white placeholder:text-slate-600 pl-3 focus:border-red-500 transition"
                {...register("email")}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-red-400 mt-1 font-medium">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              Password
            </label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Choose a strong password"
                className="bg-slate-950/80 border-slate-800 text-white placeholder:text-slate-600 pr-10 focus:border-red-500 transition"
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition focus:outline-none"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4 text-slate-400" />
                ) : (
                  <Eye className="w-4 h-4 text-slate-400" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-400 mt-1 font-medium">{errors.password.message}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              Confirm Password
            </label>
            <div className="relative">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Re-enter your password"
                className="bg-slate-950/80 border-slate-800 text-white placeholder:text-slate-600 pr-10 focus:border-red-500 transition"
                {...register("confirmPassword")}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition focus:outline-none"
                tabIndex={-1}
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-4 h-4 text-slate-400" />
                ) : (
                  <Eye className="w-4 h-4 text-slate-400" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-red-400 mt-1 font-medium">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Password Validation & Strength Display */}
          {(passwordValue.length > 0 || confirmPasswordValue.length > 0) && (
            <PasswordValidationDisplay
              password={passwordValue}
              confirmPassword={confirmPasswordValue}
              showMatchIndicator={true}
            />
          )}

          {/* Terms checkbox */}
          <div className="flex items-start gap-2 pt-1">
            <input
              type="checkbox"
              id="agreeTerms"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="mt-0.5 rounded border-slate-700 bg-slate-900 text-red-600 focus:ring-red-500 cursor-pointer"
            />
            <label htmlFor="agreeTerms" className="text-[11px] text-slate-400 leading-tight cursor-pointer">
              I agree to the{" "}
              <span className="text-slate-200 hover:underline">Terms of Service</span> and{" "}
              <span className="text-slate-200 hover:underline">Privacy Policy</span>.
            </label>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4 pt-2">
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-semibold py-2.5 shadow-lg shadow-red-600/20 transition-all flex items-center justify-center gap-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                <span>Creating Account...</span>
              </div>
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>

          {/* Social Sign up with Google */}
          <div className="w-full">
            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-slate-900 px-2 text-slate-500">Or</span>
              </div>
            </div>
            <Button
              type="button"
              onClick={() => {
                toast.info("Redirecting to Google Sign-Up...");
                const googleUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
                googleUrl.searchParams.set("client_id", "708109455187-vgoe36krm59i85p52nichteb92ps5nba.apps.googleusercontent.com");
                googleUrl.searchParams.set("redirect_uri", `${window.location.origin}/api/auth/callback/google`);
                googleUrl.searchParams.set("response_type", "code");
                googleUrl.searchParams.set("scope", "openid email profile");
                googleUrl.searchParams.set("access_type", "offline");
                googleUrl.searchParams.set("prompt", "select_account");
                window.location.href = googleUrl.toString();
              }}
              className="w-full bg-white hover:bg-slate-100 text-slate-900 font-bold py-2.5 rounded-md text-sm transition duration-200 flex items-center justify-center gap-2.5 shadow-sm cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span>Sign up with Google</span>
            </Button>
          </div>

          <p className="text-xs text-center text-slate-400">
            Already have an account?{" "}
            <Link href="/login" className="text-red-400 font-medium hover:text-red-300 hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
