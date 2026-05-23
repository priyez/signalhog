"use client";

import React from "react";
import ProjectSwitcher from "./ProjectSwitcher";

export function Topbar() {
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <ProjectSwitcher />
        <div className="topbar-actions">
          <button className="icon-btn" title="Notifications">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M8 1.5A4.5 4.5 0 003.5 6v3l-1 1.5h11L12.5 9V6A4.5 4.5 0 008 1.5z"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinejoin="round"
              />
              <path
                d="M6.5 12.5a1.5 1.5 0 003 0"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}

export default Topbar;
