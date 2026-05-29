import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowRight, Shield, ArrowLeft, CheckCircle2, Send } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { supabase } from "../../lib/api/supabase-client";

type Stage = "input" | "sent";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [stage, setStage] = useState<Stage>("input");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isValidEmail = (val: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    setLoading(true);

    const redirectTo = `${window.location.origin}/reset-password`;
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo,
    });

    setLoading(false);

    if (resetError) {
      setError(resetError.message);
      return;
    }

    setStage("sent");
  };

  return (
    <div className="h-screen flex">
      {/* Left Side */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#8A70D6] via-[#6B4FC8] to-[#1E3A8A] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>

        {/* Floating Icons */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[
            { top: "10%", left: "15%", size: 28, delay: "0s", opacity: 0.15 },
            { top: "25%", right: "10%", size: 20, delay: "1s", opacity: 0.12 },
            { top: "60%", left: "8%", size: 24, delay: "2s", opacity: 0.1 },
            { bottom: "20%", right: "18%", size: 32, delay: "0.5s", opacity: 0.13 },
            { top: "45%", left: "50%", size: 18, delay: "1.5s", opacity: 0.1 },
          ].map((pos, i) => (
            <div
              key={i}
              className="absolute text-white animate-pulse"
              style={{ ...pos, animationDelay: pos.delay, animationDuration: "3s" }}
            >
              <Mail size={pos.size} style={{ opacity: pos.opacity }} />
            </div>
          ))}
        </div>

        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12 text-white">
          {/* Animated envelope icon */}
          <div className="mb-8">
            <div className="relative w-56 h-56 flex items-center justify-center">
              <div className="absolute inset-0 bg-white/10 rounded-full blur-2xl animate-pulse" />
              <div className="relative w-40 h-40 bg-white/10 rounded-3xl border border-white/20 flex items-center justify-center backdrop-blur-sm">
                <Mail className="w-20 h-20 text-white/80" />
              </div>
            </div>
          </div>

          <h1 className="text-4xl font-bold mb-4 text-center">Account Recovery</h1>
          <p className="text-lg text-white/90 text-center max-w-md mb-8">
            We'll send a secure reset link to your registered email address. Check your inbox within 2 minutes.
          </p>

          <div className="grid grid-cols-1 gap-4 w-full max-w-md">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 flex items-center gap-3">
              <Shield className="w-5 h-5 text-white/70 shrink-0" />
              <div>
                <div className="text-sm font-semibold">Bank-Grade Encryption</div>
                <div className="text-xs text-white/70">Reset links expire after 15 minutes</div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-white/70 shrink-0" />
              <div>
                <div className="text-sm font-semibold">Verified Delivery</div>
                <div className="text-xs text-white/70">Only sent to registered email addresses</div>
              </div>
            </div>
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

            {stage === "input" ? (
              <>
                <h2 className="text-2xl font-bold text-center mb-2">Forgot Password?</h2>
                <p className="text-center text-muted-foreground mb-8 text-sm">
                  Enter your registered email address and we'll send a verification link to reset your password.
                </p>

                <form onSubmit={handleSend} className="space-y-5">
                  <div>
                    <label className="block text-sm mb-2 text-foreground font-medium">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (error) setError("");
                        }}
                        className="pl-10 h-12 bg-input-background border-border rounded-xl"
                        placeholder="yourname@company.com"
                        required
                      />
                    </div>
                    {error && (
                      <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                        <span className="inline-block w-1 h-1 rounded-full bg-red-500" />
                        {error}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 bg-gradient-to-r from-[#8A70D6] to-[#1E3A8A] hover:opacity-90 text-white rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Sending Verification…</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send Reset Email</span>
                      </>
                    )}
                  </Button>
                </form>

                <div className="mt-6 pt-5 border-t border-border">
                  <Link
                    to="/login"
                    className="flex items-center justify-center gap-2 text-sm text-[#8A70D6] hover:text-[#1E3A8A] transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Sign In
                  </Link>
                </div>
              </>
            ) : (
              /* ── Sent State ── */
              <div className="text-center">
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#8A70D6]/20 to-[#1E3A8A]/20 border-2 border-[#8A70D6]/40 flex items-center justify-center animate-pulse">
                    <CheckCircle2 className="w-10 h-10 text-[#8A70D6]" />
                  </div>
                </div>

                <h2 className="text-2xl font-bold mb-2">Check Your Email</h2>
                <p className="text-muted-foreground text-sm mb-2">
                  We've sent a password reset link to:
                </p>
                <div className="bg-[#F3F0FF] rounded-lg px-4 py-2 mb-6 inline-block">
                  <span className="text-[#8A70D6] font-semibold text-sm">{email}</span>
                </div>

                <div className="bg-[#F3F0FF] rounded-xl p-4 mb-6 text-left space-y-2">
                  <p className="text-xs text-muted-foreground flex items-start gap-2">
                    <span className="text-[#8A70D6] font-bold mt-0.5">1.</span>
                    Open the email from <strong>noreply@axa-prism.com</strong>
                  </p>
                  <p className="text-xs text-muted-foreground flex items-start gap-2">
                    <span className="text-[#8A70D6] font-bold mt-0.5">2.</span>
                    Click <strong>"Reset Password"</strong> — link expires in 15 minutes
                  </p>
                  <p className="text-xs text-muted-foreground flex items-start gap-2">
                    <span className="text-[#8A70D6] font-bold mt-0.5">3.</span>
                    Create your new secure password
                  </p>
                </div>

                <button
                  onClick={() => { setStage("input"); setEmail(""); }}
                  className="text-sm text-muted-foreground hover:text-[#8A70D6] transition-colors"
                >
                  Didn't receive email? Try again
                </button>

                <div className="mt-6 pt-5 border-t border-border">
                  <Link
                    to="/login"
                    className="flex items-center justify-center gap-2 text-sm text-[#8A70D6] hover:text-[#1E3A8A] transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Sign In
                  </Link>
                </div>
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
