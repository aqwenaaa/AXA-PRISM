"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/app/components/ui/button";
import Navbar from "@/app/components/ui/navbar";
import {
  Activity, Upload, ArrowRight, Heart, Stethoscope, Pill,
  Shield, Brain, TrendingUp, Users, FileText, HeartPulse,
} from "lucide-react";
import { motion } from "motion/react";

// ─── Daftar background images dari folder public/images/ ─────────────────────
const heroBackgrounds = [
  "/assets/image1.jpg",
  "/assets/image2.jpg",
  "/assets/image3.jpg",
  "/assets/image4.jpg",
  "/assets/image5.jpg",
];

export default function LandingPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  // Guard hydration: render slider hanya setelah mount di client
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroBackgrounds.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden pt-20">

      {/* ═══════════════════════════════════════════
          ANIMATED BACKGROUND ORBS (halaman penuh)
      ═══════════════════════════════════════════ */}
      <motion.div
        className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/30 via-primary/20 to-transparent rounded-full blur-[120px] pointer-events-none"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-primary/20 via-success/10 to-transparent rounded-full blur-[120px] pointer-events-none"
        animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />

      {/* ═══════════════════════════════════════════
    NAVBAR
═══════════════════════════════════════════ */}
      <Navbar />

      {/* ═══════════════════════════════════════════
          HERO SECTION — dengan background image slider
      ═══════════════════════════════════════════ */}
      <section className="relative min-h-[700px] flex items-center pt-32 pb-32 overflow-hidden">

        {/* ── Layer 1: Background Image Slider ── */}
        {mounted && (
          <div className="absolute inset-0 z-0 pointer-events-none">
            {heroBackgrounds.map((bg, index) => (
              <div
                key={bg}
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{
                  backgroundImage: `url('${bg}')`,
                  opacity: index === currentSlide ? 1 : 0,
                  transition: "opacity 1s ease-in-out",
                }}
              />
            ))}
          </div>
        )}

        {/* ── Layer 2: Dark Overlay ── */}
        <div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.25) 45%, rgba(0,0,0,0.55) 100%)",
          }}
        />

        {/* ── Layer 3: Slider Dot Navigation ── */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-30">
          {heroBackgrounds.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-3 rounded-full transition-all duration-300 ${index === currentSlide
                ? "bg-primary w-10"
                : "bg-white/40 hover:bg-white/60 w-3"
                }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* ── Layer 4: Konten Hero (z-index di atas overlay) ── */}
        <div className="max-w-7xl mx-auto px-6 w-full relative z-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* Kolom Kiri — Teks & CTA */}
            <div className="space-y-8">
              <motion.div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 border border-white/30 text-sm text-white backdrop-blur-md"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Activity className="w-4 h-4" />
                <span>Healthcare Intelligence Platform</span>
              </motion.div>

              <motion.h1
                className="text-5xl lg:text-6xl font-bold leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <span className="text-white drop-shadow-lg">
                  AI-Driven Integrity for Modern{" "}
                </span>
                <span className="bg-gradient-to-r from-green-300 via-emerald-200 to-green-300 bg-clip-text text-transparent drop-shadow-lg">
                  Health Insurance
                </span>
              </motion.h1>

              <motion.p
                className="text-xl text-white/80 leading-relaxed drop-shadow"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                Detect medical claim anomalies, optimize risk analysis, and automate
                health audits with our end-to-end Intelligence Lab.
              </motion.p>

              <motion.div
                className="flex flex-wrap gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link href="/login">
                    <Button className="bg-gradient-to-r from-primary to-success text-white px-8 py-6 text-base hover:shadow-xl hover:shadow-primary/30 transition-all">
                      Get Started
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link href="/healthcare">
                    <Button
                      variant="outline"
                      className="px-8 py-6 text-base border-white/40 text-slate-800 hover:bg-white/10 backdrop-blur-sm"
                    >
                      <HeartPulse className="mr-2 w-5 h-5" />
                      Healthcare Info
                    </Button>
                  </Link>
                </motion.div>
              </motion.div>
            </div>

            {/* Kolom Kanan — Floating Cards */}
            <div className="relative h-[500px] hidden lg:block">

              {/* Card: Medical Claim Outliers */}
              <motion.div
                className="absolute top-10 right-10 w-72 h-72 glass rounded-3xl p-6 shadow-xl shadow-primary/10"
                initial={{ opacity: 0, rotate: 12, y: -50 }}
                animate={{ opacity: 1, rotate: 6, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                whileHover={{ rotate: 3, scale: 1.05 }}
              >
                <div className="h-full flex flex-col gap-4">
                  <div className="flex items-center gap-3 pb-3 border-b border-border">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-destructive to-warning/70 flex items-center justify-center">
                      <Activity className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium">Medical Claim Outliers</span>
                  </div>
                  <div className="flex-1 relative bg-gradient-to-br from-primary/5 to-success/5 rounded-xl p-4">
                    <div className="absolute inset-0 flex items-center justify-center">
                      {[...Array(25)].map((_, i) => (
                        <motion.div
                          key={i}
                          className={`absolute w-3 h-3 rounded-full ${i % 7 === 0
                            ? "bg-gradient-to-br from-destructive to-warning shadow-lg shadow-destructive/50"
                            : "bg-gradient-to-br from-primary/60 to-success/40"
                            }`}
                          style={{
                            left: `${((i * 37) % 80) + 10}%`,
                            top: `${((i * 53) % 80) + 10}%`,
                          }}
                          animate={{
                            scale: i % 7 === 0 ? [1, 1.3, 1] : [1, 1.1, 1],
                            opacity: [0.7, 1, 0.7],
                          }}
                          transition={{
                            duration: 2 + (i % 5) * 0.35,
                            repeat: Infinity,
                            delay: (i % 6) * 0.25,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-foreground/60">
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-destructive" /> High Risk
                    </span>
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-primary/60" /> Normal
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Card: Health Claim Flow */}
              <motion.div
                className="absolute bottom-10 left-10 w-64 h-64 glass rounded-3xl p-6 shadow-xl shadow-success/10"
                initial={{ opacity: 0, rotate: -12, y: 50 }}
                animate={{ opacity: 1, rotate: -6, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                whileHover={{ rotate: -3, scale: 1.05 }}
              >
                <div className="h-full flex flex-col gap-4">
                  <div className="flex items-center gap-3 pb-3 border-b border-border">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-success to-primary/70 flex items-center justify-center">
                      <Stethoscope className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium">Health Claim Flow</span>
                  </div>
                  <div className="flex-1 flex flex-col justify-around gap-3">
                    {[
                      { from: "from-primary via-primary/70 to-success/30", width: "100%", delay: 1 },
                      { from: "from-success via-success/70 to-primary/30", width: "75%", delay: 1.3 },
                      { from: "from-warning via-warning/70 to-success/30", width: "50%", delay: 1.6 },
                    ].map((bar, i) => (
                      <motion.div
                        key={i}
                        className={`h-3 bg-gradient-to-r ${bar.from} rounded-full`}
                        initial={{ width: 0 }}
                        animate={{ width: bar.width }}
                        transition={{ duration: 1.5, delay: bar.delay }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Floating Icons */}
              {[
                { icon: <Heart className="w-8 h-8 text-primary" />, style: { top: "128px", left: "80px" }, y: [0, -20, 0], rotate: [0, 5, 0], duration: 4 },
                { icon: <Pill className="w-8 h-8 text-primary" />, style: { bottom: "128px", right: "80px" }, y: [0, 20, 0], rotate: [0, -5, 0], duration: 5 },
                { icon: <FileText className="w-7 h-7 text-success" />, style: { top: "50%", left: "128px" }, y: [0, 15, 0], rotate: [0, 10, 0], duration: 6 },
                { icon: <Shield className="w-7 h-7 text-primary" />, style: { bottom: "33%", right: "128px" }, y: [0, -10, 0], rotate: [0, 0, 0], duration: 7 },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  className="absolute w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center"
                  style={item.style}
                  animate={{ y: item.y, rotate: item.rotate }}
                  transition={{ duration: item.duration, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }}
                >
                  {item.icon}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          TRUST BAR
      ═══════════════════════════════════════════ */}
      <section className="border-y border-border bg-gradient-to-r from-white/50 via-primary/5 to-white/50 backdrop-blur-sm py-8">
        <div className="max-w-7xl mx-auto px-6">
          <motion.p
            className="text-center text-sm text-foreground/50 mb-6"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Trusted by leading global health insurance providers
          </motion.p>
          <div className="flex flex-wrap justify-center items-center gap-1 -space-x-40">
            {[
              { src: "/assets/mandiri.png", w: "w-[140px]" },
              { src: "/assets/redefining-axa.png", w: "w-[700px]" },
              { src: "/assets/axa-global.png", w: "w-[70px]" },
            ].map((logo, i) => (
              <motion.div
                key={logo.src}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`relative ${logo.w} h-[90px]`}
              >
                <Image
                  src={logo.src}
                  alt="Partner Logo"
                  fill
                  className="object-contain"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          FEATURE GRID — 4 PILLARS
      ═══════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-6 py-24" id="solutions">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
              Complete Healthcare Intelligence Workflow
            </span>
          </h2>
          <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
            From medical data collection to strategic decision-making, our platform
            covers every critical touchpoint
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              href: "/data-ingestion",
              icon: <Upload className="w-7 h-7 text-white" />,
              iconBg: "from-primary via-primary/80 to-success",
              title: "Health Data Ingestion",
              desc: "Secure, validated medical data pipeline with real-time quality checks for patient records and claims.",
              link: "For Data Operators →",
              linkColor: "from-primary to-primary/70",
              shadow: "hover:shadow-primary/10",
              glow: "from-primary/10",
              delay: 0.1,
            },
            {
              href: "/intelligence-lab",
              icon: <Brain className="w-7 h-7 text-white" />,
              iconBg: "from-success to-primary",
              title: "Medical Risk Intelligence",
              desc: "AI-powered clustering for fraudulent claim detection and health risk pattern recognition.",
              link: "For Risk Analysts →",
              linkColor: "from-success to-primary",
              shadow: "hover:shadow-primary/10",
              glow: "from-primary/10",
              delay: 0.2,
            },
            {
              href: "/medical-audit",
              icon: <Stethoscope className="w-7 h-7 text-white" />,
              iconBg: "from-warning via-warning/80 to-destructive",
              title: "Clinical Audit",
              desc: "Expert medical review workflow for claim verification and treatment appropriateness assessment.",
              link: "For Medical Auditors →",
              linkColor: "from-warning to-warning/70",
              shadow: "hover:shadow-warning/10",
              glow: "from-warning/10",
              delay: 0.3,
            },
            {
              href: "/executive-dashboard",
              icon: <TrendingUp className="w-7 h-7 text-white" />,
              iconBg: "from-primary/90 via-primary to-success/70",
              title: "Strategic Dashboard",
              desc: "Healthcare cost analysis with population health metrics and financial impact forecasting.",
              link: "For Strategic Managers →",
              linkColor: "from-primary to-primary/70",
              shadow: "hover:shadow-primary/10",
              glow: "from-primary/10",
              delay: 0.4,
            },
          ].map((pillar) => (
            <motion.div
              key={pillar.title}
              className={`glass rounded-xl p-8 hover:shadow-xl ${pillar.shadow} transition-all duration-300 group relative overflow-hidden`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: pillar.delay }}
              whileHover={{ y: -5 }}
            >
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${pillar.glow} to-transparent rounded-full blur-2xl`} />
              <Link href={pillar.href}>
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${pillar.iconBg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg relative z-10`}>
                  {pillar.icon}
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3 relative z-10">{pillar.title}</h3>
                <p className="text-foreground/60 leading-relaxed mb-4 relative z-10">{pillar.desc}</p>
                <span className={`text-sm bg-gradient-to-r ${pillar.linkColor} bg-clip-text text-transparent font-medium relative z-10 hover:opacity-80 transition-opacity`}>
                  {pillar.link}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          KEY METRICS
      ═══════════════════════════════════════════ */}
      <section className="relative py-24 overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-primary/30 via-success/20 to-primary/10"
          animate={{ opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-0 right-1/4 w-96 h-96 bg-gradient-to-br from-primary/40 to-success/20 rounded-full blur-[150px]"
          animate={{ scale: [1, 1.2, 1], x: [0, 50, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 left-1/4 w-96 h-96 bg-gradient-to-tr from-success/30 to-primary/20 rounded-full blur-[150px]"
          animate={{ scale: [1, 1.3, 1], x: [0, -50, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl font-bold mb-6">
                <span className="bg-gradient-to-r from-foreground via-primary to-success bg-clip-text text-transparent">
                  Proven Results, Measurable Healthcare Impact
                </span>
              </h2>
              <p className="text-lg text-foreground/60 leading-relaxed mb-6">
                Our AI-powered platform delivers enterprise-grade accuracy while
                significantly reducing medical claim fraud and operational costs.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 backdrop-blur-sm">
                  <Shield className="w-5 h-5 text-primary" />
                  <span className="text-sm text-foreground/70">HIPAA Compliant</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 backdrop-blur-sm">
                  <Users className="w-5 h-5 text-success" />
                  <span className="text-sm text-foreground/70">500K+ Claims Analyzed</span>
                </div>
              </div>
            </motion.div>

            <div className="grid grid-cols-2 gap-8">
              {[
                { value: "99.9%", label: "Fraud Detection Accuracy", color: "from-primary via-primary/80 to-success", delay: 0.2 },
                { value: "25%", label: "Cost Reduction", color: "from-success via-success/80 to-primary", delay: 0.3 },
                { value: "60%", label: "Faster Audit Time", color: "from-warning via-warning/80 to-primary", delay: 0.4 },
                { value: "15M", label: "Patient Records Secured", color: "from-primary via-success to-primary", delay: 0.5 },
              ].map(({ value, label, color, delay }) => (
                <motion.div
                  key={label}
                  className="glass rounded-2xl p-8 text-center relative overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay }}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-xl" />
                  <motion.div
                    className={`text-6xl font-bold bg-gradient-to-r ${color} bg-clip-text text-transparent mb-3`}
                    initial={{ scale: 0.5 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: delay + 0.2 }}
                  >
                    {value}
                  </motion.div>
                  <div className="text-sm text-foreground/60">{label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          FINAL CTA
      ═══════════════════════════════════════════ */}
      <section className="max-w-4xl mx-auto px-6 py-24">
        <motion.div
          className="glass rounded-2xl p-12 text-center relative overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-gradient-to-br from-success/20 to-transparent rounded-full blur-3xl" />
          <motion.div
            className="relative z-10"
            initial={{ scale: 0.9 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="text-3xl font-bold mb-4">
              <span className="bg-gradient-to-r from-foreground via-primary to-success bg-clip-text text-transparent">
                Ready to transform your healthcare claims?
              </span>
            </h2>
            <p className="text-lg text-foreground/60 mb-8">
              Join leading health insurance providers leveraging AI-driven medical intelligence
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/login">
                <Button className="bg-gradient-to-r from-primary to-success text-white px-10 py-6 text-base hover:shadow-2xl hover:shadow-primary/30 transition-all">
                  Start Using System
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════
          FOOTER
      ═══════════════════════════════════════════ */}
      <footer className="border-t border-border bg-gradient-to-r from-transparent via-primary/5 to-transparent py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-primary" />
              <span className="text-sm text-foreground/60">
                © 2026 AXA-PRISM. All rights reserved.
              </span>
            </div>
            <div className="flex gap-6 text-sm text-foreground/60">
              <a href="#privacy" className="hover:text-primary transition-colors">Privacy Policy</a>
              <a href="#terms" className="hover:text-primary transition-colors">Terms of Service</a>
              <a href="#contact" className="hover:text-primary transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>

    </div >
  );
}