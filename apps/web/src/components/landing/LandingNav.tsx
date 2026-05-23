"use client";

import Link from "next/link";
import React from "react";
import { useSession } from "next-auth/react";
import { PlatformLogo } from "@/components/PlatformLogo";

export function LandingNav() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";

  return (
    <nav className="landing-nav">
      <div className="landing-logo">
        <PlatformLogo />
        <span className="logo-text">SignalHog</span>
      </div>

      <div className="nav-middle-links">
        <a href="#features" className="nav-link">Features</a>
        <a href="#developers" className="nav-link">Developer Suite</a>
      </div>

      <div className="nav-links">
        <a
          href="https://github.com/signalhog/signalhog"
          target="_blank"
          rel="noreferrer"
          className="github-star-badge"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.786 1.4 8.168L12 18.896l-7.334 3.857 1.4-8.168L.132 9.21l8.2-1.192L12 .587z" />
          </svg>
          <span>Star 1.2k</span>
        </a>

        {isAuthenticated ? (
          <Link href="/dashboard" className="ln-btn btn-small">Dashboard</Link>
        ) : (
          <>
            <Link href="/login" className="nav-link">Log in</Link>
            <Link href="/register" className="ln-btn btn-small">Get Started</Link>
          </>
        )}
      </div>
    </nav>
  );
}
