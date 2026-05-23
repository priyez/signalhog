"use client";

import React from "react";
import { signOut } from "next-auth/react";

interface UserDropdownProps {
  dropdownRef: React.RefObject<HTMLDivElement | null>;
  onOpenProfile: () => void;
  onOpenChangelogs: () => void;
  onCloseDropdown: () => void;
}

export function UserDropdown({
  dropdownRef,
  onOpenProfile,
  onOpenChangelogs,
  onCloseDropdown,
}: UserDropdownProps) {
  return (
    <div 
      ref={dropdownRef}
      className="user-dropdown animate-fadein"
      style={{
        position: "absolute",
        bottom: "calc(100% + 8px)",
        left: "8px",
        right: "8px",
        background: "rgba(10, 10, 10, 0.95)",
        backdropFilter: "blur(12px)",
        border: "1px solid var(--color-border-strong)",
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--shadow-popup)",
        padding: "6px",
        zIndex: 50,
        display: "flex",
        flexDirection: "column",
        gap: "2px"
      }}
    >
      <button
        onClick={() => {
          onOpenProfile();
          onCloseDropdown();
        }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "8px 10px",
          background: "none",
          border: "none",
          borderRadius: "var(--radius-md)",
          color: "var(--color-text)",
          fontSize: "13px",
          textAlign: "left",
          cursor: "pointer",
          transition: "background 100ms ease",
          width: "100%"
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        User Profile
      </button>

      <button
        onClick={() => {
          onOpenChangelogs();
          onCloseDropdown();
        }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "8px 10px",
          background: "none",
          border: "none",
          borderRadius: "var(--radius-md)",
          color: "var(--color-text)",
          fontSize: "13px",
          textAlign: "left",
          cursor: "pointer",
          transition: "background 100ms ease",
          width: "100%"
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
        Changelogs
      </button>

      <div style={{ height: "1px", background: "var(--color-border)", margin: "4px 2px" }} />

      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "8px 10px",
          background: "none",
          border: "none",
          borderRadius: "var(--radius-md)",
          color: "#ff4d4d",
          fontSize: "13px",
          textAlign: "left",
          cursor: "pointer",
          transition: "background 100ms ease",
          width: "100%"
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255, 77, 77, 0.1)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        Log Out
      </button>
    </div>
  );
}

export default UserDropdown;
