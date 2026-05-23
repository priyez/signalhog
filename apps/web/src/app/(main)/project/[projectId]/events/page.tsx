"use client";

import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/api";

type Event = {
  event: string;
  distinct_id: string;
  properties: string | Record<string, any>;
  timestamp: string;
};



export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const projectId = typeof window !== "undefined" ? localStorage.getItem("selectedProjectId") || "" : "";
  const environmentId = typeof window !== "undefined" ? localStorage.getItem("selectedEnvironmentId") || "" : "";
  const token = typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";

  const loadEvents = async () => {
    if (!token || !projectId || !environmentId) return;
    try {
      const data = await apiRequest(`/events?projectId=${projectId}&environmentId=${environmentId}`, {}, token);
      setEvents(data);
    } catch (err) {
      console.error("Failed to load events:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();

    if (!projectId || !environmentId) return;

    // Replace SSE with 5-second polling for live updates
    const interval = setInterval(() => {
      loadEvents();
    }, 5000);

    return () => clearInterval(interval);
  }, [projectId, environmentId]); // eslint-disable-line


  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Live Events</h1>
          <p className="page-subtitle">Real-time stream of events ingested from your SDKs.</p>
        </div>
      </div>

      {loading && events.length === 0 ? (
        <div className="spinner-wrap">
          <div className="spinner" />
          Connecting to database…
        </div>
      ) : (
        <div className="ln-table-container">
          <table className="ln-table">
            <thead>
              <tr>
                <th>Event</th>
                <th>User ID</th>
                <th>Properties</th>
                <th style={{ textAlign: "right" }}>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {events.map((e, i) => {
                const props = typeof e.properties === "string" ? JSON.parse(e.properties) : e.properties;
                return (
                  <tr key={i}>
                    <td style={{ fontWeight: 500 }}>{e.event}</td>
                    <td><code style={{ fontSize: "11px", color: "var(--color-muted)" }}>{e.distinct_id}</code></td>
                    <td>
                      <div className="props-preview" title={JSON.stringify(props, null, 2)}>
                        {Object.entries(props).slice(0, 3).map(([k, v]) => (
                          <span key={k} className="prop-pill">
                            {k}: {String(v)}
                          </span>
                        ))}
                        {Object.keys(props).length > 3 && <span className="prop-pill">+{Object.keys(props).length - 3}</span>}
                      </div>
                    </td>
                    <td style={{ textAlign: "right", color: "var(--color-muted)", fontSize: "12px" }}>
                      {new Date(e.timestamp).toLocaleTimeString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {events.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon">📡</div>
              <div className="empty-state-title">No events yet</div>
              <div className="empty-state-desc">Waiting for events to be ingested from your SDK...</div>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .props-preview {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }
        .prop-pill {
          background: rgba(255, 255, 255, 0.05);
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 11px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </div>
  );
}
