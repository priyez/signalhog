"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Monitor, ArrowLeft, Smartphone } from "lucide-react";

export function MobileBlockerWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const checkMobile = () => {
      // Check screen width (standard tablet/mobile breakpoint)
      const mobileWidth = window.innerWidth < 768;

      // Also check user agent for mobile devices
      const mobileAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );

      setIsMobile(mobileWidth || mobileAgent);
    };

    // Initial check
    checkMobile();

    // Listen to resize events
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Avoid hydration mismatch by waiting for mount
  if (!mounted) {
    return <div style={{ background: "#08090a", minHeight: "100vh" }} />;
  }

  // The landing page (/) is always viewable on both mobile and desktop.
  // Other pages (dashboard, settings, flags, login, register, etc.) are desktop-only.
  const isLandingPage = pathname === "/" || pathname === "/docs" || pathname.startsWith("/docs/");
  const shouldBlock = isMobile && !isLandingPage;

  if (shouldBlock) {
    return (
      <div className="mobile-blocker-bg">
        <div className="mobile-blocker-card animate-fadein">
          <div className="icon-wrapper">
            <Smartphone className="phone-icon" size={48} />
            <div className="cross-line" />
            <Monitor className="monitor-icon" size={24} />
          </div>

          <h1 className="blocker-title">Desktop Required</h1>
          <p className="blocker-desc">
            The SignalHog developer dashboard and configuration tools are designed for desktop screens to manage flags and analyze telemetry efficiently.
          </p>

          <div className="divider" />

          <button className="back-btn" onClick={() => router.push("/")}>
            <ArrowLeft size={16} style={{ marginRight: 8 }} />
            Back to Landing Page
          </button>
        </div>

        <style jsx>{`
          .mobile-blocker-bg {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: radial-gradient(circle at top, #0f172a 0%, #020617 100%);
            padding: 24px;
            color: #f8fafc;
            font-family: 'Inter', sans-serif;
          }
          
          .mobile-blocker-card {
            border: 0;
            border-radius: 20px;
            padding: 40px 24px;
            max-width: 400px;
            width: 100%;
            text-align: center;
          }

          .icon-wrapper {
            position: relative;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 96px;
            height: 96px;
            background: rgba(0, 199, 151, 0.05);
            border: 1px solid rgba(0, 199, 151, 0.15);
            border-radius: 50%;
            margin-bottom: 24px;
            color: var(--color-brand, #00c797);
            box-shadow: 0 0 30px rgba(0, 199, 151, 0.1);
          }

          .phone-icon {
            opacity: 0.8;
          }

          .monitor-icon {
            position: absolute;
            bottom: 16px;
            right: 16px;
            background: #020617;
            padding: 2px;
            border-radius: 4px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: #94a3b8;
          }

          .cross-line {
            position: absolute;
            width: 60%;
            height: 2px;
            background: #ef4444;
            transform: rotate(-45deg);
            border-radius: 2px;
            box-shadow: 0 0 10px rgba(239, 68, 68, 0.5);
          }

          .blocker-title {
            font-size: 24px;
            font-weight: 700;
            color: #ffffff;
            margin-bottom: 12px;
            letter-spacing: -0.02em;
          }

          .blocker-desc {
            font-size: 14px;
            line-height: 1.6;
            color: #94a3b8;
            margin-bottom: 24px;
          }

          .divider {
            height: 1px;
            background: rgba(255, 255, 255, 0.08);
            margin-bottom: 24px;
          }

          .back-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            padding: 12px 20px;
            background: var(--color-brand, #00c797);
            color: #020617;
            border: none;
            border-radius: 10px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
          }

          .back-btn:hover {
            transform: translateY(-1px);
            filter: brightness(1.05);
          }

          .back-btn:active {
            transform: translateY(0);
          }

          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }

          .animate-fadein {
            animation: fadeIn 0.4s ease-out forwards;
          }
        `}</style>
      </div>
    );
  }

  return <>{children}</>;
}
