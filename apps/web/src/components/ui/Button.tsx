"use client";

import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export function Button({ 
  children, 
  variant = "primary", 
  size = "md", 
  loading, 
  className = "", 
  disabled,
  ...props 
}: ButtonProps) {
  const baseStyles = "ln-btn"; // Use existing CSS classes
  const variantClass = variant !== "primary" ? `ln-btn-${variant}` : "";
  const sizeClass = size !== "md" ? `ln-btn-${size}` : "";

  return (
    <button
      className={`${baseStyles} ${variantClass} ${sizeClass} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div className="spinner" style={{ width: 12, height: 12 }} />
          {children}
        </span>
      ) : children}
    </button>
  );
}
