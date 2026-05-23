"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/api";
import { useParams } from "next/navigation";
import Link from "next/link";
import { StatsGrid } from "@/components/dashboard/StatsGrid";
import { DashboardWidgets } from "@/components/dashboard/DashboardWidgets";

export default function OverviewPage() {
  const { data: session } = useSession();
  const params = useParams();
  const projectId = params?.projectId as string;

  const [project, setProject] = useState<any>(null);
  const [stats, setStats] = useState({
    flags: 0,
    events: 0,
    activeExperiments: 0
  });
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token") || "";
        if (!token || !projectId) return;

        const [projectData, statsData, activitiesData] = await Promise.all([
          apiRequest(`/projects/${projectId}`, {}, token),
          apiRequest(`/projects/${projectId}/stats`, {}, token),
          apiRequest(`/activities?projectId=${projectId}`, {}, token)
        ]);
        
        setProject(projectData);
        setStats(statsData);
        setActivities(activitiesData);
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [projectId]);

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="animate-fadein">
      <header className="page-header" style={{ marginBottom: 40 }}>
        <div>
          <p className="page-subtitle">{getTimeGreeting()}, {session?.user?.name || "User"}</p>
          <h1 className="page-title" style={{ fontSize: 32, marginTop: 4 }}>
            Overview for <span style={{ color: 'var(--color-brand)' }}>{project?.name || "Project"}</span>
          </h1>
        </div>
      </header>

      <StatsGrid loading={loading} stats={stats} />

      <DashboardWidgets activities={activities} projectId={projectId} />

      <style jsx>{`
      `}</style>
    </div>
  );
}
