"use client";

import Link from "next/link";
import React, { useState } from "react";
import { useSession } from "next-auth/react";

export function LandingHero() {
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";

  const [heroToggle, setHeroToggle] = useState(true);
  const [copiedPill, setCopiedPill] = useState(false);

  const handleCopyPill = () => {
    navigator.clipboard.writeText("npm install @signalhog/node");
    setCopiedPill(true);
    setTimeout(() => setCopiedPill(false), 2000);
  };

  return (
    <header className="hero-section">

      <h1 className="hero-title">
        Ship with confidence.<br />
        <span>Toggle with precision.</span>
      </h1>
      <p className="hero-subtitle">
        The high-performance, open-source feature flag and product analytics platform.
        Evaluate targeting rules locally in 100 microseconds, stream configurations instantly,
        and track product analytics on ClickHouse.
      </p>

      <div className="hero-actions">
        {isAuthenticated ? (
          <Link href="/dashboard" className="ln-btn btn-large">Go to Dashboard</Link>
        ) : (
          <>
            <Link href="/register" className="ln-btn btn-large">Start Building Free</Link>
            <div
              onClick={handleCopyPill}
              className="terminal-pill cursor-pointer group"
              title="Click to copy install command"
            >
              <span className="pill-dollar">$</span>
              <span className="pill-text">{copiedPill ? "Copied command!" : "npm install @signalhog/node"}</span>
              <div className="pill-copy-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" color="currentColor" className="text-zinc-500 group-hover:text-zinc-300">
                  <path d="M9 15C9 12.1716 9 10.7574 9.87868 9.87868C10.7574 9 12.1716 9 15 9L16 9C18.8284 9 20.2426 9 21.1213 9.87868C22 10.7574 22 12.1716 22 15V16C22 18.8284 22 20.2426 21.1213 21.1213C20.2426 22 18.8284 22 16 22H15C12.1716 22 10.7574 22 9.87868 21.1213C9 20.2426 9 18.8284 9 16L9 15Z" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"></path>
                  <path d="M16.9999 9C16.9975 6.04291 16.9528 4.51121 16.092 3.46243C15.9258 3.25989 15.7401 3.07418 15.5376 2.90796C14.4312 2 12.7875 2 9.5 2C6.21252 2 4.56878 2 3.46243 2.90796C3.25989 3.07417 3.07418 3.25989 2.90796 3.46243C2 4.56878 2 6.21252 2 9.5C2 12.7875 2 14.4312 2.90796 15.5376C3.07417 15.7401 3.25989 15.9258 3.46243 16.092C4.51121 16.9528 6.04291 16.9975 9 16.9999" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"></path>
                </svg>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Interactive Hero Showpiece ─────────────────────────────── */}
      <div className="hero-showpiece">
        <div className="showpiece-pane pane-settings">
          <div className="pane-header">
            <span className="window-dot red"></span>
            <span className="window-dot yellow"></span>
            <span className="window-dot green"></span>
            <span className="pane-title">Feature Configuration</span>
          </div>
          <div className="pane-content">
            <div className="flag-card-interactive">
              <div className="flag-meta">
                <span className="flag-id">new-signup-funnel</span>
                <span className="flag-badge">Targeting: ON</span>
              </div>

              <div className="flag-control-row">
                <span className="control-label">Status</span>
                <button
                  onClick={() => setHeroToggle(!heroToggle)}
                  className={`interactive-toggle-btn ${heroToggle ? 'active' : ''}`}
                >
                  <span className="toggle-thumb"></span>
                </button>
              </div>

              <div className="flag-rule-block">
                <span className="rule-title">Targeting Rule</span>
                <div className="rule-detail">
                  <code>IF email endsWith <strong>"@company.com"</strong></code>
                  <span className="arrow-down">↓</span>
                  <code>SERVE Variation: <strong>Beta-Portal</strong></code>
                </div>
              </div>

              <div className="rule-stats">
                <div className="stat-col">
                  <span className="stat-val">0.12ms</span>
                  <span className="stat-lbl">Avg Latency</span>
                </div>
                <div className="stat-col">
                  <span className="stat-val">100%</span>
                  <span className="stat-lbl">Rollout weight</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="showpiece-pane pane-terminal">
          <div className="pane-header">
            <span className="window-dot red"></span>
            <span className="window-dot yellow"></span>
            <span className="window-dot green"></span>
            <span className="pane-title">Developer ConsoleLogs</span>
          </div>
          <div className="pane-content terminal-content">
            <div className="terminal-line command">$ pnpm add @signalhog/node</div>
            <div className="terminal-line success">✔ Added @signalhog/node@1.0.0 in 1.4s</div>

            <div className="terminal-line command mt-12">$ node app.js</div>
            <div className="terminal-line success">[SignalHog] Info: Initializing SDK client...</div>
            <div className="terminal-line">[SignalHog] Info: Synchronized 4 feature flag definitions from local server.</div>

            {heroToggle ? (
              <>
                <div className="terminal-line warning mt-12">[active] RECEIVED CONFIG UPDATE: new-signup-funnel {"=>"} TRUE</div>
                <div className="terminal-line success">[eval] user_821 (US) evaluated flag in 0.15ms {"->"} serve Beta-Portal</div>
                <div className="terminal-line success animate-glow-text">[eval] user_409 (company.com) evaluated flag in 0.05ms {"->"} serve Beta-Portal (Target Match!)</div>
                <div className="terminal-line success">[capture] Captured event 'user_onboarded' (ClickHouse worker: 1.4ms)</div>
              </>
            ) : (
              <>
                <div className="terminal-line danger mt-12">[active] RECEIVED CONFIG UPDATE: new-signup-funnel {"=>"} FALSE</div>
                <div className="terminal-line muted">[eval] user_821 (US) evaluated flag in 0.11ms {"->"} serve Fallback Control</div>
                <div className="terminal-line muted">[eval] user_409 (company.com) evaluated flag in 0.04ms {"->"} serve Fallback Control</div>
                <div className="terminal-line muted">[capture] Captured event 'user_abandoned' (ClickHouse worker: 0.8ms)</div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
