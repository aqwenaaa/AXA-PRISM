"use client";

import Link from "next/link";
import { Button } from "@/app/components/ui/button";
import { ArrowLeft, Heart, Shield, FileText, UserCheck, Stethoscope, Activity, Hospital, Ambulance, Pill, HeartPulse, Clipboard, CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";

export default function HealthcarePage() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
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
        className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-success/20 via-primary/20 to-transparent rounded-full blur-[120px] pointer-events-none"
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

      {/* Navbar */}
      <nav className="sticky top-0 z-50 glass backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-success flex items-center justify-center shadow-lg shadow-primary/20">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-semibold bg-gradient-to-r from-primary to-success bg-clip-text text-transparent">AXA-PRISM</span>
          </Link>

          <Link href="/">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-16 relative">
        <motion.div
          className="text-center max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/20 via-success/20 to-primary/20 border border-primary/30 text-sm text-primary backdrop-blur-sm mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <HeartPulse className="w-4 h-4" />
            <span>Comprehensive Healthcare Intelligence</span>
          </motion.div>

          <h1 className="text-5xl lg:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-foreground via-primary to-success bg-clip-text text-transparent">
              AXA-PRISM Healthcare
            </span>
            <br />
            <span className="bg-gradient-to-r from-primary via-success to-primary bg-clip-text text-transparent">
              Insurance Solutions
            </span>
          </h1>

          <p className="text-xl text-foreground/60 leading-relaxed">
            Advanced AI-powered platform for intelligent healthcare claim management, fraud detection, and comprehensive medical insurance analytics.
          </p>
        </motion.div>
      </section>

      {/* Floating Insurance Icons */}
      <section className="max-w-7xl mx-auto px-6 py-12 relative h-64 mb-12">
        <motion.div
          className="absolute top-8 left-1/4 w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-success/20 backdrop-blur-sm flex items-center justify-center shadow-xl"
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
          <Hospital className="w-10 h-10 text-primary" />
        </motion.div>

        <motion.div
          className="absolute top-16 right-1/4 w-20 h-20 rounded-2xl bg-gradient-to-br from-success/20 to-primary/20 backdrop-blur-sm flex items-center justify-center shadow-xl"
          animate={{
            y: [0, 25, 0],
            rotate: [0, -5, 0],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5
          }}
        >
          <Ambulance className="w-10 h-10 text-success" />
        </motion.div>

        <motion.div
          className="absolute bottom-8 left-1/3 w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-success/20 backdrop-blur-sm flex items-center justify-center shadow-xl"
          animate={{
            y: [0, -15, 0],
            x: [0, 10, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        >
          <Stethoscope className="w-10 h-10 text-primary" />
        </motion.div>

        <motion.div
          className="absolute top-24 left-1/2 w-16 h-16 rounded-xl bg-gradient-to-br from-success/20 to-primary/20 backdrop-blur-sm flex items-center justify-center shadow-lg"
          animate={{
            y: [0, 20, 0],
            rotate: [0, 10, 0],
          }}
          transition={{
            duration: 4.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1.5
          }}
        >
          <Pill className="w-8 h-8 text-primary" />
        </motion.div>

        <motion.div
          className="absolute bottom-12 right-1/3 w-16 h-16 rounded-xl bg-gradient-to-br from-primary/20 to-success/20 backdrop-blur-sm flex items-center justify-center shadow-lg"
          animate={{
            y: [0, -25, 0],
            x: [0, -10, 0],
          }}
          transition={{
            duration: 5.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        >
          <FileText className="w-8 h-8 text-success" />
        </motion.div>
      </section>

      {/* Healthcare Coverage Types */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-foreground via-primary to-success bg-clip-text text-transparent">
              Healthcare Coverage Solutions
            </span>
          </h2>
          <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
            Comprehensive insurance plans designed to protect your health and financial wellbeing
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: Hospital,
              title: 'Hospital Coverage',
              description: 'Full coverage for hospitalization including room charges, ICU, surgery, and specialist consultations.',
              features: ['Private room accommodation', 'ICU & CCU coverage', 'Surgical procedures', 'Emergency care'],
              color: 'from-primary to-success'
            },
            {
              icon: Stethoscope,
              title: 'Outpatient Services',
              description: 'Comprehensive coverage for doctor visits, diagnostics, and medical consultations.',
              features: ['Doctor consultations', 'Laboratory tests', 'Diagnostic imaging', 'Prescription drugs'],
              color: 'from-success to-primary'
            },
            {
              icon: Pill,
              title: 'Prescription Drugs',
              description: 'Coverage for prescribed medications and pharmaceutical treatments.',
              features: ['Generic medications', 'Brand-name drugs', 'Specialty medications', 'Mail-order pharmacy'],
              color: 'from-primary to-success'
            },
            {
              icon: Activity,
              title: 'Preventive Care',
              description: 'Annual health screenings and preventive medical services at no additional cost.',
              features: ['Annual check-ups', 'Vaccinations', 'Cancer screenings', 'Health assessments'],
              color: 'from-success to-primary'
            },
            {
              icon: Ambulance,
              title: 'Emergency Services',
              description: '24/7 emergency medical services including ambulance and urgent care.',
              features: ['Emergency transport', 'Urgent care centers', '24/7 hotline support', 'Global coverage'],
              color: 'from-primary to-success'
            },
            {
              icon: HeartPulse,
              title: 'Chronic Disease Management',
              description: 'Specialized care programs for managing chronic health conditions.',
              features: ['Diabetes management', 'Cardiac care', 'Respiratory conditions', 'Regular monitoring'],
              color: 'from-success to-primary'
            },
          ].map((coverage, i) => (
            <motion.div
              key={coverage.title}
              className="glass rounded-2xl p-8 relative overflow-hidden group"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
            >
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${coverage.color} opacity-10 rounded-full blur-2xl`} />

              <motion.div
                className={`w-14 h-14 rounded-xl bg-gradient-to-br ${coverage.color} flex items-center justify-center mb-6 shadow-lg shadow-primary/20`}
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <coverage.icon className="w-7 h-7 text-white" />
              </motion.div>

              <h3 className="text-xl font-semibold text-foreground mb-3">{coverage.title}</h3>
              <p className="text-foreground/60 leading-relaxed mb-6">{coverage.description}</p>

              <ul className="space-y-2">
                {coverage.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-foreground/70">
                    <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Claims Process */}
      <section className="relative py-24 overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-primary/20 via-success/10 to-primary/10"
          animate={{
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-foreground via-primary to-success bg-clip-text text-transparent">
                Simplified Claims Process
              </span>
            </h2>
            <p className="text-lg text-foreground/60">
              Fast, transparent, and efficient healthcare claim processing powered by AI
            </p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                icon: Clipboard,
                title: 'Submit Claim',
                description: 'Upload medical documents and receipts through our secure portal'
              },
              {
                step: '02',
                icon: Activity,
                title: 'AI Analysis',
                description: 'PRISM analyzes your claim with 99.9% accuracy in real-time'
              },
              {
                step: '03',
                icon: UserCheck,
                title: 'Verification',
                description: 'Automated verification with fraud detection and policy validation'
              },
              {
                step: '04',
                icon: CheckCircle2,
                title: 'Approval',
                description: 'Receive approval and reimbursement within 24-48 hours'
              },
            ].map((step, i) => (
              <motion.div
                key={step.step}
                className="glass rounded-2xl p-6 text-center relative"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <div className="text-6xl font-bold bg-gradient-to-r from-primary/20 to-success/20 bg-clip-text text-transparent mb-4">
                  {step.step}
                </div>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-success flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20">
                  <step.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-foreground/60 leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-6 py-24">
        <motion.div
          className="glass rounded-2xl p-12 text-center relative overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-gradient-to-br from-success/20 to-transparent rounded-full blur-3xl" />

          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-4">
              <span className="bg-gradient-to-r from-foreground via-primary to-success bg-clip-text text-transparent">
                Get Protected with AXA Healthcare
              </span>
            </h2>
            <p className="text-lg text-foreground/60 mb-8">
              Experience the future of health insurance with AI-powered claim processing
            </p>
            <Link href="/login">
              <Button className="bg-gradient-to-r from-primary to-success text-white px-10 py-6 text-base hover:shadow-xl hover:shadow-primary/20 transition-all">
                Start Now
                <ArrowLeft className="ml-2 w-5 h-5 rotate-180" />
              </Button>
            </Link>
          </div>
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
              <Link href="/" className="hover:text-primary transition-colors">Home</Link>
              <Link href="/about-axa" className="hover:text-primary transition-colors">About AXA</Link>
              <Link href="/security" className="hover:text-primary transition-colors">Security</Link>
              <Link href="/faq" className="hover:text-primary transition-colors">FAQ</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
