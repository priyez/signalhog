"use client";

import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";

type ApiKey = {
  id: string;
  key: string;
  type: 'PUBLIC' | 'SECRET';
  name: string;
  lastUsedAt: string | null;
};

type Environment = {
  id: string;
  name: string;
  apiKeys: ApiKey[];
};

type Project = {
  id: string;
  name: string;
  environments: Environment[];
};

export default function SettingsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.projectId as string;
  const token = typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Environment Management
  const [isEnvModalOpen, setIsEnvModalOpen] = useState(false);
  const [editingEnv, setEditingEnv] = useState<Environment | null>(null);
  const [envName, setEnvName] = useState("");

  const loadProject = async () => {
    if (!token || !projectId) return;
    try {
      const data = await apiRequest(`/projects/${projectId}`, {}, token);
      setProject(data);
      setNewName(data.name);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProject();
  }, [projectId]);

  const handleUpdateProject = async () => {
    try {
      await apiRequest(`/projects/${projectId}`, {
        method: 'PATCH',
        body: JSON.stringify({ name: newName })
      }, token);
      loadProject();
      alert("Project updated!");
    } catch (err) {
      alert("Failed to update project");
    }
  };

  const handleDeleteProject = async () => {
    if (!confirm("Are you absolutely sure? This will delete all flags, environments, and data permanently.")) return;
    try {
      setIsDeleting(true);
      await apiRequest(`/projects/${projectId}`, { method: 'DELETE' }, token);
      router.push("/dashboard");
    } catch (err) {
      alert("Failed to delete project");
      setIsDeleting(false);
    }
  };

  const handleSaveEnv = async () => {
    try {
      if (editingEnv) {
        await apiRequest(`/environments/${editingEnv.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ name: envName })
        }, token);
      } else {
        await apiRequest(`/environments`, {
          method: 'POST',
          body: JSON.stringify({ projectId, name: envName })
        }, token);
      }
      setIsEnvModalOpen(false);
      loadProject();
    } catch (err) {
      alert("Failed to save environment");
    }
  };

  const handleDeleteEnv = async (id: string) => {
    if (!confirm("Delete this environment? All flags in this environment will be lost.")) return;
    try {
      await apiRequest(`/environments/${id}`, { method: 'DELETE' }, token);
      loadProject();
    } catch (err) {
      alert("Failed to delete environment");
    }
  };

  if (loading) return <div className="p-8 text-center"><div className="spinner" style={{margin:'0 auto'}} /></div>;
  if (!project) return <div>Project not found</div>;

  return (
    <div className="settings-container animate-fadein">
      <div className="page-header" style={{ marginBottom: 40 }}>
        <div>
          <h1 className="page-title">Project Settings</h1>
          <p className="page-subtitle">Manage your project configuration and environments.</p>
        </div>
      </div>

      <div className="settings-section">
        <h2 className="section-title">General Settings</h2>
        <div className="ln-card p-6">
          <div className="form-group" style={{ maxWidth: 400 }}>
            <label className="form-label">Project Name</label>
            <Input 
              value={newName} 
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Enter project name"
            />
          </div>
          <Button 
            variant="primary" 
            style={{ marginTop: 16 }} 
            onClick={handleUpdateProject}
            disabled={newName === project.name}
          >
            Update Name
          </Button>
        </div>
      </div>

      <div className="settings-section" style={{ marginTop: 48 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 className="section-title" style={{ marginBottom: 0 }}>Environments</h2>
          <Button variant="secondary" onClick={() => { setEditingEnv(null); setEnvName(""); setIsEnvModalOpen(true); }}>
            + Add Environment
          </Button>
        </div>
        
        <div className="env-grid">
          {project.environments.map(env => (
            <div key={env.id} className="ln-card env-card">
              <div className="env-header">
                <h3 className="env-name">{env.name}</h3>
                <div className="env-actions">
                  <button className="icon-btn" onClick={() => { setEditingEnv(env); setEnvName(env.name); setIsEnvModalOpen(true); }}>✎</button>
                  <button className="icon-btn delete" onClick={() => handleDeleteEnv(env.id)}>🗑</button>
                </div>
              </div>
              
              <div className="api-keys">
                <div className="key-group">
                  <label>Public Key</label>
                  <div className="key-row">
                    <code>{env.apiKeys.find(k => k.type === 'PUBLIC')?.key}</code>
                    <button onClick={() => navigator.clipboard.writeText(env.apiKeys.find(k => k.type === 'PUBLIC')?.key || "")}>📋</button>
                  </div>
                </div>
                <div className="key-group">
                  <label>Secret Key</label>
                  <div className="key-row">
                    <code className="blurred">{env.apiKeys.find(k => k.type === 'SECRET')?.key}</code>
                    <button onClick={() => navigator.clipboard.writeText(env.apiKeys.find(k => k.type === 'SECRET')?.key || "")}>📋</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="settings-section" style={{ marginTop: 64, borderTop: '1px solid rgba(235, 87, 87, 0.2)', paddingTop: 32 }}>
        <h2 className="section-title" style={{ color: 'var(--color-high)' }}>Danger Zone</h2>
        <div className="ln-card p-6" style={{ borderColor: 'rgba(235, 87, 87, 0.3)', background: 'rgba(235, 87, 87, 0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600, color: '#fff' }}>Delete this project</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>
                Once you delete a project, there is no going back. Please be certain.
              </div>
            </div>
            <Button variant="danger" onClick={handleDeleteProject} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete Project"}
            </Button>
          </div>
        </div>
      </div>

      {isEnvModalOpen && (
        <Modal 
          isOpen={isEnvModalOpen}
          title={editingEnv ? "Rename Environment" : "New Environment"} 
          onClose={() => setIsEnvModalOpen(false)}
        >
          <div className="p-6">
            <div className="form-group">
              <label className="form-label">Environment Name</label>
              <Input 
                value={envName} 
                onChange={(e) => setEnvName(e.target.value)}
                placeholder="e.g. Production, QA, Sandbox"
                autoFocus
              />
            </div>
            <div className="modal-actions" style={{ marginTop: 24, display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <Button variant="ghost" onClick={() => setIsEnvModalOpen(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleSaveEnv} disabled={!envName}>
                {editingEnv ? "Save Changes" : "Create Environment"}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      <style jsx>{`
        .section-title {
          font-size: 18px;
          font-weight: 600;
          color: #fff;
          margin-bottom: 16px;
        }
        .ln-card {
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: 12px;
        }
        .p-6 { padding: 24px; }
        
        .env-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 20px;
        }
        .env-card {
          padding: 20px;
        }
        .env-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 12px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .env-name {
          font-size: 15px;
          font-weight: 600;
          color: #fff;
          margin: 0;
        }
        .env-actions {
          display: flex;
          gap: 8px;
        }
        .icon-btn {
          background: none;
          border: none;
          color: var(--color-muted);
          cursor: pointer;
          font-size: 16px;
          padding: 4px;
          border-radius: 4px;
          transition: background 0.2s, color 0.2s;
        }
        .icon-btn:hover {
          background: rgba(255,255,255,0.05);
          color: #fff;
        }
        .icon-btn.delete:hover {
          color: var(--color-high);
          background: rgba(235, 87, 87, 0.1);
        }
        
        .api-keys {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .key-group label {
          display: block;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          color: var(--color-muted);
          margin-bottom: 6px;
          letter-spacing: 0.05em;
        }
        .key-row {
          display: flex;
          gap: 8px;
          align-items: center;
        }
        .key-row code {
          flex: 1;
          background: rgba(0,0,0,0.3);
          padding: 6px 10px;
          border-radius: 6px;
          font-size: 12px;
          color: var(--color-brand);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          border: 1px solid rgba(255,255,255,0.05);
        }
        .key-row code.blurred {
          filter: blur(4px);
          user-select: none;
          transition: filter 0.2s;
        }
        .key-row code.blurred:hover {
          filter: blur(0);
        }
        .key-row button {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 14px;
          padding: 4px;
          opacity: 0.6;
          transition: opacity 0.2s;
        }
        .key-row button:hover {
          opacity: 1;
        }
      `}</style>
    </div>
  );
}
