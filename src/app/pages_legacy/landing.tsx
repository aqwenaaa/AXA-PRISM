import { Button } from "../components/ui/button";
import { Play, Upload, Activity, Cross, BarChart3, ArrowRight, Heart, Stethoscope, Pill, Shield, Brain, TrendingUp, Users, FileText, Clipboard, HeartPulse, Ambulance, Hospital, UserCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";

const scatterPoints = Array.from({ length: 25 }, (_, i) => ({
  left: `${((i * 17) % 70) + 15}%`,
  top: `${((i * 23) % 70) + 15}%`,
  duration: 2 + (i % 3) * 0.35,
  delay: (i % 5) * 0.15,
}));

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated purple glowing orbs background */}
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
        className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-primary/20 via-success/10 to-transparent rounded-full blur-[120px] pointer-events-none"
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
        className="absolute top-1/2 left-1/2 w-96 h-96 bg-gradient-to-br from-warning/10 via-primary/10 to-transparent rounded-full blur-[150px] pointer-events-none"
        animate={{
          scale: [1, 1.1, 1],
          x: [0, 50, 0],
          y: [0, -50, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
      />

      {/* Navbar */}
      <nav className="sticky top-0 z-50 glass backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <motion.div
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-success flex items-center justify-center shadow-lg shadow-primary/20">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-semibold bg-gradient-to-r from-primary to-success bg-clip-text text-transparent">AXA-PRISM</span>
          </motion.div>

          <motion.div
            className="hidden md:flex items-center gap-8"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <a href="#solutions" className="text-sm text-foreground/70 hover:text-foreground transition-colors">Solutions</a>
            <Link to="/healthcare" className="text-sm text-foreground/70 hover:text-foreground transition-colors">Healthcare</Link>
            <Link to="/about-axa" className="text-sm text-foreground/70 hover:text-foreground transition-colors">About AXA</Link>
            <Link to="/security" className="text-sm text-foreground/70 hover:text-foreground transition-colors">Security</Link>
            <Link to="/faq" className="text-sm text-foreground/70 hover:text-foreground transition-colors">FAQ</Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Link to="/login">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary/10 hover:shadow-lg hover:shadow-primary/10 transition-all">
                Login
              </Button>
            </Link>
          </motion.div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-32 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <motion.div
              className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-primary/20 via-success/20 to-primary/20 border border-primary/30 text-sm text-primary backdrop-blur-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                <span>Healthcare Intelligence Platform</span>
              </div>
            </motion.div>

            <motion.h1
              className="text-5xl lg:text-6xl font-bold leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <span className="bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
                AI-Driven Integrity for Modern
              </span>
              <br />
              <span className="bg-gradient-to-r from-primary via-success to-primary bg-clip-text text-transparent">
                Health Insurance
              </span>
            </motion.h1>

            <motion.p
              className="text-xl text-foreground/60 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Detect medical claim anomalies, optimize risk analysis, and automate health audits with our end-to-end Intelligence Lab.
            </motion.p>

            <motion.div
              className="flex flex-wrap gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link to="/login">
                  <Button className="bg-gradient-to-r from-primary to-success text-white px-8 py-6 text-base hover:shadow-xl hover:shadow-primary/30 transition-all">
                    Get Started
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link to="/healthcare">
                  <Button variant="outline" className="px-8 py-6 text-base border-primary/30 hover:bg-primary/5">
                    <HeartPulse className="mr-2 w-5 h-5" />
                    Healthcare Info
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          </div>

          {/* 3D Floating Composition with Health Elements */}
          <div className="relative h-[500px] hidden lg:block">
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
                  <span className="text-sm font-medium bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">Medical Claim Outliers</span>
                </div>
                <div className="flex-1 relative bg-gradient-to-br from-primary/5 to-success/5 rounded-xl p-4">
                  {/* Animated scatter plot */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    {[...Array(25)].map((_, i) => (
                      <motion.div
                        key={i}
                        className={`absolute w-3 h-3 rounded-full ${
                          i % 7 === 0 ? 'bg-gradient-to-br from-destructive to-warning shadow-lg shadow-destructive/50' : 'bg-gradient-to-br from-primary/60 to-success/40'
                        }`}
                        style={scatterPoints[i]}
                        animate={{
                          scale: i % 7 === 0 ? [1, 1.3, 1] : [1, 1.1, 1],
                          opacity: [0.7, 1, 0.7],
                        }}
                        transition={{
                          duration: scatterPoints[i].duration,
                          repeat: Infinity,
                          delay: scatterPoints[i].delay,
                        }}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-foreground/60">
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-destructive" />
                    High Risk
                  </span>
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-primary/60" />
                    Normal
                  </span>
                </div>
              </div>
            </motion.div>

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
                  <span className="text-sm font-medium bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">Health Claim Flow</span>
                </div>
                <div className="flex-1 flex flex-col justify-around gap-3">
                  <motion.div
                    className="h-3 bg-gradient-to-r from-primary via-primary/70 to-success/30 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 1.5, delay: 1 }}
                  />
                  <motion.div
                    className="h-3 bg-gradient-to-r from-success via-success/70 to-primary/30 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: "75%" }}
                    transition={{ duration: 1.5, delay: 1.3 }}
                  />
                  <motion.div
                    className="h-3 bg-gradient-to-r from-warning via-warning/70 to-success/30 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: "50%" }}
                    transition={{ duration: 1.5, delay: 1.6 }}
                  />
                </div>
              </div>
            </motion.div>

            {/* Floating health icons */}
            <motion.div
              className="absolute top-32 left-20 w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-success/20 backdrop-blur-sm flex items-center justify-center"
              animate={{
                y: [0, -20, 0],
                rotate: [0, 5, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Heart className="w-8 h-8 text-primary" />
            </motion.div>

            <motion.div
              className="absolute bottom-32 right-20 w-16 h-16 rounded-2xl bg-gradient-to-br from-success/20 to-primary/20 backdrop-blur-sm flex items-center justify-center"
              animate={{
                y: [0, 20, 0],
                rotate: [0, -5, 0],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1
              }}
            >
              <Pill className="w-8 h-8 text-primary" />
            </motion.div>

            <motion.div
              className="absolute top-1/2 left-32 w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-success/20 backdrop-blur-sm flex items-center justify-center"
              animate={{
                x: [0, -15, 0],
                y: [0, 15, 0],
                rotate: [0, 10, 0],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5
              }}
            >
              <FileText className="w-7 h-7 text-success" />
            </motion.div>

            <motion.div
              className="absolute bottom-1/3 right-32 w-14 h-14 rounded-xl bg-gradient-to-br from-success/20 to-primary/20 backdrop-blur-sm flex items-center justify-center"
              animate={{
                x: [0, 10, 0],
                y: [0, -10, 0],
              }}
              transition={{
                duration: 7,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1.5
              }}
            >
              <Shield className="w-7 h-7 text-primary" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
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
          <div className="flex flex-wrap justify-center items-center gap-12">
            {['Allianz Health', 'AXA Global', 'Prudential', 'MetLife', 'Zurich Care'].map((partner, i) => (
              <motion.div
                key={partner}
                className="text-2xl font-bold bg-gradient-to-r from-foreground/60 to-foreground/40 bg-clip-text text-transparent"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                {partner}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Grid - The 4 Pillars */}
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
            From medical data collection to strategic decision-making, our platform covers every critical touchpoint
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Pillar 1: Data Ingestion */}
          <motion.div
            className="glass rounded-xl p-8 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 group relative overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            whileHover={{ y: -5 }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-2xl" />
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary via-primary/80 to-success flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-primary/20 relative z-10">
              <Upload className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-3 relative z-10">Health Data Ingestion</h3>
            <p className="text-foreground/60 leading-relaxed mb-4 relative z-10">
              Secure, validated medical data pipeline with real-time quality checks for patient records and claims.
            </p>
            <div className="text-sm bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent font-medium relative z-10">For Data Operators →</div>
          </motion.div>

          {/* Pillar 2: Risk Intelligence */}
          <motion.div
            className="glass rounded-xl p-8 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 group relative overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            whileHover={{ y: -5 }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-2xl" />
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-success to-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-primary/20 relative z-10">
              <Brain className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-3 relative z-10">Medical Risk Intelligence</h3>
            <p className="text-foreground/60 leading-relaxed mb-4 relative z-10">
              AI-powered clustering for fraudulent claim detection and health risk pattern recognition.
            </p>
            <div className="text-sm bg-gradient-to-r from-success to-primary bg-clip-text text-transparent font-medium relative z-10">For Risk Analysts →</div>
          </motion.div>

          {/* Pillar 3: Medical Audit */}
          <motion.div
            className="glass rounded-xl p-8 hover:shadow-xl hover:shadow-warning/10 transition-all duration-300 group relative overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            whileHover={{ y: -5 }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-warning/10 to-transparent rounded-full blur-2xl" />
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-warning via-warning/80 to-destructive flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-warning/20 relative z-10">
              <Stethoscope className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-3 relative z-10">Clinical Audit</h3>
            <p className="text-foreground/60 leading-relaxed mb-4 relative z-10">
              Expert medical review workflow for claim verification and treatment appropriateness assessment.
            </p>
            <div className="text-sm bg-gradient-to-r from-warning to-warning/70 bg-clip-text text-transparent font-medium relative z-10">For Medical Auditors →</div>
          </motion.div>

          {/* Pillar 4: Executive Command */}
          <motion.div
            className="glass rounded-xl p-8 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 group relative overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            whileHover={{ y: -5 }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-2xl" />
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/90 via-primary to-success/70 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-primary/20 relative z-10">
              <TrendingUp className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-3 relative z-10">Strategic Dashboard</h3>
            <p className="text-foreground/60 leading-relaxed mb-4 relative z-10">
              Healthcare cost analysis with population health metrics and financial impact forecasting.
            </p>
            <div className="text-sm bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent font-medium relative z-10">For Strategic Managers →</div>
          </motion.div>
        </div>
      </section>

      {/* Key Metrics Section */}
      <section className="relative py-24 overflow-hidden">
        {/* Animated purple mesh gradient background */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-primary/30 via-success/20 to-primary/10"
          animate={{
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-0 right-1/4 w-96 h-96 bg-gradient-to-br from-primary/40 to-success/20 rounded-full blur-[150px]"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-0 left-1/4 w-96 h-96 bg-gradient-to-tr from-success/30 to-primary/20 rounded-full blur-[150px]"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -50, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
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
                Our AI-powered platform delivers enterprise-grade accuracy while significantly reducing medical claim fraud and operational costs.
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
              <motion.div
                className="glass rounded-2xl p-8 text-center relative overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-xl" />
                <motion.div
                  className="text-6xl font-bold bg-gradient-to-r from-primary via-primary/80 to-success bg-clip-text text-transparent mb-3"
                  initial={{ scale: 0.5 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  99.9%
                </motion.div>
                <div className="text-sm text-foreground/60">Fraud Detection Accuracy</div>
              </motion.div>
              <motion.div
                className="glass rounded-2xl p-8 text-center relative overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-success/20 to-transparent rounded-full blur-xl" />
                <motion.div
                  className="text-6xl font-bold bg-gradient-to-r from-success via-success/80 to-primary bg-clip-text text-transparent mb-3"
                  initial={{ scale: 0.5 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  25%
                </motion.div>
                <div className="text-sm text-foreground/60">Cost Reduction</div>
              </motion.div>
              <motion.div
                className="glass rounded-2xl p-8 text-center relative overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-warning/20 to-transparent rounded-full blur-xl" />
                <motion.div
                  className="text-6xl font-bold bg-gradient-to-r from-warning via-warning/80 to-primary bg-clip-text text-transparent mb-3"
                  initial={{ scale: 0.5 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                >
                  60%
                </motion.div>
                <div className="text-sm text-foreground/60">Faster Audit Time</div>
              </motion.div>
              <motion.div
                className="glass rounded-2xl p-8 text-center relative overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.5 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-xl" />
                <motion.div
                  className="text-6xl font-bold bg-gradient-to-r from-primary via-success to-primary bg-clip-text text-transparent mb-3"
                  initial={{ scale: 0.5 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                >
                  15M
                </motion.div>
                <div className="text-sm text-foreground/60">Patient Records Secured</div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
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
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link to="/login">
                <Button className="bg-gradient-to-r from-primary to-success text-white px-10 py-6 text-base hover:shadow-2xl hover:shadow-primary/30 transition-all">
                  Start Using System
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-gradient-to-r from-transparent via-primary/5 to-transparent py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-primary" />
              <span className="text-sm text-foreground/60">© 2026 AXA-PRISM. All rights reserved.</span>
            </div>
            <div className="flex gap-6 text-sm text-foreground/60">
              <a href="#privacy" className="hover:text-primary transition-colors">Privacy Policy</a>
              <a href="#terms" className="hover:text-primary transition-colors">Terms of Service</a>
              <a href="#contact" className="hover:text-primary transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
