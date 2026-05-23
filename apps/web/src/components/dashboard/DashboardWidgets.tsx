"use client";

import Link from "next/link";
import { EmptyState } from "@/components/ui/EmptyState";
import { 
  Flag, 
  Wind, 
  Zap, 
  Folder, 
  Plus, 
  RefreshCw, 
  Settings 
} from "lucide-react";

type Activity = {
  id: string;
  type: string;
  action: string;
  target: string;
  createdAt: string;
  user?: {
    name?: string;
    email?: string;
  };
};

type DashboardWidgetsProps = {
  activities: Activity[];
  projectId: string;
};

export function DashboardWidgets({ activities, projectId }: DashboardWidgetsProps) {
  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const diff = now.getTime() - then.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return "just now";
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "flag": return <Flag size={14} />;
      case "funnel": return <Wind size={14} />;
      case "experiment": return <Zap size={14} />;
      default: return <Folder size={14} />;
    }
  };

  return (
    <div className="widgets-grid">
      {/* Activity Feed */}
      <div className="ln-card activity-card">
        <h3 className="widget-title">Recent Activity</h3>
        <div className="activity-list">
          {activities.length === 0 ? (
            <EmptyState
              title="No recent activity"
              description="Your project actions will appear here as they happen."
              style={{ padding: '24px', background: 'transparent', border: 'none' }}
            />
          ) : (
            activities.slice(0, 3).map((act, i) => (
              <div key={act.id || i} className="activity-item">
                <div className="activity-icon">
                  {getActivityIcon(act.type)}
                </div>
                <div className="activity-details">
                  <div className="activity-text">
                    <span className="activity-user">{act.user?.name || act.user?.email || "Someone"}</span> {act.action?.toLowerCase()} <b>{act.target}</b>
                  </div>
                  <div className="activity-time">{formatTimeAgo(act.createdAt)}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="ln-card actions-card">
        <h3 className="widget-title">Quick Actions</h3>
        <div className="actions-list">
          <Link href={`/project/${projectId}/flags`} className="ln-btn-ghost action-link">
            <span className="action-icon"><Plus size={16} /></span> Create new flag
          </Link>
          <Link href={`/project/${projectId}/funnels`} className="ln-btn-ghost action-link">
            <span className="action-icon"><Zap size={16} /></span> Start experiment
          </Link>
          <Link href={`/project/${projectId}/events`} className="ln-btn-ghost action-link">
            <span className="action-icon"><RefreshCw size={16} /></span> View latest events
          </Link>
          <Link href={`/project/${projectId}/settings`} className="ln-btn-ghost action-link">
            <span className="action-icon"><Settings size={16} /></span> Project settings
          </Link>
        </div>
      </div>

      <style jsx>{`
        .widgets-grid {
          margin-top: 40px;
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 24px;
        }
        .ln-card {
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: 12px;
          padding: 24px;
        }
        .widget-title {
          font-size: 15px;
          font-weight: 600;
          color: var(--color-text);
          margin-bottom: 20px;
        }
        .activity-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .activity-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding-bottom: 16px;
          border-bottom: 1px solid var(--color-border);
        }
        .activity-item:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }
        .activity-icon {
          width: 32px;
          height: 32px;
          background: rgba(255,255,255,0.05);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-brand);
        }
        .activity-user {
          color: #fff;
          font-weight: 500;
        }
        .activity-text {
          font-size: 13px;
          color: var(--color-muted);
        }
        .activity-time {
          font-size: 11px;
          color: var(--color-muted-2);
          margin-top: 2px;
        }
        .actions-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .action-link {
          justify-content: flex-start;
          text-decoration: none;
          width: 100%;
          color: var(--color-text);
          font-size: 13px;
        }
        .action-icon {
          margin-right: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-muted);
        }

        @media (max-width: 1024px) {
          .widgets-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
