"use client";

import React, { useState, useRef, useEffect } from "react";

interface DropdownMenuProps {
  items: {
    label: string;
    onClick: () => void;
    variant?: "default" | "danger";
  }[];
}

export function DropdownMenu({ items }: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.addEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="dropdown-container" ref={menuRef}>
      <button 
        className="dropdown-trigger" 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Actions menu"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <circle cx="8" cy="3" r="1.5" />
          <circle cx="8" cy="8" r="1.5" />
          <circle cx="8" cy="13" r="1.5" />
        </svg>
      </button>

      {isOpen && (
        <div className="dropdown-popup">
          {items.map((item, i) => (
            <button
              key={i}
              className={`dropdown-item ${item.variant === "danger" ? "danger" : ""}`}
              onClick={() => {
                setIsOpen(false);
                item.onClick();
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}

      <style jsx>{`
        .dropdown-container {
          position: relative;
          display: inline-block;
        }
        .dropdown-trigger {
          background: transparent;
          border: none;
          color: var(--color-muted);
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 150ms ease, color 150ms ease;
        }
        .dropdown-trigger:hover, .dropdown-trigger:focus {
          background: rgba(255, 255, 255, 0.05);
          color: var(--color-text);
        }
        .dropdown-popup {
          position: absolute;
          right: 0;
          top: 100%;
          margin-top: 4px;
          background: var(--color-bg);
          border: 1px solid var(--color-border);
          border-radius: 6px;
          padding: 4px;
          min-width: 140px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.5);
          z-index: 50;
          display: flex;
          flex-direction: column;
        }
        .dropdown-item {
          background: transparent;
          border: none;
          padding: 8px 12px;
          text-align: left;
          font-size: 13px;
          color: var(--color-text);
          cursor: pointer;
          border-radius: 4px;
          transition: background 150ms ease;
        }
        .dropdown-item:hover {
          background: rgba(255, 255, 255, 0.05);
        }
        .dropdown-item.danger {
          color: #ff4444;
        }
        .dropdown-item.danger:hover {
          background: rgba(255, 68, 68, 0.1);
        }
      `}</style>
    </div>
  );
}
