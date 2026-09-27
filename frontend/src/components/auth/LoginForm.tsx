"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, ArrowRight, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { authApi } from "@/src/lib/api/endpoints";
import { signIn } from "@/src/lib/auth/auth-client";
import { useAppDispatch } from "@/src/store/hooks";
import { setCredentials } from "@/src/store/slices/authSlice";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
      }
      const res = await authApi.login({
        email: data.email,
        password: data.password,
      });

      const userObj = res.user || {
        id: "current-user",
        displayName: data.email.split("@")[0],
        email: data.email,
        role: "USER",
        emailVerified: true,
        active: true,
        createdAt: new Date().toISOString(),
      };

      dispatch(
        setCredentials({
          user: {
            id: String(userObj.id),
            name: userObj.displayName || data.email.split("@")[0],
            email: userObj.email || data.email,
            role: userObj.role || "USER",
            image: userObj.avatarUrl,
            emailVerified: userObj.emailVerified ?? true,
            createdAt: userObj.createdAt || new Date().toISOString(),
          },
          token: res.accessToken,
          refreshToken: res.refreshToken,
        })
      );

      toast.success("Welcome back to KhmerFlix!");
      if (userObj.role && (userObj.role.includes("ADMIN") || userObj.role === "ROLE_ADMIN")) {
        router.push("/admin");
      } else {
        router.push("/movies");
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Invalid email or password.";
      toast.error(message);
    }
  };

  // Quick Demo account filler for testing convenience
  const fillDemoAccount = (role: "admin" | "user") => {
    if (role === "admin") {
      setValue("email", "sornsophiram11@gmail.com");
      setValue("password", "password123");
    } else {
      setValue("email", "user@movieapp.com");
      setValue("password", "password123");
    }
    toast.info(`Filled demo ${role} credentials`);
  };

  return (
    <div className="w-full max-w-md mx-auto bg-black/80 backdrop-blur-xl border border-white/10 p-8 sm:p-10 rounded-lg shadow-2xl text-white">
      <div className="mb-6">
        <h1 className="text-3xl font-black text-white tracking-tight">Sign In</h1>
        <p className="text-xs text-zinc-400 mt-1">
          Enjoy unlimited movies, series, and more.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email Field */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-zinc-400" />
            Email or username
          </label>
          <Input
            type="email"
            placeholder="name@example.com"
            autoComplete="email"
            className="bg-[#1e1e1e] border-zinc-700 text-white placeholder:text-zinc-500 focus:border-[#E50914] h-11 text-sm rounded-md"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-xs text-[#E50914] mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-zinc-400" />
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-[11px] text-zinc-400 hover:text-white hover:underline transition"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Your password"
              autoComplete="current-password"
              className="bg-[#1e1e1e] border-zinc-700 text-white placeholder:text-zinc-500 pr-10 focus:border-[#E50914] h-11 text-sm rounded-md"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition focus:outline-none"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4 text-zinc-400" />
              ) : (
                <Eye className="w-4 h-4 text-zinc-400" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-[#E50914] mt-1">{errors.password.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full bg-[#E50914] hover:bg-[#b80710] text-white font-bold py-3 rounded-md text-sm shadow-lg shadow-red-900/30 transition duration-200 mt-2"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
              <span>Signing in...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          )}
        </Button>

        {/* Remember Me */}
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="rounded border-zinc-700 bg-zinc-900 text-[#E50914] focus:ring-[#E50914] cursor-pointer"
            />
            <span>Remember me</span>
          </label>
          <span className="text-xs text-zinc-500 hover:underline cursor-pointer">
            Need help?
          </span>
        </div>

        {/* Social Login with ONLY Google */}
        <div className="pt-2">
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-800"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-black/80 px-2 text-zinc-500">Or continue with</span>
            </div>
          </div>
          <Button
            type="button"
            onClick={() => {
              toast.info("Redirecting to Google Sign-In...");
              const googleUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
              googleUrl.searchParams.set("client_id", "708109455187-vgoe36krm59i85p52nichteb92ps5nba.apps.googleusercontent.com");
              googleUrl.searchParams.set("redirect_uri", `${window.location.origin}/api/auth/callback/google`);
              googleUrl.searchParams.set("response_type", "code");
              googleUrl.searchParams.set("scope", "openid email profile");
              googleUrl.searchParams.set("access_type", "offline");
              googleUrl.searchParams.set("prompt", "select_account");
              window.location.href = googleUrl.toString();
            }}
            className="w-full bg-white hover:bg-zinc-100 text-zinc-900 font-bold py-3 rounded-md text-sm transition duration-200 flex items-center justify-center gap-2.5 shadow-sm cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span>Continue with Google</span>
          </Button>
        </div>

        {/* Sign Up Link */}
        <div className="pt-4 text-xs text-zinc-400 text-center">
          New to KhmerFlix?{" "}
          <Link
            href="/register"
            className="text-white font-semibold hover:underline"
          >
            Sign up now.
          </Link>
        </div>
      </form>
    </div>
  );
}
