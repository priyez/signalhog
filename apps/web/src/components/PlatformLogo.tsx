"use client";

import React, { useState } from "react";

interface PlatformLogoProps {
  size?: number;
  interactive?: boolean;
}

export function PlatformLogo({ size = 24, interactive = true }: PlatformLogoProps) {
  const [logoOn, setLogoOn] = useState(true);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      onClick={() => {
        if (interactive) setLogoOn(!logoOn);
      }}
      style={{ cursor: interactive ? "pointer" : "default", userSelect: "none" }}
    >
      <rect
        x="2"
        y="6"
        width="20"
        height="12"
        rx="6"
        fill={logoOn ? "var(--color-urgent, #f8be2a)" : "rgba(255, 255, 255, 0.15)"}
        style={{ transition: "fill 200ms ease" }}
      />
      <circle
        cx={logoOn ? 16 : 8}
        cy={12}
        r="4"
        fill="white"
        style={{ transition: "cx 200ms ease" }}
      />
    </svg>
  );
}
