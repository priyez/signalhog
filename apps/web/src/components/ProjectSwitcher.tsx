"use client";

import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/api";
import { useRouter, useParams, usePathname } from "next/navigation";
import { useEnvironment } from "@/contexts/EnvironmentContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

type Environment = { id: string; name: string; projectId: string };
type Project = { id: string; name: string; environments: Environment[] };

export default function ProjectSwitcher() {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const isFlagsPage = pathname?.endsWith("/flags");
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const { environmentId: selectedEnvId, setEnvironmentId: setSelectedEnvId } = useEnvironment();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = localStorage.getItem("token") || "";
        if (!token) return;
        const data = await apiRequest("/projects", {}, token);
        setProjects(data);
        
        // Sync with URL if possible
        if (params?.projectId) {
          setSelectedProjectId(params.projectId as string);
          
          const p = data.find((p: any) => p.id === params.projectId);
          if (p?.environments?.length) {
            const savedEnv = localStorage.getItem("selectedEnvironmentId");
            const currentEnv = p.environments.find((e: any) => e.id === savedEnv) || p.environments[0];
            setSelectedEnvId(currentEnv.id);
            localStorage.setItem("selectedEnvironmentId", currentEnv.id);
          }
        } else if (data.length > 0) {
          setSelectedProjectId(data[0].id);
          if (data[0].environments.length > 0) {
            setSelectedEnvId(data[0].environments[0].id);
            localStorage.setItem("selectedEnvironmentId", data[0].environments[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to fetch projects:", err);
      }
    };
    fetchProjects();
  }, [params?.projectId]);

  const [showModal, setShowModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("token") || "";
      const p = await apiRequest("/projects", {
        method: "POST",
        body: JSON.stringify({ name: newProjectName }),
        headers: { Authorization: `Bearer ${token}` },
      });
      setProjects([...projects, p]);
      setSelectedProjectId(p.id);
      if (p.environments?.length) setSelectedEnvId(p.environments[0].id);
      setShowModal(false);
      setNewProjectName("");
    } catch (err) {
      console.error("Failed to create project:", err);
    } finally {
      setLoading(false);
    }
  };

  if (projects.length === 0) {
    return <Button variant="ghost" size="sm" onClick={() => setShowModal(true)}>Create Project</Button>;
  }

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  return (
    <div className="ps-wrap">
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Select
          inline
          className="ps-select"
          value={selectedProjectId}
          onChange={(e) => {
            if (e.target.value === "create_new") {
              setShowModal(true);
              return;
            }
            const newId = e.target.value;
            setSelectedProjectId(newId);
            localStorage.setItem("selectedProjectId", newId);
            router.push(`/project/${newId}/home`);
            
            const p = projects.find((p) => p.id === newId);
            if (p?.environments.length) {
              const envId = p.environments[0].id;
              setSelectedEnvId(envId);
              localStorage.setItem("selectedEnvironmentId", envId);
            }
          }}
          options={[
            ...projects.map(p => ({ value: p.id, label: p.name })),
            { value: "sep", label: "───────" },
            { value: "create_new", label: "+ Create New Project" }
          ]}
        />
        <Button 
          variant="ghost"
          onClick={() => setShowModal(true)}
          title="Create new project"
          style={{ padding: 4 }}
        >
          <svg width="14" height="14" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 2.75C8 2.47386 7.77614 2.25 7.5 2.25C7.22386 2.25 7 2.47386 7 2.75V7H2.75C2.47386 7 2.25 7.22386 2.25 7.5C2.25 7.77614 2.47386 8 2.75 8H7V12.25C7 12.5261 7.22386 12.75 7.5 12.75C7.77614 12.75 8 12.5261 8 12.25V8H12.25C12.5261 8 12.75 7.77614 12.75 7.5C12.75 7.22386 12.5261 7 12.25 7H8V2.75Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
        </Button>
      </div>

      {isFlagsPage && (
        <>
          <div className="ps-divider" />
          <div className="ps-env-tabs">
            {selectedProject?.environments.map((env) => (
              <Button
                key={env.id}
                variant={selectedEnvId === env.id ? "primary" : "ghost"}
                size="sm"
                className={`ps-env-btn${selectedEnvId === env.id ? " active" : ""}`}
                onClick={() => {
                  setSelectedEnvId(env.id);
                }}
              >
                {env.name}
              </Button>
            ))}
          </div>
        </>
      )}

      {showModal && (
        <div className="modal-backdrop">
          <div className="modal" style={{ maxWidth: 360 }}>
            <div className="modal-header">
              <h2 className="modal-title">New Project</h2>
              <Button variant="ghost" size="sm" className="modal-close" onClick={() => setShowModal(false)} style={{ padding: '0 8px' }}>×</Button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleCreateProject}>
                <Input
                  label="Project Name"
                  autoFocus
                  required
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="e.g. Mobile App"
                />
                <div className="btn-row" style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 }}>
                  <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
                  <Button type="submit" loading={loading} disabled={!newProjectName}>
                    Create Project
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
