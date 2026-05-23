"use client";

import React, { useState, useEffect } from "react";
import { LandingNav } from "@/components/landing/LandingNav";
import { LandingHero } from "@/components/landing/LandingHero";
import { LandingDeveloperSuite } from "@/components/landing/LandingDeveloperSuite";
import { LandingClickHousePipelines } from "@/components/landing/LandingClickHousePipelines";
import { LandingPlatformCTA } from "@/components/landing/LandingPlatformCTA";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { MobileWarningModal } from "@/components/landing/MobileWarningModal";
import './globals.css';

export default function LandingPage() {
  const [isMobileWarningOpen, setIsMobileWarningOpen] = useState(false);

  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      // Intercept mobile views only (< 768px wide)
      if (window.innerWidth >= 768) return;

      let target = e.target as HTMLElement | null;
      while (target && target.tagName !== "A" && target.tagName !== "BUTTON") {
        target = target.parentElement;
      }

      if (target) {
        // Intercept dashboard/login/register redirects
        const href = target.getAttribute("href");
        const onclick = target.getAttribute("onclick");
        
        if (
          (href && (href.startsWith("/login") || href.startsWith("/register") || href.startsWith("/dashboard") || href.includes("dashboard"))) ||
          (onclick && (onclick.includes("signIn") || onclick.includes("signOut")))
        ) {
          e.preventDefault();
          setIsMobileWarningOpen(true);
        }
      }
    };

    document.addEventListener("click", handleGlobalClick, true);
    return () => document.removeEventListener("click", handleGlobalClick, true);
  }, []);

  return (
    <div className="landing-shell">
      <LandingNav />
      <LandingHero />
      <LandingDeveloperSuite />
      <LandingClickHousePipelines />
      <LandingPlatformCTA />
      <LandingFooter />

      <MobileWarningModal 
        isOpen={isMobileWarningOpen} 
        onClose={() => setIsMobileWarningOpen(false)} 
      />
    </div>
  );
}
