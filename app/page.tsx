"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-6 py-12 text-center">
      {/* --- BACKGROUND EFFECTS --- */}
      {/* Grid Pattern*/}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#8d40ec08_1px,transparent_1px),linear-gradient(to_bottom,#c12bcf08_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      {/* Amethyst Radial Glow*/}
      <div className="absolute -top-[5%] left-1/2 z-0 h-[300px] w-[300px] sm:h-[500px] sm:w-[500px] -translate-x-1/2 rounded-full bg-primary/15 blur-[80px] sm:blur-[120px] will-change-transform" />

      {/* --- CONTENT --- */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        className="relative z-10 flex w-full max-w-3xl flex-col items-center gap-6 sm:gap-8"
      >
        {/* Badge*/}
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 sm:px-4 sm:py-1.5 text-xs sm:text-sm font-medium text-primary backdrop-blur-md">
          <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={2} />
          <span className="tracking-wide">
            Real-time communication, redefined.
          </span>
        </div>

        <div className="space-y-3 sm:space-y-4">
          <h1 className="text-6xl font-extrabold tracking-tighter sm:text-7xl text-heading">
            Relay<span className="text-primary">.</span>
          </h1>

          <div className="mx-auto max-w-[280px] space-y-2 text-md leading-relaxed text-subheading sm:max-w-[500px] sm:text-xl">
            <p>Experience the next generation of messaging.</p>
            <p className="text-heading font-semibold tracking-tight">
              Fast. &nbsp;Secure. &nbsp;Smooth.
            </p>
          </div>
        </div>

        {/* Action Buttons*/}
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-[280px] sm:max-w-none sm:w-auto">
          <Button
            size="lg"
            className="h-12 w-full sm:w-auto px-8 text-base shadow-[0_0_20px_rgba(168,85,247,0.25)] hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] transition-all duration-300 transform hover:scale-105"
            asChild
          >
            <Link
              href="/sign-up"
              className="flex items-center justify-center gap-2"
            >
              Get Started <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="h-12 w-full sm:w-auto px-8 text-base border-white/10 hover:border-primary/50 hover:text-primary bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all transform hover:scale-105"
            asChild
          >
            <Link href="/sign-in" className="flex items-center justify-center">
              Sign In
            </Link>
          </Button>
        </div>
      </motion.div>

      {/* Footer */}
      <footer className="absolute bottom-6 sm:bottom-8 z-10 w-full px-6 text-[10px] uppercase tracking-[0.2em] text-subheading/40">
        &copy; 2026 Relay Protocol
      </footer>
    </main>
  );
}
