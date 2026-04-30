import { useState, useEffect } from "react";
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

  // Load saved credentials on mount
  useEffect(() => {
    const savedUsername = localStorage.getItem("axa_prism_username");
    const savedPassword = localStorage.getItem("axa_prism_password");
    const savedRememberMe = localStorage.getItem("axa_prism_remember_me");
    
    if (savedUsername && savedPassword && savedRememberMe === "true") {
      setUsername(savedUsername);
      setPassword(savedPassword);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Save credentials if remember me is checked
    if (rememberMe) {
      localStorage.setItem("axa_prism_username", username);
      localStorage.setItem("axa_prism_password", password);
      localStorage.setItem("axa_prism_remember_me", "true");
    } else {
      // Clear saved credentials if remember me is not checked
      localStorage.removeItem("axa_prism_username");
      localStorage.removeItem("axa_prism_password");
      localStorage.setItem("axa_prism_remember_me", "false");
    }
    
    // Navigate to data ingestion page after login
    navigate("/data-ingestion");
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