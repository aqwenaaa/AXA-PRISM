import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { Lock, User, ArrowRight, Shield } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Checkbox } from "../components/ui/checkbox";

export default function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Navigate to data ingestion page after login
    navigate("/data-ingestion");
  };

  return (
    <div className="h-screen flex">
      {/* Left Side - 3D Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-purple-600 to-indigo-700 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        
        {/* 3D Abstract Wave */}
        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12 text-white">
          <div className="mb-8">
            <div className="relative w-64 h-64">
              {/* Animated wave shapes */}
              <div className="absolute inset-0 opacity-80">
                <svg viewBox="0 0 200 200" className="w-full h-full">
                  <defs>
                    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style={{ stopColor: '#ffffff', stopOpacity: 0.8 }} />
                      <stop offset="100%" style={{ stopColor: '#ffffff', stopOpacity: 0.2 }} />
                    </linearGradient>
                  </defs>
                  <path
                    d="M 50 100 Q 75 80, 100 100 T 150 100"
                    stroke="url(#grad1)"
                    strokeWidth="20"
                    fill="none"
                    strokeLinecap="round"
                    className="animate-pulse"
                  />
                  <path
                    d="M 50 120 Q 75 140, 100 120 T 150 120"
                    stroke="url(#grad1)"
                    strokeWidth="20"
                    fill="none"
                    strokeLinecap="round"
                    className="animate-pulse"
                    style={{ animationDelay: '0.5s' }}
                  />
                  <circle cx="100" cy="100" r="60" fill="url(#grad1)" opacity="0.3" className="animate-pulse" />
                </svg>
              </div>
            </div>
          </div>
          
          <h1 className="text-4xl font-bold mb-4">Insurance ClaimIQ</h1>
          <p className="text-lg text-white/90 text-center max-w-md mb-8">
            Advanced AI-powered claim analysis platform for enterprise risk management
          </p>
          
          <div className="grid grid-cols-2 gap-4 w-full max-w-md">
          </div>
        </div>
      </div>

      {/* Right Side - Login Card */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          {/* Card with glassmorphism */}
          <div className="bg-white rounded-xl shadow-2xl p-8 border border-border backdrop-blur-sm">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg">
                <Shield className="w-8 h-8 text-white" />
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-center mb-2">Secure Sign In</h2>
            <p className="text-center text-muted-foreground mb-8">
              Access your claim analysis dashboard
            </p>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm mb-2 text-foreground">Username</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10 h-12 bg-input-background border-border rounded-xl"
                    placeholder="Enter your username"
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
                <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-primary to-purple-600 hover:from-purple-600 hover:to-primary text-white rounded-xl shadow-lg shadow-primary/30 transition-all"
              >
                <span>Secure Sign In</span>
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </form>

          </div>

          <p className="text-center text-sm text-muted-foreground mt-6">
            © 2026 AXA-PRISM. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}