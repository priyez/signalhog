"use client";

import { useState } from "react";
import { PlatformLogo } from "@/components/PlatformLogo";
import Link from "next/link";
import { usePathname } from "next/navigation";

const DOCS_NAV = [
  {
    title: "Getting Started",
    items: [
      { title: "What is SignalHog?", href: "/docs" },
      { title: "Quickstart", href: "/docs/quickstart" },
    ],
  },
  {
    title: "SDK",
    items: [
      { title: "Installation", href: "/docs/sdk/installation" },
      { title: "Authentication", href: "/docs/sdk/authentication" },
      { title: "React SDK", href: "/docs/sdk/react" },
      { title: "Node.js SDK", href: "/docs/sdk/node" },
    ],
  },
  {
    title: "Core Concepts",
    items: [
      { title: "Feature Flags", href: "/docs/concepts/flags" },
      { title: "Environments", href: "/docs/concepts/environments" },
      { title: "Targeting Rules", href: "/docs/concepts/targeting" },
    ],
  },
];

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="docs-shell">
      {/* Top Header */}
      <header className="docs-header">
        <div className="docs-header-left">
          <button 
            className="mobile-menu-toggle" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--color-muted)',
              cursor: 'pointer',
              display: 'none',
              marginRight: '12px',
              padding: 0
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {isMobileMenuOpen ? (
                <>
                  <path d="M18 6L6 18" />
                  <path d="M6 6l12 12" />
                </>
              ) : (
                <>
                  <path d="M4 6h16" />
                  <path d="M4 12h16" />
                  <path d="M4 18h16" />
                </>
              )}
            </svg>
          </button>
          <Link href="/" className="docs-logo">
            <PlatformLogo />
            <span className="logo-text">SignalHog <span className="docs-badge">Docs</span></span>
          </Link>
        </div>
        <div className="docs-header-right">
          <Link href="/dashboard" className="docs-header-link">Dashboard</Link>
          <a href="https://github.com" target="_blank" className="docs-header-link">GitHub</a>
        </div>
      </header>

      <div className="docs-container">
        {/* Sidebar */}
        <aside className={`docs-sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
          <div className="docs-search">
            <div className="search-input-wrap">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
              </svg>
              <input type="text" placeholder="Search docs..." />
            </div>
          </div>

          <nav className="docs-nav">
            {DOCS_NAV.map((section) => (
              <div key={section.title} className="docs-nav-section">
                <h4 className="docs-nav-title">{section.title}</h4>
                <div className="docs-nav-items">
                  {section.items.map((item) => {
                    const active = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`docs-nav-item ${active ? 'active' : ''}`}
                      >
                        {item.title}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <main className="docs-content">
          <div className="docs-content-inner">
            {children}
          </div>
        </main>

        {/* Right TOC (Optional) */}
        <aside className="docs-toc">
          <div className="toc-title">On this page</div>
          <nav className="toc-nav">
            {/* Dynamic TOC would go here */}
            <a href="#overview">Overview</a>
            <a href="#why-it-exists">Why it exists</a>
          </nav>
        </aside>
      </div>

      <style jsx global>{`
        .docs-shell {
          min-height: 100vh;
          background: #000;
          color: #fff;
          font-family: var(--font-sans);
        }
        .docs-header {
          height: 60px;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
          position: sticky;
          top: 0;
          background: #000;
          z-index: 100;
        }
        .docs-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          color: #fff;
        }
        .docs-badge {
          font-size: 11px;
          background: rgba(255,255,255,0.1);
          padding: 2px 6px;
          border-radius: 4px;
          margin-left: 4px;
          color: var(--color-muted);
        }
        .docs-header-link {
          font-size: 13px;
          color: var(--color-muted);
          text-decoration: none;
          margin-left: 20px;
          transition: color 0.2s;
        }
        .docs-header-link:hover {
          color: #fff;
        }
        .docs-container {
          display: flex;
          max-width: 1400px;
          margin: 0 auto;
        }
        .docs-sidebar {
          width: 280px;
          padding: 32px 24px;
          height: calc(100vh - 60px);
          position: sticky;
          top: 60px;
          border-right: 1px solid rgba(255,255,255,0.05);
          overflow-y: auto;
        }
        .docs-search {
          margin-bottom: 32px;
        }
        .search-input-wrap {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          padding: 8px 12px;
          display: flex;
          align-items: center;
          gap: 10px;
          color: var(--color-muted);
        }
        .search-input-wrap input {
          background: none;
          border: none;
          color: #fff;
          font-size: 13px;
          width: 100%;
          outline: none;
        }
        .docs-nav-section {
          margin-bottom: 32px;
        }
        .docs-nav-title {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--color-muted);
          margin-bottom: 12px;
          font-weight: 600;
        }
        .docs-nav-items {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .docs-nav-item {
          font-size: 14px;
          color: var(--color-muted);
          text-decoration: none;
          padding: 6px 12px;
          border-radius: 6px;
          transition: all 0.2s;
        }
        .docs-nav-item:hover {
          color: #fff;
          background: rgba(255,255,255,0.05);
        }
        .docs-nav-item.active {
          color: #fff;
          background: rgba(255,255,255,0.1);
          font-weight: 500;
        }
        .docs-content {
          flex: 1;
          padding: 60px 80px;
          min-width: 0;
        }
        .docs-content-inner {
          max-width: 800px;
        }
        .docs-toc {
          width: 240px;
          padding: 60px 24px;
          height: calc(100vh - 60px);
          position: sticky;
          top: 60px;
        }
        .toc-title {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--color-muted);
          margin-bottom: 16px;
          font-weight: 600;
        }
        .toc-nav {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .toc-nav a {
          font-size: 13px;
          color: var(--color-muted);
          text-decoration: none;
          transition: color 0.2s;
        }
        .toc-nav a:hover {
          color: #fff;
        }

        /* Typography */
        .docs-content h1 { font-size: 40px; font-weight: 700; margin-bottom: 24px; color: #fff; }
        .docs-content h2 { font-size: 28px; font-weight: 600; margin-top: 48px; margin-bottom: 16px; color: #fff; }
        .docs-content p { font-size: 16px; line-height: 1.6; color: var(--color-muted); margin-bottom: 20px; }
        .docs-content ul { margin-bottom: 24px; padding-left: 20px; }
        .docs-content li { margin-bottom: 10px; color: var(--color-muted); line-height: 1.6; }
        .docs-content b, .docs-content strong { color: #fff; }
        .docs-content code { background: rgba(255,255,255,0.1); padding: 2px 4px; border-radius: 4px; font-family: var(--font-mono); font-size: 14px; }
        .docs-content pre { background: #111; padding: 20px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); margin: 24px 0; overflow-x: auto; }
        .docs-content pre code { background: none; padding: 0; color: #dcdcdc; }

        @media (max-width: 992px) {
          .docs-toc { display: none; }
          .docs-content { padding: 40px; }
        }

        @media (max-width: 768px) {
          .mobile-menu-toggle { display: block !important; }
          .docs-header-right { display: none; }
          .docs-container { flex-direction: column; }
          
          .docs-sidebar {
            width: 100%;
            height: auto;
            position: static;
            border-right: none;
            border-bottom: 1px solid rgba(255,255,255,0.05);
            display: none;
          }
          
          .docs-sidebar.open {
            display: block;
          }
          
          .docs-content {
            padding: 32px 16px;
          }
          
          .docs-content h1 { font-size: 32px; }
          .docs-content h2 { font-size: 24px; }
        }
      `}</style>
    </div>
  );
}
