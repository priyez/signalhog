"use client";

type StatsGridProps = {
  loading: boolean;
  stats: {
    flags: number;
    events: number;
    activeExperiments: number;
  };
};

export function StatsGrid({ loading, stats }: StatsGridProps) {
  return (
    <div className="overview-grid">
      <div className="stat-card">
        <div className="stat-label">Total Feature Flags</div>
        <div className="stat-value">{loading ? "..." : stats.flags}</div>
        <div className="stat-trend">+2 this week</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">Events Ingested</div>
        <div className="stat-value">{loading ? "..." : stats.events.toLocaleString()}</div>
        <div className="stat-trend">+12% vs last week</div>
      </div>
      <div className="stat-card">
        <div className="stat-label">Active Experiments</div>
        <div className="stat-value">{loading ? "..." : stats.activeExperiments}</div>
        <div className="stat-trend">Running on 3 variants</div>
      </div>

      <style jsx>{`
        .overview-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        .stat-card {
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: 12px;
          padding: 24px;
          transition: transform 0.2s;
        }
        .stat-card:hover {
          transform: translateY(-2px);
          border-color: rgba(255,255,255,0.2);
        }
        .stat-label {
          font-size: 12px;
          font-weight: 500;
          color: var(--color-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .stat-value {
          font-size: 32px;
          font-weight: 600;
          color: #fff;
          margin: 12px 0 4px;
          font-family: var(--font-mono);
        }
        .stat-trend {
          font-size: 12px;
          color: #fff;
          opacity: 0.6;
        }

        @media (max-width: 1024px) {
          .overview-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 640px) {
          .overview-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
