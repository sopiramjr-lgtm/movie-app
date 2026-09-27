"use client";

import React, { useMemo } from "react";
import { Check, X, Shield, ShieldCheck, ShieldAlert } from "lucide-react";

interface PasswordValidationDisplayProps {
  password?: string;
  confirmPassword?: string;
  showMatchIndicator?: boolean;
}

interface ValidationRule {
  id: string;
  label: string;
  met: boolean;
}

export function PasswordValidationDisplay({
  password = "",
  confirmPassword,
  showMatchIndicator = false,
}: PasswordValidationDisplayProps) {
  const rules: ValidationRule[] = useMemo(() => {
    return [
      {
        id: "length",
        label: "At least 6 characters",
        met: password.length >= 6,
      },
      {
        id: "uppercase",
        label: "At least one uppercase letter (A-Z)",
        met: /[A-Z]/.test(password),
      },
      {
        id: "lowercase",
        label: "At least one lowercase letter (a-z)",
        met: /[a-z]/.test(password),
      },
      {
        id: "number",
        label: "At least one number (0-9)",
        met: /[0-9]/.test(password),
      },
      {
        id: "special",
        label: "At least one special symbol (!@#$%^&*)",
        met: /[^A-Za-z0-9]/.test(password),
      },
    ];
  }, [password]);

  const passedCount = useMemo(() => rules.filter((r) => r.met).length, [rules]);

  // Strength score: 0 to 4
  const strength = useMemo(() => {
    if (!password) return { label: "Empty", color: "bg-slate-700", textColor: "text-slate-500", level: 0 };
    if (passedCount <= 1) return { label: "Weak", color: "bg-red-500", textColor: "text-red-400", level: 1 };
    if (passedCount <= 2) return { label: "Fair", color: "bg-amber-500", textColor: "text-amber-400", level: 2 };
    if (passedCount <= 4) return { label: "Good", color: "bg-blue-500", textColor: "text-blue-400", level: 3 };
    return { label: "Strong", color: "bg-emerald-500", textColor: "text-emerald-400", level: 4 };
  }, [password, passedCount]);

  const isMatch = Boolean(
    confirmPassword !== undefined &&
      confirmPassword.length > 0 &&
      password.length > 0 &&
      password === confirmPassword
  );

  const isMismatch = Boolean(
    confirmPassword !== undefined &&
      confirmPassword.length > 0 &&
      password !== confirmPassword
  );

  if (!password && !confirmPassword) {
    return null;
  }

  return (
    <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3.5 space-y-3 transition-all">
      {/* Strength Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-400 flex items-center gap-1.5 font-medium">
            {strength.level >= 3 ? (
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            ) : strength.level >= 2 ? (
              <Shield className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
            )}
            Password Strength
          </span>
          <span className={`font-semibold ${strength.textColor}`}>{strength.label}</span>
        </div>

        <div className="grid grid-cols-4 gap-1.5 h-1.5">
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={`rounded-full transition-all duration-300 ${
                strength.level >= step ? strength.color : "bg-slate-800"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Rules Checklist */}
      <div className="space-y-1.5 pt-1">
        {rules.map((rule) => (
          <div
            key={rule.id}
            className={`flex items-center gap-2 text-xs transition-colors duration-200 ${
              rule.met ? "text-slate-200" : "text-slate-500"
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full flex items-center justify-center transition-all ${
                rule.met
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                  : "bg-slate-800/80 text-slate-500 border border-slate-700/60"
              }`}
            >
              {rule.met ? (
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              ) : (
                <X className="w-2.5 h-2.5 stroke-[2]" />
              )}
            </div>
            <span className="text-[11px] leading-tight">{rule.label}</span>
          </div>
        ))}
      </div>

      {/* Password Match Confirmation */}
      {showMatchIndicator && confirmPassword !== undefined && confirmPassword.length > 0 && (
        <div className="pt-2 border-t border-slate-800/60">
          {isMatch ? (
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <div className="w-4 h-4 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              </div>
              <span className="text-[11px]">Passwords match perfectly</span>
            </div>
          ) : isMismatch ? (
            <div className="flex items-center gap-2 text-xs text-red-400 font-medium">
              <div className="w-4 h-4 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center">
                <X className="w-2.5 h-2.5 stroke-[3]" />
              </div>
              <span className="text-[11px]">Passwords do not match yet</span>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
