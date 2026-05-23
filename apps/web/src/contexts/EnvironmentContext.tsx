"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest } from '@/lib/api';
import { useParams } from 'next/navigation';

type EnvironmentContextType = {
  environmentId: string;
  setEnvironmentId: (id: string) => void;
  isLoading: boolean;
};

const EnvironmentContext = createContext<EnvironmentContextType | undefined>(undefined);

export function EnvironmentProvider({ children }: { children: React.ReactNode }) {
  const [environmentId, setEnvId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const params = useParams();
  const projectId = params?.projectId as string;

  // Initialize from localStorage or fetch default
  useEffect(() => {
    const initEnv = async () => {
      const saved = localStorage.getItem("selectedEnvironmentId");
      
      // If we have a project, verify the environment exists
      if (projectId) {
        try {
          const token = localStorage.getItem("token") || "";
          if (!token) return;
          const project = await apiRequest(`/projects/${projectId}`, {}, token);
          
          if (project.environments?.length > 0) {
            const exists = project.environments.some((e: any) => e.id === saved);
            if (exists && saved) {
              setEnvId(saved);
            } else {
              const prod = project.environments.find((e: any) => e.name === "Production");
              const defaultId = prod?.id || project.environments[0].id;
              setEnvId(defaultId);
              localStorage.setItem("selectedEnvironmentId", defaultId);
            }
          }
        } catch (err) {
          console.error("Failed to sync environment:", err);
        }
      }
      setIsLoading(false);
    };

    initEnv();
  }, [projectId]);

  const setEnvironmentId = (id: string) => {
    setEnvId(id);
    localStorage.setItem("selectedEnvironmentId", id);
  };

  return (
    <EnvironmentContext.Provider value={{ environmentId, setEnvironmentId, isLoading }}>
      {children}
    </EnvironmentContext.Provider>
  );
}

export function useEnvironment() {
  const context = useContext(EnvironmentContext);
  if (context === undefined) {
    throw new Error('useEnvironment must be used within an EnvironmentProvider');
  }
  return context;
}
