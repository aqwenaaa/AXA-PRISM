"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/app/components/ui/button";
import { motion } from "motion/react";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 glass backdrop-blur-xl border-b border-border">
      <div className="max-w-7xl mx-auto px-6 py-4 grid grid-cols-3 items-center">

        {/* LEFT - Logo */}
        <Link href="/">
        <motion.div
            className="flex items-center gap-3 justify-start cursor-pointer"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
        >
            <Image
            src="/assets/logo.png"
            alt="AXA PRISM Logo"
            width={42}
            height={42}
            />
            <span className="text-xl font-semibold bg-gradient-to-r from-primary to-success bg-clip-text text-transparent">
            AXA-PRISM
            </span>
        </motion.div>
        </Link>

        {/* CENTER - Menu (true center) */}
        <motion.div
          className="hidden md:flex items-center justify-center gap-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Link href="/#solutions" className="text-sm text-foreground/70 hover:text-foreground">
            Solutions
          </Link>

          <Link href="/healthcare" className="text-sm text-foreground/70 hover:text-foreground">
            Healthcare
          </Link>

          <Link href="/about-axa" className="text-sm text-foreground/70 hover:text-foreground">
            About AXA
          </Link>

          <Link href="/security" className="text-sm text-foreground/70 hover:text-foreground">
            Security
          </Link>

          <Link href="/faq" className="text-sm text-foreground/70 hover:text-foreground">
            FAQ
          </Link>
        </motion.div>

        {/* RIGHT - Login */}
        <div className="flex justify-end">
          <Link href="/login" className="hidden md:flex">
            <Button className="bg-gradient-to-r from-primary to-success text-white px-6 py-2 rounded-full">
              Login
            </Button>
          </Link>
        </div>

      </div>
    </nav>
  );
}