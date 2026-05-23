"use client";

import React from "react";

export function LandingClickHousePipelines() {
  return (
    <section className="pipelines-section">
      <h2 className="section-pretitle">data warehousing</h2>
      <h3 className="section-title">High-volume ClickHouse pipelines</h3>
      <p className="pipelines-desc">
        Capture impressions, flag performance, and click events inside ClickHouse.
        Create analytical conversion funnels instantly with zero performance impact.
      </p>

      <div className="pipelines-visual-card">
        <div className="visual-header">
          <span className="chart-title">Real-time Ingestion Load</span>
          <div className="chart-actions">
            <span className="chart-legend-dot color-gold"></span> Ingestion Stream
            <span className="chart-legend-dot color-muted ml-12"></span> Fallback cache
          </div>
        </div>
        <div className="visual-chart-body">
          <svg viewBox="0 0 800 200" className="visual-chart-svg">
            <defs>
              <linearGradient id="chart-glow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-urgent)" stopOpacity="0.25" />
                <stop offset="100%" stopColor="var(--color-urgent)" stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* Grid Lines */}
            <line x1="0" y1="50" x2="800" y2="50" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
            <line x1="0" y1="100" x2="800" y2="100" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
            <line x1="0" y1="150" x2="800" y2="150" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />

            {/* Glow Area */}
            <path
              d="M0,180 L80,140 L160,160 L240,110 L320,130 L400,70 L480,90 L560,50 L640,65 L720,20 L800,40 L800,200 L0,200 Z"
              fill="url(#chart-glow)"
            />

            {/* Chart Path */}
            <path
              d="M0,180 L80,140 L160,160 L240,110 L320,130 L400,70 L480,90 L560,50 L640,65 L720,20 L800,40"
              fill="none"
              stroke="var(--color-urgent)"
              strokeWidth="2.5"
              style={{ strokeDasharray: "1000", strokeDashoffset: "0" }}
            />

            {/* Interactive Dots */}
            <circle cx="400" cy="70" r="4.5" fill="white" stroke="var(--color-urgent)" strokeWidth="2" />
            <circle cx="720" cy="20" r="4.5" fill="white" stroke="var(--color-urgent)" strokeWidth="2" />
          </svg>
          <div className="chart-axis-labels">
            <span>08:20 AM</span>
            <span>08:22 AM</span>
            <span>08:24 AM</span>
            <span>08:26 AM</span>
            <span>08:28 AM</span>
          </div>
        </div>
      </div>
    </section>
  );
}
