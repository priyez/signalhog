"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { apiRequest } from "@/lib/api";
import { EnvironmentProvider, useEnvironment } from "@/contexts/EnvironmentContext";
import Topbar from "@/components/Topbar";
import SidebarNav from "@/components/SidebarNav";
import { AgentSidebar } from "@/components/AgentSidebar";
import UserDropdown from "@/components/UserDropdown";

function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const isLobby = pathname === "/dashboard" || pathname === "/onboarding";
  const { environmentId } = useEnvironment();
  const projectIdMatch = pathname.match(/\/project\/([^\/]+)/);
  const projectId = projectIdMatch ? projectIdMatch[1] : "";

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isChangelogsOpen, setIsChangelogsOpen] = useState(false);
  const [isFooterHovered, setIsFooterHovered] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated" && pathname !== "/onboarding") {
      const checkProjects = async () => {
        try {
          const token = localStorage.getItem("token") || "";
          const projects = await apiRequest("/projects", {}, token);
          
          if (projects.length === 0) {
            router.push("/onboarding");
            return;
          }

          // If on a generic path like /dashboard or / (though / is landing), 
          // redirect to the first project - but EXEMPT the project list itself!
          if (!pathname.includes("/project/") && pathname !== "/dashboard") {
            const lastId = localStorage.getItem("selectedProjectId") || (projects.length > 0 ? projects[0].id : null);
            if (lastId) router.push(`/project/${lastId}/home`);
          }
        } catch (err) {
          console.error("Failed to check projects:", err);
        }
      };
      checkProjects();
    }
  }, [status, router, pathname]);

  if (status === "loading") {
    return (
      <div className="spinner-wrap">
        <div className="spinner" />
        Loading workspace…
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="app-shell">
      {/* ── Sidebar ──────────────────────────────────────────────── */}
      {!isLobby && (
        <aside className="sidebar">
          <div className="sidebar-inner">
            <div className="sidebar-logo" style={{ gap: '8px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="6" width="20" height="12" rx="6" fill="var(--color-urgent, #f8be2a)" />
                <circle cx="16" cy="12" r="4" fill="white" />
              </svg>
              <span className="logo-text">SignalHog</span>
            </div>

            {/* Navigation */}
            <SidebarNav />

            {/* User Footer */}
            <div className="sidebar-footer" style={{ position: "relative" }}>
              <div 
                className="user-row"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                onMouseEnter={() => setIsFooterHovered(true)}
                onMouseLeave={() => setIsFooterHovered(false)}
                style={{ 
                  cursor: "pointer", 
                  transition: "background 150ms ease",
                  background: isDropdownOpen || isFooterHovered ? "rgba(255, 255, 255, 0.05)" : "transparent"
                }}
              >
                <div className="user-avatar" style={{ overflow: 'hidden' }}>
                  {session.user?.image ? (
                    <img 
                      src={session.user.image} 
                      alt={session.user.name || "User"} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    session.user?.name?.[0] || session.user?.email?.[0] || "U"
                  )}
                </div>
                <div className="user-info">
                  <div className="user-name">{session.user?.name || "User"}</div>
                  <div className="user-email">{session.user?.email}</div>
                </div>
              </div>

              {/* Dropdown Pop-up Menu */}
              {isDropdownOpen && (
                <UserDropdown
                  dropdownRef={dropdownRef}
                  onOpenProfile={() => setIsProfileOpen(true)}
                  onOpenChangelogs={() => setIsChangelogsOpen(true)}
                  onCloseDropdown={() => setIsDropdownOpen(false)}
                />
              )}
            </div>
          </div>
        </aside>
      )}

      {/* ── Main ─────────────────────────────────────────────────── */}
      <main className="main-content" style={{ paddingLeft: isLobby ? 0 : undefined }}>
        {/* Top Bar */}
        {!isLobby && <Topbar />}

        {/* Page */}
        <div className="page-content">{children}</div>
      </main>

      {/* ── Agent Sidebar ───────────────────────────────────────── */}
      {!isLobby && <AgentSidebar projectId={projectId} environmentId={environmentId} />}

      {/* ── User Profile Modal ───────────────────────────────────── */}
      {isProfileOpen && (
        <div className="modal-backdrop" style={{ zIndex: 100 }} onClick={() => setIsProfileOpen(false)}>
          <div 
            className="modal" 
            style={{ 
              maxWidth: "400px", 
              background: "rgba(10, 10, 10, 0.95)", 
              backdropFilter: "blur(20px)",
              border: "1px solid var(--color-border-strong)",
              borderRadius: "16px",
              padding: "24px",
              boxShadow: "var(--shadow-modal)",
              marginTop: "10%"
            }} 
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 600, color: "var(--color-text)" }}>User Profile</h3>
              <button 
                onClick={() => setIsProfileOpen(false)}
                style={{ background: "none", border: "none", color: "var(--color-muted)", cursor: "pointer", fontSize: "18px" }}
              >
                &times;
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
              <div 
                style={{ 
                  width: "80px", 
                  height: "80px", 
                  borderRadius: "50%", 
                  background: "var(--color-brand)", 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center",
                  fontSize: "32px",
                  fontWeight: 600,
                  color: "#000",
                  overflow: "hidden",
                  border: "2px solid var(--color-border-strong)"
                }}
              >
                {session.user?.image ? (
                  <img 
                    src={session.user.image} 
                    alt={session.user.name || "User"} 
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  session.user?.name?.[0] || session.user?.email?.[0] || "U"
                )}
              </div>

              <div style={{ textAlign: "center" }}>
                <h4 style={{ fontSize: "18px", fontWeight: 600, color: "var(--color-text)", marginBottom: "4px" }}>
                  {session.user?.name || "SignalHog User"}
                </h4>
                <p style={{ fontSize: "13px", color: "var(--color-muted)" }}>
                  {session.user?.email}
                </p>
              </div>
            </div>

            <div style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid var(--color-border)", borderRadius: "8px", padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                <span style={{ color: "var(--color-muted)" }}>Account Status</span>
                <span style={{ color: "#22c55e", fontWeight: 500, display: "flex", alignItems: "center", gap: "4px" }}>
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#22c55e" }} />
                  Active
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                <span style={{ color: "var(--color-muted)" }}>Role</span>
                <span style={{ color: "var(--color-text)", fontWeight: 500 }}>Administrator</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                <span style={{ color: "var(--color-muted)" }}>Workspace</span>
                <span style={{ color: "var(--color-text)", fontWeight: 500 }}>Personal Workspace</span>
              </div>
            </div>

            <button 
              onClick={() => setIsProfileOpen(false)}
              className="ln-btn"
              style={{ width: "100%", marginTop: "24px", background: "var(--color-brand)", color: "#000", fontWeight: 500 }}
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* ── User Changelogs Modal ────────────────────────────────── */}
      {isChangelogsOpen && (
        <div className="modal-backdrop" style={{ zIndex: 100 }} onClick={() => setIsChangelogsOpen(false)}>
          <div 
            className="modal" 
            style={{ 
              maxWidth: "500px", 
              background: "rgba(10, 10, 10, 0.95)", 
              backdropFilter: "blur(20px)",
              border: "1px solid var(--color-border-strong)",
              borderRadius: "16px",
              padding: "24px",
              boxShadow: "var(--shadow-modal)",
              marginTop: "5%"
            }} 
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "var(--color-urgent)" }}>
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
                <h3 style={{ fontSize: "16px", fontWeight: 600, color: "var(--color-text)" }}>Product Changelog</h3>
              </div>
              <button 
                onClick={() => setIsChangelogsOpen(false)}
                style={{ background: "none", border: "none", color: "var(--color-muted)", cursor: "pointer", fontSize: "18px" }}
              >
                &times;
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxHeight: "350px", overflowY: "auto", paddingRight: "8px", margin: "16px 0" }}>
              
              {/* Release 1 */}
              <div style={{ borderLeft: "2px solid var(--color-border)", paddingLeft: "16px", position: "relative" }}>
                <div style={{ 
                  position: "absolute", 
                  left: "-5px", 
                  top: "2px", 
                  width: "8px", 
                  height: "8px", 
                  borderRadius: "50%", 
                  background: "var(--color-urgent)" 
                }} />
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                  <span style={{ fontSize: "12px", fontWeight: 600, background: "rgba(248, 190, 42, 0.15)", color: "var(--color-urgent)", padding: "2px 6px", borderRadius: "4px" }}>
                    v1.2.0
                  </span>
                  <span style={{ fontSize: "11px", color: "var(--color-muted-2)" }}>May 17, 2026</span>
                </div>
                <h4 style={{ fontSize: "14px", fontWeight: 600, color: "var(--color-text)", marginBottom: "4px" }}>
                  AI Chat Assistant Integration 🤖
                </h4>
                <p style={{ fontSize: "13px", color: "var(--color-muted)", lineHeight: "1.4" }}>
                  We integrated an AI assistant into the SignalHog dashboard! Ask questions about your flags, get code integration snippets instantly, or debug targeting rules without leaving the app.
                </p>
              </div>

              {/* Release 2 */}
              <div style={{ borderLeft: "2px solid var(--color-border)", paddingLeft: "16px", position: "relative" }}>
                <div style={{ 
                  position: "absolute", 
                  left: "-5px", 
                  top: "2px", 
                  width: "8px", 
                  height: "8px", 
                  borderRadius: "50%", 
                  background: "var(--color-muted-2)" 
                }} />
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                  <span style={{ fontSize: "12px", fontWeight: 600, background: "rgba(255, 255, 255, 0.08)", color: "var(--color-text)", padding: "2px 6px", borderRadius: "4px" }}>
                    v1.1.0
                  </span>
                  <span style={{ fontSize: "11px", color: "var(--color-muted-2)" }}>May 14, 2026</span>
                </div>
                <h4 style={{ fontSize: "14px", fontWeight: 600, color: "var(--color-text)", marginBottom: "4px" }}>
                  Social Authentication & Security 🔒
                </h4>
                <p style={{ fontSize: "13px", color: "var(--color-muted)", lineHeight: "1.4" }}>
                  Added seamless Social Authentication (Google and GitHub via NextAuth) along with environment-specific api key rotation and robust schema security updates.
                </p>
              </div>

              {/* Release 3 */}
              <div style={{ borderLeft: "2px solid var(--color-border)", paddingLeft: "16px", position: "relative" }}>
                <div style={{ 
                  position: "absolute", 
                  left: "-5px", 
                  top: "2px", 
                  width: "8px", 
                  height: "8px", 
                  borderRadius: "50%", 
                  background: "var(--color-muted-2)" 
                }} />
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                  <span style={{ fontSize: "12px", fontWeight: 600, background: "rgba(255, 255, 255, 0.08)", color: "var(--color-text)", padding: "2px 6px", borderRadius: "4px" }}>
                    v1.0.0
                  </span>
                  <span style={{ fontSize: "11px", color: "var(--color-muted-2)" }}>May 12, 2026</span>
                </div>
                <h4 style={{ fontSize: "14px", fontWeight: 600, color: "var(--color-text)", marginBottom: "4px" }}>
                  SignalHog Core Platform Launch 🚀
                </h4>
                <p style={{ fontSize: "13px", color: "var(--color-muted)", lineHeight: "1.4" }}>
                  Initial launch of SignalHog! Fully functional multi-tenant project management, custom targeting rules, live SDK streaming connections, and environment context toggling.
                </p>
              </div>

            </div>

            <button 
              onClick={() => setIsChangelogsOpen(false)}
              className="ln-btn"
              style={{ width: "100%", marginTop: "12px", background: "var(--color-brand)", color: "#000", fontWeight: 500 }}
            >
              Close
            </button>
          </div>
        </div>
      )}
      </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <EnvironmentProvider>
      <DashboardShell>{children}</DashboardShell>
    </EnvironmentProvider>
  );
}
