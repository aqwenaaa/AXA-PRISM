"use client";

import Link from "next/link";
import { Button } from "@/app/components/ui/button";
import Navbar from "@/app/components/ui/navbar";
import { ArrowLeft, Heart, Shield, TrendingUp, Users, Building2, Globe2, Award, CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";

export default function AboutAXAPage() {
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
        className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-success/30 via-success/20 to-transparent rounded-full blur-[120px] pointer-events-none"
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
      <Navbar />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-16 relative">
        <motion.div
          className="text-center max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-primary/20 via-success/20 to-primary/20 border border-primary/30 text-sm text-primary backdrop-blur-sm mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              <span>Global Healthcare Leader</span>
            </div>
          </motion.div>

          <h1 className="text-5xl lg:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-foreground via-primary to-success bg-clip-text text-transparent">
              AXA Financial
            </span>
            <br />
            <span className="bg-gradient-to-r from-primary via-success to-primary bg-clip-text text-transparent">
              Health Insurance Excellence
            </span>
          </h1>

          <p className="text-xl text-foreground/60 leading-relaxed mb-8">
            Protecting lives and ensuring financial security through innovative health insurance solutions powered by cutting-edge technology.
          </p>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { icon: Users, value: '50M+', label: 'Global Members', color: 'from-primary to-success' },
            { icon: Globe2, value: '60+', label: 'Countries', color: 'from-success to-primary' },
            { icon: Award, value: '150+', label: 'Years of Trust', color: 'from-primary to-success' },
            { icon: TrendingUp, value: '$100B+', label: 'Assets Under Management', color: 'from-success to-primary' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              className="glass rounded-2xl p-8 text-center relative overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-xl" />
              <stat.icon className={`w-10 h-10 mx-auto mb-4 bg-gradient-to-r ${stat.color} p-2 rounded-xl text-white`} />
              <div className={`text-4xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-2`}>
                {stat.value}
              </div>
              <div className="text-sm text-foreground/60">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Health Insurance Products */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-foreground via-primary to-success bg-clip-text text-transparent">
              Comprehensive Health Insurance Solutions
            </span>
          </h2>
          <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
            Tailored coverage options designed to meet your healthcare needs and financial goals
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: 'Individual & Family Plans',
              description: 'Comprehensive health coverage with flexible premiums, extensive hospital networks, and preventive care benefits.',
              features: ['Cashless hospitalization', 'Pre & post hospitalization', 'Day care procedures', 'Annual health check-ups'],
              color: 'from-primary to-success'
            },
            {
              title: 'Corporate Group Insurance',
              description: 'Enterprise-grade health benefits for your employees with scalable coverage and wellness programs.',
              features: ['Customizable coverage', 'Employee wellness', 'Claims automation', 'Dedicated support'],
              color: 'from-success to-primary'
            },
            {
              title: 'Critical Illness Protection',
              description: 'Financial protection against major illnesses with lump-sum payouts and specialized treatment coverage.',
              features: ['Cancer care coverage', 'Heart disease protection', 'Organ transplant support', 'Recovery benefits'],
              color: 'from-primary to-success'
            },
          ].map((product, i) => (
            <motion.div
              key={product.title}
              className="glass rounded-2xl p-8 relative overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${product.color} opacity-10 rounded-full blur-2xl`} />

              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${product.color} flex items-center justify-center mb-6 shadow-lg shadow-primary/20`}>
                <Shield className="w-6 h-6 text-white" />
              </div>

              <h3 className="text-2xl font-semibold text-foreground mb-3">{product.title}</h3>
              <p className="text-foreground/60 mb-6 leading-relaxed">{product.description}</p>

              <ul className="space-y-3">
                {product.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-foreground/70">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button className={`w-full mt-6 bg-gradient-to-r ${product.color} text-white hover:shadow-xl hover:shadow-primary/20 transition-all`}>
                Learn More
              </Button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Why Choose AXA */}
      <section className="relative py-24 overflow-hidden">
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

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-foreground via-primary to-success bg-clip-text text-transparent">
                Why Choose AXA Health Insurance?
              </span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                title: 'AI-Powered Claims Processing',
                description: 'Lightning-fast claim settlements with 99.9% accuracy using PRISM intelligence platform.',
                icon: TrendingUp
              },
              {
                title: 'Global Healthcare Network',
                description: '50,000+ partner hospitals and clinics across 60 countries for seamless care.',
                icon: Globe2
              },
              {
                title: 'Financial Stability',
                description: 'A++ rated by S&P with $100B+ in assets ensuring your claims are always paid.',
                icon: Shield
              },
              {
                title: 'Customer-First Approach',
                description: '24/7 multilingual support with dedicated health advisors for personalized care.',
                icon: Heart
              },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                className="glass rounded-2xl p-8 flex gap-6"
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-success flex items-center justify-center flex-shrink-0 shadow-lg shadow-primary/20">
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-foreground/60 leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
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
              <Link href="/security" className="hover:text-primary transition-colors">Security</Link>
              <Link href="/faq" className="hover:text-primary transition-colors">FAQ</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
