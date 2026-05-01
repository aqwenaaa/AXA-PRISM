"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Lock,
  Eye,
  EyeOff,
  Shield,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  ArrowRight,
  KeyRound,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

type StrengthRule = {
  label: string;
  test: (val: string) => boolean;
};

const rules: StrengthRule[] = [
  { label: "At least 8 characters", test: (v) => v.length >= 8 },
  { label: "Contains a letter (a–z / A–Z)", test: (v) => /[a-zA-Z]/.test(v) },
  { label: "Contains a number (0–9)", test: (v) => /[0-9]/.test(v) },
];

type Stage = "form" | "success";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [stage, setStage] = useState<Stage>("form");
  const [loading, setLoading] = useState(false);

  const rulesPassed = rules.map((r) => r.test(newPassword));
  const allRulesPassed = rulesPassed.every(Boolean);
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;
  const canSubmit = allRulesPassed && passwordsMatch;

  /* Input border/ring coloring */
  const newPasswordState = (): "neutral" | "good" | "bad" => {
    if (!newPassword) return "neutral";
    return allRulesPassed ? "good" : "bad";
  };

  const confirmPasswordState = (): "neutral" | "good" | "bad" => {
    if (!confirmPassword) return "neutral";
    return passwordsMatch ? "good" : "bad";
  };

  const inputClass = (state: "neutral" | "good" | "bad") => {
    const base =
      "pl-10 pr-10 h-12 rounded-xl border transition-all duration-200 w-full text-sm focus:outline-none focus:ring-2 ";
    if (state === "good")
      return base + "border-green-500 focus:ring-green-400/40 bg-green-50";
    if (state === "bad")
      return base + "border-red-400 focus:ring-red-300/40 bg-red-50";
    return base + "border-border bg-input-background focus:ring-[#8A70D6]/30";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (!canSubmit) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStage("success");
    }, 1800);
  };

  /* Auto-redirect after success */
  const [countdown, setCountdown] = useState(5);
  useEffect(() => {
    if (stage !== "success") return;
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timer);
          router.push("/login");
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [stage, router]);

  return (
    <div className="h-screen flex">
      {/* Left Side */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#8A70D6] via-[#6B4FC8] to-[#1E3A8A] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>

        {/* Floating key icons */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[
            { top: "8%", left: "12%", size: 26, delay: "0s", opacity: 0.15 },
            { top: "30%", right: "8%", size: 18, delay: "1.2s", opacity: 0.11 },
            { top: "55%", left: "6%", size: 22, delay: "2s", opacity: 0.1 },
            { bottom: "15%", right: "15%", size: 30, delay: "0.8s", opacity: 0.13 },
            { top: "70%", left: "55%", size: 16, delay: "1.6s", opacity: 0.09 },
          ].map((pos, i) => (
            <div
              key={i}
              className="absolute text-white animate-pulse"
              style={{ ...pos, animationDelay: pos.delay, animationDuration: "3s" }}
            >
              <KeyRound size={pos.size} style={{ opacity: pos.opacity }} />
            </div>
          ))}
        </div>

        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12 text-white">
          <div className="mb-8">
            <div className="relative w-56 h-56 flex items-center justify-center">
              <div className="absolute inset-0 bg-white/10 rounded-full blur-2xl animate-pulse" />
              <div className="relative w-40 h-40 bg-white/10 rounded-3xl border border-white/20 flex items-center justify-center backdrop-blur-sm">
                <KeyRound className="w-20 h-20 text-white/80" />
              </div>
            </div>
          </div>

          <h1 className="text-4xl font-bold mb-4 text-center">Create New Password</h1>
          <p className="text-lg text-white/90 text-center max-w-md mb-8">
            Your new password must meet security requirements to protect your AXA-PRISM account.
          </p>

          {/* Password rules preview */}
          <div className="w-full max-w-md space-y-3">
            {rules.map((rule, i) => (
              <div
                key={i}
                className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/20 flex items-center gap-3"
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all ${
                    rulesPassed[i] ? "bg-green-400/80" : "bg-white/20"
                  }`}
                >
                  {rulesPassed[i] ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  ) : (
                    <span className="w-1.5 h-1.5 bg-white/60 rounded-full" />
                  )}
                </div>
                <span className="text-sm text-white/80">{rule.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-xl shadow-2xl p-8 border border-border backdrop-blur-sm">

            {/* Logo */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#8A70D6] to-[#1E3A8A] flex items-center justify-center shadow-lg">
                <Shield className="w-8 h-8 text-white" />
              </div>
            </div>

            {stage === "form" ? (
              <>
                <h2 className="text-2xl font-bold text-center mb-2">Reset Password</h2>
                <p className="text-center text-muted-foreground mb-6 text-sm">
                  Create a strong new password for your AXA-PRISM account.
                </p>

                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                  {/* New Password */}
                  <div>
                    <label className="block text-sm mb-2 text-foreground font-medium">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
                      <input
                        type={showNew ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className={inputClass(newPasswordState())}
                        placeholder="Enter new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNew(!showNew)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Inline rule checklist */}
                    {newPassword.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {rules.map((rule, i) => (
                          <div key={i} className="flex items-center gap-2">
                            {rulesPassed[i] ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                            ) : (
                              <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                            )}
                            <span
                              className={`text-xs ${
                                rulesPassed[i] ? "text-green-600" : "text-red-500"
                              }`}
                            >
                              {rule.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Strength bar */}
                    {newPassword.length > 0 && (
                      <div className="mt-2">
                        <div className="flex gap-1 h-1.5">
                          {rules.map((_, i) => (
                            <div
                              key={i}
                              className={`flex-1 rounded-full transition-all duration-300 ${
                                rulesPassed[i]
                                  ? "bg-green-500"
                                  : "bg-gray-200"
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-xs mt-1 text-right">
                          {rulesPassed.filter(Boolean).length === 0 && (
                            <span className="text-red-500">Too weak</span>
                          )}
                          {rulesPassed.filter(Boolean).length === 1 && (
                            <span className="text-orange-500">Weak</span>
                          )}
                          {rulesPassed.filter(Boolean).length === 2 && (
                            <span className="text-yellow-600">Fair</span>
                          )}
                          {rulesPassed.filter(Boolean).length === 3 && (
                            <span className="text-green-600 font-semibold">Strong ✓</span>
                          )}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm mb-2 text-foreground font-medium">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
                      <input
                        type={showConfirm ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={inputClass(confirmPasswordState())}
                        placeholder="Repeat new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {confirmPassword.length > 0 && (
                      <p
                        className={`text-xs mt-1.5 flex items-center gap-1 ${
                          passwordsMatch ? "text-green-600" : "text-red-500"
                        }`}
                      >
                        {passwordsMatch ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5" />
                        )}
                        {passwordsMatch ? "Passwords match" : "Passwords do not match"}
                      </p>
                    )}
                  </div>

                  {/* Global validation error on submit */}
                  {submitted && !canSubmit && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
                      <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                      <p className="text-xs text-red-600">
                        Password must contain letters and numbers, be at least 8 characters, and both fields must match.
                      </p>
                    </div>
                  )}

                  {/* Submit button — green when valid */}
                  <Button
                    type="submit"
                    disabled={loading}
                    className={`w-full h-12 text-white rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 ${
                      canSubmit
                        ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-green-500/30"
                        : "bg-gradient-to-r from-[#8A70D6] to-[#1E3A8A] hover:opacity-90 shadow-[#8A70D6]/30"
                    }`}
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Resetting Password…</span>
                      </>
                    ) : canSubmit ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Reset Password</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>Reset Password</span>
                      </>
                    )}
                  </Button>
                </form>

                <div className="mt-6 pt-5 border-t border-border">
                  <Link
                    href="/forgot-password"
                    className="flex items-center justify-center gap-2 text-sm text-[#8A70D6] hover:text-[#1E3A8A] transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Forgot Password
                  </Link>
                </div>
              </>
            ) : (
              /* ── Success State ── */
              <div className="text-center">
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-green-100 border-2 border-green-400 flex items-center justify-center">
                      <CheckCircle2 className="w-12 h-12 text-green-500" />
                    </div>
                    {/* Ripple */}
                    <div className="absolute inset-0 rounded-full bg-green-400/20 animate-ping" />
                  </div>
                </div>

                <h2 className="text-2xl font-bold mb-2 text-green-700">Password Reset!</h2>
                <p className="text-muted-foreground text-sm mb-6">
                  Your password has been successfully updated. You can now sign in with your new password.
                </p>

                <div className="bg-[#F3F0FF] rounded-xl p-4 mb-6 text-sm text-[#8A70D6]">
                  Redirecting to Sign In in{" "}
                  <span className="font-bold">{countdown}</span>{" "}
                  second{countdown !== 1 ? "s" : ""}…
                </div>

                <Button
                  onClick={() => router.push("/login")}
                  className="w-full h-12 bg-gradient-to-r from-[#8A70D6] to-[#1E3A8A] hover:opacity-90 text-white rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <ArrowRight className="w-4 h-4" />
                  Go to Sign In Now
                </Button>
              </div>
            )}
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6">
            © 2026 AXA-PRISM. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
