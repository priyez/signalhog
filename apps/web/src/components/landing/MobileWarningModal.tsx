"use client";

import React, { useState } from "react";
import { PlatformLogo } from "@/components/PlatformLogo";

interface MobileWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileWarningModal({ isOpen, onClose }: MobileWarningModalProps) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    // Simulate premium API call
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1200);
  };

  return (
    <div className="mobile-modal-overlay" onClick={onClose}>
      <div className="mobile-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="mobile-modal-header">
          <PlatformLogo />
          <span className="logo-text">SignalHog</span>
        </div>

        {!submitted ? (
          <>
            <h3 className="mobile-modal-title">Desktop View Recommended</h3>
            <p className="mobile-modal-desc">
              The SignalHog evaluation console, rules engine, and real-time ClickHouse monitoring analytics require a high-density desktop viewport for full interactive capability.
            </p>

            <form onSubmit={handleSubmit} className="mobile-modal-form">
              <label className="mobile-form-label">Email me my workspace link</label>
              <div className="mobile-input-group">
                <input
                  type="email"
                  className="mobile-email-input"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button type="submit" className="mobile-submit-btn" disabled={loading}>
                  {loading ? "Sending..." : "Send Link"}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="mobile-modal-success">
            <div className="success-icon-circle">✓</div>
            <h3 className="mobile-modal-title">Workspace Link Sent!</h3>
            <p className="mobile-modal-desc">
              We've dispatched a magic onboarding link to <strong>{email}</strong>. Check your inbox when you're back at your computer!
            </p>
          </div>
        )}

        <button onClick={onClose} className="mobile-modal-close-btn">
          Continue exploring landing page
        </button>
      </div>

      <style jsx>{`
        .mobile-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(4, 4, 4, 0.85);
          backdrop-filter: blur(20px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          z-index: 9999;
          animation: fadeIn 0.2s ease-out;
        }

        .mobile-modal-content {
          background: #0c0c0e;
          border: 1px solid rgba(248, 190, 42, 0.15);
          border-radius: 16px;
          padding: 32px 24px;
          max-width: 420px;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.8), 0 0 40px rgba(248, 190, 42, 0.03);
          position: relative;
          animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .mobile-modal-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 24px;
          font-weight: 600;
        }

        .mobile-modal-title {
          font-size: 20px;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 12px;
          letter-spacing: -0.02em;
        }

        .mobile-modal-desc {
          font-size: 13px;
          color: #a1a1aa;
          line-height: 1.6;
          margin-bottom: 28px;
        }

        .mobile-modal-form {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 8px;
          margin-bottom: 24px;
        }

        .mobile-form-label {
          font-size: 11px;
          font-weight: 600;
          color: #71717a;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .mobile-input-group {
          display: flex;
          width: 100%;
          gap: 8px;
        }

        .mobile-email-input {
          flex: 1;
          height: 40px;
          background: #141416;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 8px;
          padding: 0 12px;
          color: #ffffff;
          font-size: 13px;
          transition: all 0.2s;
        }

        .mobile-email-input:focus {
          border-color: rgba(248, 190, 42, 0.4);
          outline: none;
        }

        .mobile-submit-btn {
          height: 40px;
          background: #f8be2a;
          color: #040404;
          font-size: 13px;
          font-weight: 600;
          border: none;
          border-radius: 8px;
          padding: 0 16px;
          cursor: pointer;
          transition: filter 0.2s;
        }

        .mobile-submit-btn:hover {
          filter: brightness(0.9);
        }

        .mobile-submit-btn:disabled {
          background: #27272a;
          color: #71717a;
          cursor: not-allowed;
        }

        .mobile-modal-success {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .success-icon-circle {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: rgba(74, 222, 128, 0.1);
          color: #4ade80;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          font-weight: bold;
          margin-bottom: 16px;
        }

        .mobile-modal-close-btn {
          background: transparent;
          border: none;
          color: #71717a;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: color 0.2s;
        }

        .mobile-modal-close-btn:hover {
          color: #a1a1aa;
          text-decoration: underline;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
