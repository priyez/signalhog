"use client";

import React from "react";

type EmptyStateProps = {
  icon?: string;
  title: string;
  description: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
};

export function EmptyState({ icon, title, description, children, style }: EmptyStateProps) {
  return (
    <div className="empty-state" style={style}>
      {icon && <div className="empty-state-icon">{icon}</div>}
      <div className="empty-state-title">{title}</div>
      <div className="empty-state-desc">{description}</div>
      {children && <div className="empty-state-actions">{children}</div>}

      <style jsx>{`
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px 24px;
          text-align: center;
          background: var(--color-surface);
          border: 1px dashed var(--color-border);
          border-radius: 12px;
          width: 100%;
        }
        .empty-state-icon {
          font-size: 48px;
          margin-bottom: 16px;
          opacity: 0.8;
        }
        .empty-state-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--color-text);
          margin-bottom: 8px;
        }
        .empty-state-desc {
          font-size: 14px;
          color: var(--color-muted);
          max-width: 320px;
          line-height: 1.5;
        }
        .empty-state-actions {
          margin-top: 24px;
        }
      `}</style>
    </div>
  );
}
