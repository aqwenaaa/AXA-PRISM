import { Button } from "../components/ui/button";
import { Heart, CheckCircle2, ArrowRight, Home, LogIn } from "lucide-react";
import { Link } from "react-router";
import { motion } from "motion/react";
import { useEffect, useState } from "react";

export default function LogoutPage() {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    setShowConfetti(true);
    // Simulate logout process
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center">
      {/* Animated background */}
      <motion.div
        className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/30 via-primary/20 to-transparent rounded-full blur-[120px] pointer-events-none"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-primary/20 via-success/20 to-transparent rounded-full blur-[120px] pointer-events-none"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 w-96 h-96 bg-gradient-to-br from-success/10 via-primary/15 to-transparent rounded-full blur-[150px] pointer-events-none"
        animate={{
          scale: [1, 1.1, 1],
          x: [-200, -150, -200],
          y: [-200, -250, -200],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
      />

      {/* Floating particles */}
      {showConfetti && (
        <>
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{
                background: i % 3 === 0 ? '#8A70D6' : i % 3 === 1 ? '#1E3A8A' : '#a78bfa',
                left: '50%',
                top: '50%',
              }}
              initial={{ opacity: 1, scale: 0 }}
              animate={{
                opacity: [1, 1, 0],
                scale: [0, 1, 0.5],
                x: [0, (Math.random() - 0.5) * 400],
                y: [0, (Math.random() - 0.5) * 400],
              }}
              transition={{
                duration: 2,
                delay: i * 0.05,
                ease: "easeOut"
              }}
            />
          ))}
        </>
      )}

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-6 relative z-10">
        <motion.div
          className="glass rounded-3xl p-12 text-center relative overflow-hidden"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-gradient-to-br from-success/20 to-transparent rounded-full blur-3xl" />

          {/* Success Icon */}
          <motion.div
            className="relative z-10 mb-8 flex justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              duration: 0.5,
              delay: 0.3,
              type: "spring",
              stiffness: 200
            }}
          >
            <div className="relative">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-primary to-success rounded-full blur-2xl opacity-50"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.7, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-primary via-primary to-primary/70 flex items-center justify-center shadow-xl shadow-primary/30">
                <CheckCircle2 className="w-12 h-12 text-white" />
              </div>
            </div>
          </motion.div>

          {/* Text Content */}
          <motion.div
            className="relative z-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <h1 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-foreground via-primary to-success bg-clip-text text-transparent">
                You've Been Logged Out
              </span>
            </h1>
            <p className="text-lg text-foreground/60 mb-8 leading-relaxed">
              Thank you for using AXA-PRISM. Your session has been securely terminated and all data has been protected.
            </p>
          </motion.div>

          {/* Session Summary */}
          <motion.div
            className="relative z-10 grid grid-cols-3 gap-4 mb-8 p-6 rounded-2xl bg-gradient-to-r from-primary/5 via-success/5 to-primary/5 border border-primary/10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <div>
              <div className="text-2xl font-bold bg-gradient-to-r from-primary to-success bg-clip-text text-transparent">
                2h 34m
              </div>
              <div className="text-sm text-foreground/60">Session Duration</div>
            </div>
            <div>
              <div className="text-2xl font-bold bg-gradient-to-r from-success to-primary bg-clip-text text-transparent">
                15
              </div>
              <div className="text-sm text-foreground/60">Claims Reviewed</div>
            </div>
            <div>
              <div className="text-2xl font-bold bg-gradient-to-r from-primary to-success bg-clip-text text-transparent">
                100%
              </div>
              <div className="text-sm text-foreground/60">Data Secured</div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            className="relative z-10 flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link to="/login">
                <Button className="bg-gradient-to-r from-primary to-primary/80 text-white px-8 py-6 text-base hover:shadow-xl hover:shadow-primary/30 transition-all">
                  <LogIn className="mr-2 w-5 h-5" />
                  Log In Again
                </Button>
              </Link>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link to="/">
                <Button variant="outline" className="px-8 py-6 text-base border-primary/30 hover:bg-primary/5">
                  <Home className="mr-2 w-5 h-5" />
                  Back to Home
                </Button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Security Notice */}
          <motion.div
            className="relative z-10 mt-8 flex items-center justify-center gap-2 text-sm text-foreground/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.1 }}
          >
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span>Your data has been encrypted and securely stored</span>
          </motion.div>
        </motion.div>

        {/* Footer Links */}
        <motion.div
          className="mt-8 flex justify-center gap-6 text-sm text-foreground/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.3 }}
        >
          <Link to="/about-axa" className="hover:text-primary transition-colors">About AXA</Link>
          <Link to="/security" className="hover:text-primary transition-colors">Security</Link>
          <Link to="/faq" className="hover:text-primary transition-colors">FAQ</Link>
        </motion.div>

        {/* Branding */}
        <motion.div
          className="mt-6 flex items-center justify-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.5 }}
        >
          <Heart className="w-5 h-5 text-primary" />
          <span className="text-sm text-foreground/60">© 2026 AXA-PRISM. All rights reserved.</span>
        </motion.div>
      </div>
    </div>
  );
}
