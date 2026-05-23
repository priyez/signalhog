"use client";

import Link from "next/link";
import React from "react";

export function LandingPlatformCTA() {
  return (
    <section id="cloud" className="open-source-cta">
      <div className="os-container">
        <div className="os-left">
          <h3>SignalHog</h3>
          <p>
            SignalHog is an open-source feature flag platform built for performance, security, and developer experience. Deploy it on your own infrastructure or use our managed cloud platform for instant global deployment with zero maintenance.
          </p>
          <div className="os-actions">
            <Link href="/register" className="ln-btn btn-small btn-outline" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
              Create Free Account
            </Link>
          </div>
        </div>
        <div className="os-right">
          <div className="os-badge-grid">
            <div className="os-badge-item">
              <span className="os-badge-title">Projects & Environments</span>
              <span className="os-badge-desc">Organize flags by project with Dev, Staging, and Production environments.</span>
            </div>
            <div className="os-badge-item">
              <span className="os-badge-title">Percentage Rollouts</span>
              <span className="os-badge-desc">Deterministic hashing ensures consistent user experiences during gradual rollouts.</span>
            </div>
            <div className="os-badge-item">
              <span className="os-badge-title">SDK API Keys</span>
              <span className="os-badge-desc">Scoped per-environment API keys for secure and simple SDK access control.</span>
            </div>
            <div className="os-badge-item">
              <span className="os-badge-title">Node.js SDK Client</span>
              <span className="os-badge-desc">Drop-in server client with local in-memory caching and background poll updates.</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
