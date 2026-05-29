"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, User, ArrowRight, Shield } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Checkbox } from "@/app/components/ui/checkbox";
import { useAuth } from "@/lib/auth/auth-context";
import { ROLE_ROUTE_ACCESS } from "@/lib/types";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const savedEmail = localStorage.getItem("axa_prism_email");
    const savedRememberMe = localStorage.getItem("axa_prism_remember_me");

    if (savedEmail && savedRememberMe === "true") {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    try {
      const result = await login(email, password);

      if (result.success) {
        if (rememberMe) {
          localStorage.setItem("axa_prism_email", email);
          localStorage.setItem("axa_prism_remember_me", "true");
        } else {
          localStorage.removeItem("axa_prism_email");
          localStorage.setItem("axa_prism_remember_me", "false");
        }

        // Get redirect parameter from URL search params (Middleware-driven or SSO redirect)
        const searchParams = new URLSearchParams(window.location.search);
        const redirectParam = searchParams.get("redirect");

        // Validate redirect parameter against the logged-in user's role permissions
        const userRole = result.role || "data_operator";
        const allowedRoutes = ROLE_ROUTE_ACCESS[userRole] || [];

        const isRedirectAllowed = redirectParam && allowedRoutes.some((route) => {
          if (route === "/") return redirectParam === "/";
          return redirectParam === route || redirectParam.startsWith(route + "/");
        });

        if (redirectParam && isRedirectAllowed) {
          router.push(redirectParam);
        } else {
          router.push(result.redirectTo || "/operator/data-ingestion");
        }
      } else {
        setErrorMessage(result.error || "Invalid email or password.");
      }
    } catch (error) {
      setErrorMessage("An unexpected error occurred. Please try again.");
      console.error(error);
    }
  };

  return (
    <div className="h-screen flex">
      {/* Left Side - 3D Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#8A70D6] via-[#6B4FC8] to-[#1E3A8A] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white rounded-full blur-3xl"></div>
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
              <Shield size={pos.size} style={{ opacity: pos.opacity }} />
            </div>
          ))}
        </div>
        
        {/* 3D Abstract Wave */}
        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12 text-white">
          {/* Animated shield icon */}
          <div className="mb-2">
           <img 
            src="/assets/logo.png"
            alt="AXA-PRISM Logo" 
            className="w-80 h-80 object-contain mx-auto"
            />
          </div>

          <h1 className="text-6xl font-black mb-2 text-center tracking-wider">AXA-PRISM</h1>
          <p className="text-lg text-white/90 text-center max-w-md mb-8">
            Intelligent Claim Monitoring & Risk Prediction
          </p>
          
        </div>
      </div>

      {/* Right Side - Login Card */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          {/* Card with glassmorphism */}
          <div className="bg-white rounded-xl shadow-2xl p-8 border border-border backdrop-blur-sm">
            <div className="flex justify-center mb-2">
              {/* <img 
                src="/logo.png" 
                alt="AXA-PRISM Logo" 
                className="w-16 h-16 object-contain"
              /> */}
            </div>
            
            <h2 className="text-4xl font-bold text-center mb-2">Sign In</h2>
            <p className="text-center text-muted-foreground mb-8">
              Access your claim analysis dashboard
            </p>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm mb-2 text-foreground">Email</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 bg-input-background border-border rounded-xl"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm mb-2 text-foreground">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-12 bg-input-background border-border rounded-xl"
                    placeholder="Enter your password"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="remember" 
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  />
                  <label htmlFor="remember" className="text-sm text-foreground cursor-pointer">
                    Remember me
                  </label>
                </div>
                <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>

              {errorMessage && (
                <div className="text-sm text-destructive mt-2">{errorMessage}</div>
              )}

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-[#8A70D6] to-[#1E3A8A] hover:opacity-90 text-white rounded-xl shadow-lg shadow-primary/30 transition-all"
              >
                <span>Sign In</span>
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </form>

          </div>
        </div>
      </div>
    </div>
  );
}
