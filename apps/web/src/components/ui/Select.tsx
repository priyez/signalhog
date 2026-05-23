"use client";

import React from "react";

interface Option {
  value: string;
  label: string;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'options'> {
  options: Option[];
  label?: string;
  hint?: string;
  error?: string;
  inline?: boolean;
}

export function Select({ options, label, hint, error, inline, className = "", ...props }: SelectProps) {
  const content = (
    <>
      {label && <label className="form-label">{label}</label>}
      <select
        className={`ln-input ${error ? "error" : ""} ${className}`}
        style={{ cursor: "pointer", appearance: "none" }} // Standardize appearance
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error ? (
        <p className="form-error-text" style={{ color: "var(--color-high)", fontSize: 11, marginTop: 4 }}>{error}</p>
      ) : hint ? (
        <p className="form-hint">{hint}</p>
      ) : null}
    </>
  );

  if (inline) {
    return content;
  }

  return (
    <div className="form-group" style={{ width: "100%" }}>
      {content}
    </div>
  );
}
