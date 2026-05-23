"use client";

import React from "react";

interface ToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  disabled?: boolean;
  ariaLabel?: string;
}

export function Toggle({ enabled, onChange, disabled, ariaLabel }: ToggleProps) {
  return (
    <button
      type="button"
      className={`ln-toggle ${enabled ? "on" : ""}`}
      onClick={() => {
        if (!disabled) {
          onChange(!enabled);
        }
      }}
      disabled={disabled}
      aria-checked={enabled}
      role="switch"
      aria-label={ariaLabel || (enabled ? "Disable" : "Enable")}
      style={{ opacity: disabled ? 0.5 : 1, cursor: disabled ? "not-allowed" : "pointer" }}
    >
      <span className="ln-toggle-thumb" />
    </button>
  );
}
