"use client";

import Link from "next/link";
import { Button } from "@/app/components/ui/button";
import Navbar from "@/app/components/ui/navbar";
import { ArrowLeft, Heart, ChevronDown } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

const faqs = [
  {
    category: 'General',
    questions: [
      {
        q: 'What is AXA-PRISM?',
        a: 'AXA-PRISM is an AI-driven healthcare intelligence platform designed to optimize medical claim processing, detect fraud, automate audits, and provide strategic insights for health insurance operations.'
      },
      {
        q: 'Who can use AXA-PRISM?',
        a: 'AXA-PRISM is designed for health insurance providers, medical auditors, risk analysts, data operators, and strategic managers who need advanced claim analysis and fraud detection capabilities.'
      },
      {
        q: 'How does PRISM integrate with existing systems?',
        a: 'PRISM offers seamless API integration with major insurance management systems, supports standard data formats (HL7, FHIR), and provides dedicated onboarding support for smooth migration.'
      },
    ]
  },
  {
    category: 'Security & Compliance',
    questions: [
      {
        q: 'Is AXA-PRISM HIPAA compliant?',
        a: 'Yes, AXA-PRISM is fully HIPAA compliant with end-to-end encryption, role-based access controls, audit trails, and regular security assessments to protect patient health information.'
      },
      {
        q: 'How is my data protected?',
        a: 'We use AES-256 encryption at rest and TLS 1.3 in transit, multi-factor authentication, regular penetration testing, and store data in SOC 2 Type II certified data centers with 24/7 monitoring.'
      },
      {
        q: 'Where is data stored?',
        a: 'Data is stored in geo-redundant data centers with your choice of regional hosting (US, EU, APAC) to comply with local data residency requirements.'
      },
    ]
  },
  {
    category: 'Features & Functionality',
    questions: [
      {
        q: 'What is the fraud detection accuracy?',
        a: 'Our AI models achieve 99.9% accuracy in detecting fraudulent claims using advanced machine learning algorithms including K-Means clustering, regression analysis, and pattern recognition.'
      },
      {
        q: 'How fast are claims processed?',
        a: 'PRISM processes claims 60% faster than traditional methods, with automated pre-screening completing in seconds and full audits reduced from days to hours.'
      },
      {
        q: 'Can I customize the risk models?',
        a: 'Yes, PRISM allows you to configure risk thresholds, add custom business rules, train models on your historical data, and adjust sensitivity levels based on your risk appetite.'
      },
      {
        q: 'What reporting capabilities are available?',
        a: 'The Executive Dashboard provides real-time analytics, customizable reports, financial impact forecasting, risk percentile visualization, and exportable insights in multiple formats.'
      },
    ]
  },
  {
    category: 'Pricing & Support',
    questions: [
      {
        q: 'What pricing plans are available?',
        a: 'We offer flexible pricing based on claim volume, number of users, and required features. Contact our sales team for a custom quote tailored to your organization\'s needs.'
      },
      {
        q: 'Is there a free trial?',
        a: 'Yes, we offer a 30-day free trial with full platform access, sample data, and dedicated onboarding support to help you evaluate PRISM for your organization.'
      },
      {
        q: 'What support options are included?',
        a: 'All plans include 24/7 technical support, dedicated account management, regular training sessions, and access to our knowledge base and API documentation.'
      },
      {
        q: 'How long does implementation take?',
        a: 'Typical implementation takes 4-8 weeks including data migration, system integration, user training, and custom configuration based on your specific requirements.'
      },
    ]
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<string | null>(null);

  const toggleQuestion = (categoryIndex: number, questionIndex: number) => {
    const key = `${categoryIndex}-${questionIndex}`;
    setOpenIndex(openIndex === key ? null : key);
  };

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
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl lg:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-foreground via-primary to-success bg-clip-text text-transparent">
              Frequently Asked Questions
            </span>
          </h1>
          <p className="text-xl text-foreground/60 leading-relaxed">
            Find answers to common questions about AXA-PRISM platform
          </p>
        </motion.div>
      </section>

      {/* FAQ Sections */}
      <section className="max-w-4xl mx-auto px-6 pb-24">
        {faqs.map((category, catIndex) => (
          <motion.div
            key={category.category}
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: catIndex * 0.1 }}
          >
            <h2 className="text-2xl font-semibold mb-6 bg-gradient-to-r from-primary to-success bg-clip-text text-transparent">
              {category.category}
            </h2>

            <div className="space-y-4">
              {category.questions.map((faq, qIndex) => {
                const key = `${catIndex}-${qIndex}`;
                const isOpen = openIndex === key;

                return (
                  <motion.div
                    key={qIndex}
                    className="glass rounded-xl overflow-hidden"
                    whileHover={{ scale: 1.01 }}
                  >
                    <button
                      onClick={() => toggleQuestion(catIndex, qIndex)}
                      className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-primary/5 transition-colors"
                    >
                      <span className="font-medium text-foreground pr-4">{faq.q}</span>
                      <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ChevronDown className="w-5 h-5 text-primary flex-shrink-0" />
                      </motion.div>
                    </button>

                    <motion.div
                      initial={false}
                      animate={{
                        height: isOpen ? 'auto' : 0,
                        opacity: isOpen ? 1 : 0,
                      }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-5 text-foreground/60 leading-relaxed border-t border-border/50 pt-4">
                        {faq.a}
                      </div>
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        ))}
      </section>

      {/* Contact CTA */}
      <section className="max-w-4xl mx-auto px-6 pb-24">
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
                Still have questions?
              </span>
            </h2>
            <p className="text-lg text-foreground/60 mb-8">
              Our team is here to help you get started with AXA-PRISM
            </p>
            <Button className="bg-gradient-to-r from-primary via-primary/90 to-success text-white px-10 py-6 text-base hover:shadow-xl hover:shadow-primary/20 transition-all">
              Contact Support
            </Button>
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
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
