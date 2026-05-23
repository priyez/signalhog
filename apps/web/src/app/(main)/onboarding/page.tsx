"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { projectsApi } from "@/lib/api";

export default function OnboardingPage() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token") || "";
      const project = await projectsApi.create(name, token);
      localStorage.setItem("selectedProjectId", project.id);
      if (project.environments?.length > 0) {
        localStorage.setItem("selectedEnvironmentId", project.environments[0].id);
      }
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="onboarding-wrap">
      <div className="onboarding-card">
        <div className="onboarding-header">
          <div className="onboarding-icon">✨</div>
          <h1 className="onboarding-title">Welcome to SignalHog</h1>
          <p className="onboarding-subtitle">Let&apos;s start by creating your first project.</p>
        </div>

        {error && <div className="form-error">{error}</div>}

        <form onSubmit={handleCreate}>
          <div className="form-group">
            <label className="form-label" htmlFor="name">Project Name</label>
            <input
              id="name"
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. My Awesome App"
              className="ln-input"
              style={{ fontSize: "16px", padding: "12px 16px" }}
            />
            <p className="form-hint">You can always change this later in settings.</p>
          </div>

          <button 
            type="submit" 
            disabled={loading || !name} 
            className="ln-btn" 
            style={{ width: "100%", height: "48px", fontSize: "15px" }}
          >
            {loading ? "Creating…" : "Create Project"}
          </button>
        </form>
      </div>

      <style jsx>{`
        .onboarding-wrap {
          min-height: calc(100vh - 120px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }
        .onboarding-card {
          width: 100%;
          max-width: 440px;
          animation: fadeIn 0.4s ease-out;
        }
        .onboarding-header {
          text-align: center;
          margin-bottom: 32px;
        }
        .onboarding-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }
        .onboarding-title {
          font-size: 28px;
          font-weight: 700;
          color: var(--color-text);
          letter-spacing: -0.02em;
          margin-bottom: 8px;
        }
        .onboarding-subtitle {
          font-size: 15px;
          color: var(--color-muted);
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
