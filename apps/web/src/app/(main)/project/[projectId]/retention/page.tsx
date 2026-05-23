"use client";

import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/api";
import { useParams } from "next/navigation";
import { useEnvironment } from "@/contexts/EnvironmentContext";
import { EmptyState } from "@/components/ui/EmptyState";

type RetentionRow = {
  cohort_date: string;
  day_offset: number;
  count: number;
};

type Cohort = {
  date: string;
  total: number;
  days: Record<number, number>;
};

export default function RetentionPage() {
  const [data, setData] = useState<Cohort[]>([]);
  const [loading, setLoading] = useState(true);
  const [availableEvents, setAvailableEvents] = useState<string[]>([]);
  const [cohortEvent, setCohortEvent] = useState<string>("");
  const [activityEvent, setActivityEvent] = useState<string>("");

  const params = useParams();
  const projectId = params?.projectId as string;
  const { environmentId } = useEnvironment();
  const token = typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";

  const loadInitial = async () => {
    if (!token || !projectId || !environmentId) return;
    try {
      const events = await apiRequest(`/events/names?projectId=${projectId}&environmentId=${environmentId}`, {}, token);
      setAvailableEvents(events);
    } catch (err) {
      console.error(err);
    }
  };

  const loadRetention = async () => {
    if (!token || !projectId || !environmentId) return;
    setLoading(true);
    try {
      let url = `/metrics/retention?projectId=${projectId}&environmentId=${environmentId}`;
      if (cohortEvent) url += `&cohortEvent=${cohortEvent}`;
      if (activityEvent) url += `&activityEvent=${activityEvent}`;

      const result: RetentionRow[] = await apiRequest(url, {}, token);
      
      const cohortsMap: Record<string, Cohort> = {};
      result.forEach((row) => {
        const date = row.cohort_date.split("T")[0];
        if (!cohortsMap[date]) {
          cohortsMap[date] = { date, total: 0, days: {} };
        }
        cohortsMap[date].days[row.day_offset] = row.count;
        if (row.day_offset === 0) {
          cohortsMap[date].total = row.count;
        }
      });

      setData(Object.values(cohortsMap).sort((a, b) => b.date.localeCompare(a.date)));
    } catch (err) {
      console.error("Failed to load retention:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitial();
  }, [projectId, environmentId]); // eslint-disable-line

  useEffect(() => {
    loadRetention();
  }, [projectId, environmentId, cohortEvent, activityEvent]); // eslint-disable-line

  const getIntensity = (count: number, total: number) => {
    if (total === 0) return 0;
    return count / total;
  };

  return (
    <div className="retention-container animate-fadein">
      <div className="page-header" style={{ marginBottom: 32 }}>
        <div>
          <h1 className="page-title">User Retention</h1>
          <p className="page-subtitle">Understand how many users stay active after their first interaction.</p>
        </div>
      </div>

      <div className="retention-selectors">
        <div className="selector-group">
          <label>Cohort event (First seen)</label>
          <select value={cohortEvent} onChange={(e) => setCohortEvent(e.target.value)}>
            <option value="">Any event (First seen)</option>
            {availableEvents.map(ev => <option key={ev} value={ev}>{ev}</option>)}
          </select>
        </div>
        <div className="selector-arrow">→</div>
        <div className="selector-group">
          <label>Activity event (Returning)</label>
          <select value={activityEvent} onChange={(e) => setActivityEvent(e.target.value)}>
            <option value="">Any event (Returning)</option>
            {availableEvents.map(ev => <option key={ev} value={ev}>{ev}</option>)}
          </select>
        </div>
      </div>

      <div className="metric-card">
        <div className="table-wrap">
          <table className="retention-table">
            <thead>
              <tr>
                <th className="sticky-col">Cohort</th>
                <th>Users</th>
                {[...Array(15)].map((_, i) => (
                  <th key={i}>Day {i}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={17} style={{ textAlign: "center", padding: 64 }}>
                    <div className="spinner-wrap">
                      <div className="spinner" style={{ margin: "0 auto" }} />
                      Calculating cohorts…
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={17} style={{ textAlign: "center", padding: 64 }}>
                    <EmptyState 
                      icon="🧊"
                      title="No retention data"
                      description="Try changing your event filters or check back later."
                      style={{ border: 'none', background: 'transparent' }}
                    />
                  </td>
                </tr>
              ) : (
                data.map((cohort) => (
                  <tr key={cohort.date}>
                    <td className="sticky-col cohort-label">
                      {new Date(cohort.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    </td>
                    <td className="total-label">{cohort.total.toLocaleString()}</td>
                    {[...Array(15)].map((_, i) => {
                      const count = cohort.days[i] || 0;
                      const intensity = getIntensity(count, cohort.total);
                      return (
                        <td 
                          key={i} 
                          className="retention-cell"
                          style={{ 
                            backgroundColor: intensity > 0 ? `rgba(255, 255, 255, ${Math.max(0.1, intensity)})` : "transparent",
                            color: intensity > 0.5 ? "white" : "var(--color-text)"
                          }}
                        >
                          {cohort.total > 0 ? `${((count / cohort.total) * 100).toFixed(0)}%` : "-"}
                          <div className="cell-tooltip">{count.toLocaleString()} users</div>
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style jsx>{`
        .retention-selectors {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;
          padding: 16px;
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: 8px;
        }
        .selector-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
          flex: 1;
        }
        .selector-group label {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          color: var(--color-muted);
          letter-spacing: 0.05em;
        }
        .selector-group select {
          background: var(--color-surface-2);
          border: 1px solid var(--color-border);
          border-radius: 6px;
          color: var(--color-text);
          padding: 8px 12px;
          font-size: 13px;
          outline: none;
        }
        .selector-arrow {
          font-size: 18px;
          color: var(--color-muted);
          padding-top: 18px;
        }
        .table-wrap {
          overflow-x: auto;
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: 8px;
        }
        .retention-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
        }
        .retention-table th {
          text-align: center;
          padding: 12px 16px;
          border-bottom: 1px solid var(--color-border);
          color: var(--color-muted);
          font-weight: 500;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          white-space: nowrap;
        }
        .retention-table td {
          padding: 12px 16px;
          border-bottom: 1px solid rgba(255,255,255,0.02);
          white-space: nowrap;
        }
        .sticky-col {
          position: sticky;
          left: 0;
          background: #0a0a0a;
          z-index: 1;
          border-right: 1px solid var(--color-border);
          text-align: left !important;
        }
        .cohort-label {
          font-weight: 600;
          color: var(--color-text);
        }
        .total-label {
          color: var(--color-muted);
          text-align: center;
          font-weight: 500;
        }
        .retention-cell {
          text-align: center;
          position: relative;
          min-width: 60px;
          transition: transform 0.1s;
        }
        .cell-tooltip {
          position: absolute;
          bottom: 100%;
          left: 50%;
          transform: translateX(-50%) translateY(-8px);
          background: #1f1f2e;
          padding: 4px 8px;
          border-radius: 4px;
          border: 1px solid rgba(255,255,255,0.1);
          font-size: 10px;
          visibility: hidden;
          opacity: 0;
          transition: all 0.2s;
          z-index: 10;
          white-space: nowrap;
        }
        .retention-cell:hover .cell-tooltip {
          visibility: visible;
          opacity: 1;
          transform: translateX(-50%) translateY(-4px);
        }
        .metric-card {
          padding: 0;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
