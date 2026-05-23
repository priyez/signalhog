"use client";

import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  inline?: boolean;
}

export function Input({ label, hint, error, inline, className = "", ...props }: InputProps) {
  const content = (
    <>
      {label && <label className="form-label">{label}</label>}
      <input
        className={`ln-input ${error ? "error" : ""} ${className}`}
        {...props}
      />
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
