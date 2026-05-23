"use client";

import React from "react";
import { PlatformLogo } from "@/components/PlatformLogo";

export function LandingFooter() {
  return (
    <footer className="landing-footer">
      <div className="footer-columns">
        <div className="footer-brand-col">
          <div className="landing-logo">
            <PlatformLogo />
            <span className="logo-text">SignalHog</span>
          </div>
          <p className="brand-slogan">Ship with confidence. Toggle with precision.</p>
        </div>

        <div className="footer-links-col">
          <h6>Product</h6>
          <a href="#features">Features</a>
          <a href="#developers">Developer Suite</a>
          <a href="#platforms">Integrations</a>
        </div>

        <div className="footer-links-col">
          <h6>Resources</h6>
          <a href="https://github.com/signalhog/signalhog" target="_blank" rel="noreferrer">GitHub</a>
          <a href="#cloud">SignalHost Cloud</a>
          <a href="/docs">Documentation</a>
        </div>

        <div className="footer-links-col">
          <h6>Platform</h6>
          <a href="/login">Dashboard Access</a>
          <a href="/register">Sign Up</a>
        </div>
      </div>

      <div className="footer-bottom">
        <span>&copy; 2026 SignalHog Inc. All rights reserved.</span>
        <span>Built with the Linear Design System.</span>
      </div>
    </footer>
  );
}
