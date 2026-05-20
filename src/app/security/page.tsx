"use client";

import Link from "next/link";
import { Button } from "../components/ui/button";
import Navbar from "@/app/components/ui/navbar";
import {
  ArrowLeft, Heart, Shield, Lock, Eye, FileCheck,
  Database, Award, CheckCircle2, AlertTriangle
} from "lucide-react";
import { motion } from "motion/react";

export default function SecurityPage() {
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
              <Shield className="w-4 h-4" />
              <span>Enterprise-Grade Protection</span>
            </div>
          </motion.div>

          <h1 className="text-5xl lg:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-foreground via-primary to-success bg-clip-text text-transparent">
              Financial-Grade Security
            </span>
            <br />
            <span className="bg-gradient-to-r from-primary via-success to-primary bg-clip-text text-transparent">
              for Healthcare Data
            </span>
          </h1>

          <p className="text-xl text-foreground/60 leading-relaxed">
            Built on the same security standards as global financial institutions, ensuring the highest level of protection for sensitive health insurance data.
          </p>
        </motion.div>
      </section>

      {/* Compliance Badges */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-5 gap-6">
          {[
            { name: 'HIPAA', subtitle: 'Compliant' },
            { name: 'SOC 2', subtitle: 'Type II' },
            { name: 'ISO 27001', subtitle: 'Certified' },
            { name: 'GDPR', subtitle: 'Ready' },
            { name: 'PCI DSS', subtitle: 'Level 1' },
          ].map((cert, i) => (
            <motion.div
              key={cert.name}
              className="glass rounded-xl p-6 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ scale: 1.05 }}
            >
              <Award className="w-12 h-12 mx-auto mb-3 text-primary" />
              <div className="font-semibold text-foreground">{cert.name}</div>
              <div className="text-sm text-foreground/60">{cert.subtitle}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Security Pillars */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-foreground via-primary to-success bg-clip-text text-transparent">
              Economic & Financial Security Framework
            </span>
          </h2>
          <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
            Designed to meet the stringent requirements of financial institutions and insurance regulators
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {[
            {
              icon: Lock,
              title: 'Banking-Level Encryption',
              description: 'AES-256 encryption at rest and TLS 1.3 in transit, the same standards used by major financial institutions for protecting monetary transactions.',
              features: [
                'Hardware Security Modules (HSM) for key management',
                'End-to-end encryption for all data flows',
                'Zero-knowledge architecture for sensitive fields'
              ]
            },
            {
              icon: Eye,
              title: 'Financial Audit Trail',
              description: 'Comprehensive logging and monitoring aligned with financial services regulations, ensuring complete accountability and fraud prevention.',
              features: [
                'Immutable audit logs for all transactions',
                'Real-time anomaly detection and alerts',
                'Regulatory-compliant retention policies'
              ]
            },
            {
              icon: Database,
              title: 'Data Sovereignty & Isolation',
              description: 'Multi-tenant architecture with complete data segregation, ensuring insurance portfolio data remains isolated and under your control.',
              features: [
                'Dedicated encryption keys per tenant',
                'Geographic data residency options',
                'Air-gapped backup systems'
              ]
            },
            {
              icon: Shield,
              title: 'Risk Management Controls',
              description: 'Enterprise risk management framework based on ISO 31000 and COSO principles used in financial services.',
              features: [
                'Multi-factor authentication (MFA) required',
                'Role-based access control (RBAC)',
                'Regular penetration testing & red team exercises'
              ]
            },
            {
              icon: FileCheck,
              title: 'Regulatory Compliance',
              description: 'Continuous compliance monitoring for health insurance regulations across jurisdictions, similar to financial compliance frameworks.',
              features: [
                'Automated compliance reporting',
                'Data protection impact assessments (DPIA)',
                'Right to be forgotten implementation'
              ]
            },
            {
              icon: AlertTriangle,
              title: 'Incident Response & Recovery',
              description: 'Financial-grade disaster recovery with 99.99% uptime SLA and tested business continuity procedures.',
              features: [
                'RPO < 1 hour, RTO < 4 hours',
                '24/7 Security Operations Center (SOC)',
                'Cyber insurance coverage included'
              ]
            },
          ].map((pillar, i) => (
            <motion.div
              key={pillar.title}
              className="glass rounded-2xl p-8 relative overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-2xl" />

              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-success flex items-center justify-center mb-6 shadow-lg shadow-primary/20">
                <pillar.icon className="w-7 h-7 text-white" />
              </div>

              <h3 className="text-2xl font-semibold text-foreground mb-3">{pillar.title}</h3>
              <p className="text-foreground/60 mb-6 leading-relaxed">{pillar.description}</p>

              <ul className="space-y-2">
                {pillar.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-foreground/70">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Financial Risk Protection */}
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
            className="glass rounded-2xl p-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-6 text-center">
              <span className="bg-gradient-to-r from-foreground via-primary to-success bg-clip-text text-transparent">
                Financial Insurance Policy Alignment
              </span>
            </h2>

            <div className="grid md:grid-cols-3 gap-8 mt-12">
              <div className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-primary to-success bg-clip-text text-transparent mb-3">
                  $50M
                </div>
                <div className="text-sm text-foreground/60">Cyber Liability Coverage</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-success to-primary bg-clip-text text-transparent mb-3">
                  99.99%
                </div>
                <div className="text-sm text-foreground/60">Uptime SLA Guarantee</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-primary to-success bg-clip-text text-transparent mb-3">
                  24/7
                </div>
                <div className="text-sm text-foreground/60">Security Operations Center</div>
              </div>
            </div>

            <p className="text-center text-foreground/60 mt-8 leading-relaxed max-w-3xl mx-auto">
              Our security framework is backed by comprehensive cyber insurance and financial guarantees,
              ensuring your organization is protected against data breaches, regulatory fines, and business interruption
              in accordance with global financial services standards.
            </p>
          </motion.div>
        </div>
      </section>

      {/* AXA Healthcare Policy Section */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-foreground via-primary to-success bg-clip-text text-transparent">
              AXA Healthcare Security Policy
            </span>
          </h2>
          <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
            Our healthcare-specific security policies ensure complete protection of patient health information and medical data
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {[
            {
              title: 'Patient Data Protection',
              points: [
                'All Protected Health Information (PHI) encrypted with AES-256',
                'De-identification of patient data for analytics purposes',
                'Strict access controls based on minimum necessary principle',
                'Automatic data masking for unauthorized personnel',
                'Patient consent management and tracking system'
              ]
            },
            {
              title: 'Medical Records Security',
              points: [
                'Tamper-proof audit trails for all medical record access',
                'Version control and change tracking for medical documents',
                'Secure electronic health record (EHR) integration',
                'Backup and disaster recovery for critical patient data',
                'Retention policies compliant with healthcare regulations'
              ]
            },
            {
              title: 'Claims Data Integrity',
              points: [
                'Blockchain-based claim verification for fraud prevention',
                'Real-time validation of medical procedure codes',
                'Automated detection of duplicate and fraudulent claims',
                'Secure provider network authentication',
                'Financial transaction encryption and monitoring'
              ]
            },
            {
              title: 'Healthcare Compliance',
              points: [
                'HIPAA Privacy Rule and Security Rule compliance',
                'Business Associate Agreements (BAA) management',
                'Regular compliance audits and risk assessments',
                'Breach notification procedures within 60 days',
                'Staff training on healthcare data protection annually'
              ]
            },
          ].map((policy, i) => (
            <motion.div
              key={policy.title}
              className="glass rounded-2xl p-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <h3 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-success flex items-center justify-center">
                  <span className="text-white font-bold">{i + 1}</span>
                </div>
                {policy.title}
              </h3>
              <ul className="space-y-3">
                {policy.points.map((point, idx) => (
                  <motion.li
                    key={idx}
                    className="flex items-start gap-3 text-foreground/70"
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: i * 0.1 + idx * 0.05 }}
                  >
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm leading-relaxed">{point}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Healthcare Policy Highlights */}
        <motion.div
          className="mt-12 glass rounded-2xl p-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h3 className="text-2xl font-semibold text-foreground mb-6 text-center">
            <span className="bg-gradient-to-r from-primary to-success bg-clip-text text-transparent">
              Key Healthcare Security Commitments
            </span>
          </h3>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { value: '100%', label: 'HIPAA Compliant', icon: Shield },
              { value: '<1min', label: 'Breach Detection', icon: AlertTriangle },
              { value: '15+ Years', label: 'Healthcare Experience', icon: Award },
              { value: 'Zero', label: 'Data Breaches', icon: Lock },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                className="text-center p-6 rounded-xl bg-gradient-to-br from-primary/5 to-success/5 border border-primary/10"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <stat.icon className="w-10 h-10 mx-auto mb-3 text-primary" />
                <div className="text-3xl font-bold bg-gradient-to-r from-primary to-success bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-foreground/60">{stat.label}</div>
              </motion.div>
            ))}
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
              <Link href="/faq" className="hover:text-primary transition-colors">FAQ</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
