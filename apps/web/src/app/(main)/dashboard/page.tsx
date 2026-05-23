"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";
import { useSession } from "next-auth/react";

type Project = { 
  id: string; 
  name: string; 
  createdAt: string;
  environments?: { id: string, name: string }[];
  _count?: { flags: number };
};

export default function ProjectsPage() {
  const { data: session } = useSession();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = localStorage.getItem("token") || "";
        if (!token) return;
        const data = await apiRequest("/projects", {}, token);
        setProjects(data);
        
        // If no projects, redirect to onboarding
        if (data.length === 0) {
          router.push("/onboarding");
          return;
        }
      } catch (err) {
        console.error("Failed to fetch projects:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, [router]);

  if (loading) {
    return (
      <div className="spinner-wrap">
        <div className="spinner" />
        Loading your workspace…
      </div>
    );
  }

  return (
    <div className="animate-fadein" style={{ maxWidth: 1200, margin: "0 auto", padding: "60px 24px" }}>
      <header style={{ marginBottom: 48, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 className="page-title" style={{ fontSize: 28, fontWeight: 600, marginBottom: 8 }}>Projects</h1>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 13, color: "var(--color-muted)" }}>{projects.length} Projects</span>
            <span style={{ color: "var(--color-border)" }}>|</span>
            <span style={{ fontSize: 13, color: "var(--color-muted)" }}>Sort By: Recent Activity</span>
          </div>
        </div>
        <button className="ln-btn" style={{ padding: "10px 24px", background: "var(--color-brand)" }} onClick={() => router.push("/onboarding")}>
          <span style={{ marginRight: 8 }}>+</span> New
        </button>
      </header>

      <div className="railway-grid">
        {projects.map((p) => (
          <div 
            key={p.id} 
            className="railway-card"
            onClick={() => {
              localStorage.setItem("selectedProjectId", p.id);
              router.push(`/project/${p.id}/home`);
            }}
          >
            <div className="railway-card-header">
              <h3 className="railway-project-name">{p.name}</h3>
            </div>
            
            <div className="railway-card-content">
              {/* Dynamic Environment Stack */}
              <div className="env-stack">
                {(p.environments || []).map((env, i) => (
                  <div key={env.id} className="env-pill" style={{ animationDelay: `${i * 0.1}s` }}>
                    <span 
                      className="env-dot" 
                      style={{ 
                        background: env.name === 'Production' ? '#10b981' : 
                                   env.name === 'Staging' ? 'var(--color-warning)' : 
                                   'rgba(255,255,255,0.2)',
                        boxShadow: (env.name === 'Production' || env.name === 'Staging') ? `0 0 8px ${env.name === 'Production' ? '#10b981' : 'var(--color-warning)'}` : 'none'
                      }} 
                    />
                    <span className="env-name">{env.name}</span>
                  </div>
                ))}
                {(!p.environments || p.environments.length === 0) && (
                  <p className="form-hint" style={{ margin: 0 }}>Initializing environments…</p>
                )}
              </div>

              {/* Ingestion Pulse Visual */}
              <div className="pulse-container">
                <div className="pulse-wave" />
                <div className="pulse-wave delayed" />
                <div className="pulse-core">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="railway-card-footer">
              <div className="railway-status">
                <span className="railway-dot" />
                production
              </div>
              <div className="railway-meta">
                {p._count?.flags || 0} Flags active
              </div>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .railway-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 24px;
        }
        .railway-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--color-border);
          border-radius: 12px;
          height: 220px;
          display: flex;
          flex-direction: column;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }
        .railway-card:hover {
          background: rgba(255, 255, 255, 0.04);
          border-color: rgba(255, 255, 255, 0.2);
          transform: translateY(-4px);
        }
        .railway-card-header {
          padding: 20px 24px 0;
        }
        .railway-project-name {
          font-size: 15px;
          font-weight: 600;
          color: #fff;
          margin: 0;
        }
        .railway-card-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 0 24px;
          gap: 16px;
        }
        .env-stack {
          display: flex;
          gap: 8px;
        }
        .env-pill {
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--color-border);
          padding: 4px 10px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          gap: 6px;
          animation: slideUp 0.4s ease forwards;
          opacity: 0;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .env-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }
        .env-name {
          font-size: 11px;
          font-weight: 500;
          color: var(--color-muted);
        }
        
        .pulse-container {
          position: absolute;
          right: 24px;
          bottom: 60px;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .pulse-core {
          width: 24px;
          height: 24px;
          background: rgba(255,255,255,0.05);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-brand);
          z-index: 2;
        }
        .pulse-wave {
          position: absolute;
          width: 100%;
          height: 100%;
          border: 1px solid var(--color-brand);
          border-radius: 50%;
          opacity: 0;
          animation: pulse 2s infinite;
        }
        .pulse-wave.delayed {
          animation-delay: 1s;
        }
        @keyframes pulse {
          0% { transform: scale(0.8); opacity: 0.5; }
          100% { transform: scale(2.5); opacity: 0; }
        }
        .railway-card-footer {
          padding: 0 24px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .railway-status {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: var(--color-muted);
        }
        .railway-dot {
          width: 6px;
          height: 6px;
          background: #10b981;
          border-radius: 50%;
          box-shadow: 0 0 8px rgba(16, 185, 129, 0.5);
        }
        .railway-meta {
          font-size: 11px;
          color: var(--color-muted);
          opacity: 0.7;
        }
      `}</style>
    </div>
  );
}
