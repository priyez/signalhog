"use client";

import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "success" | "warning" | "error" | "neutral";
  pulse?: boolean;
}

export function Badge({ children, variant = "neutral", pulse }: BadgeProps) {
  const getBadgeClass = () => {
    switch (variant) {
      case "success": return "badge-active";
      case "warning": return "badge-active"; // We use yellow for warning in CSS now
      case "error": return "badge-inactive";
      default: return "badge-inactive";
    }
  };

  const getDotStyle = () => {
    if (variant === "success") return { background: "var(--color-success)" };
    if (variant === "warning") return { background: "var(--color-warning)" };
    return {};
  };

  return (
    <span className={getBadgeClass()} style={variant === "warning" ? { color: "var(--color-warning)", background: "rgba(248, 190, 42, 0.1)" } : {}}>
      <span className={`badge-dot ${pulse ? 'badge-dot-pulse' : ''}`} style={getDotStyle()} />
      {children}
    </span>
  );
}
