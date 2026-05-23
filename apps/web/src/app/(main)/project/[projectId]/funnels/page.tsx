"use client";

import { useState, useEffect } from "react";
import { apiRequest, funnelsApi } from "@/lib/api";
import { useParams } from "next/navigation";
import { useEnvironment } from "@/contexts/EnvironmentContext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";

type FunnelStepData = {
  level: number;
  count: number;
  name?: string;
};

type Funnel = {
  id: string;
  name: string;
  steps: string[];
};

/* ── Funnel Creation Modal ────────────────────────────────────────── */
function CreateFunnelModal({
  projectId,
  environmentId,
  availableEvents,
  onClose,
  onCreated,
}: {
  projectId: string;
  environmentId: string;
  availableEvents: string[];
  onClose: () => void;
  onCreated: (funnel: Funnel) => void;
}) {
  const [name, setName] = useState("");
  const [steps, setSteps] = useState<string[]>([""]);
  const [loading, setLoading] = useState(false);

  const addStep = () => setSteps([...steps, ""]);
  const removeStep = (i: number) => setSteps(steps.filter((_, idx) => idx !== i));
  const updateStep = (i: number, val: string) => {
    const newSteps = [...steps];
    newSteps[i] = val;
    setSteps(newSteps);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("token") || "";
      const funnel = await funnelsApi.create({
        projectId,
        environmentId,
        name,
        steps: steps.filter(s => s !== ""),
      }, token);
      onCreated(funnel);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Create Conversion Funnel">
      <form onSubmit={handleSubmit}>
        <Input 
          label="Funnel Name"
          placeholder="e.g. Onboarding Flow"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <div className="form-group" style={{ marginTop: 24 }}>
          <label className="form-label">Steps (In order)</label>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {steps.map((step, i) => (
              <div key={i} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <div className="step-num">{i + 1}</div>
                <div style={{ flex: 1 }}>
                  <select 
                    className="ln-select" 
                    value={step} 
                    onChange={(e) => updateStep(i, e.target.value)}
                    required
                  >
                    <option value="">Select an event...</option>
                    {availableEvents.map(ev => (
                      <option key={ev} value={ev}>{ev}</option>
                    ))}
                  </select>
                </div>
                {steps.length > 1 && (
                  <button type="button" onClick={() => removeStep(i)} className="remove-btn">×</button>
                )}
              </div>
            ))}
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={addStep} style={{ marginTop: 12 }}>
            + Add Step
          </Button>
        </div>

        <div className="btn-row" style={{ marginTop: 32 }}>
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary" loading={loading} disabled={!name || steps.some(s => s === "")}>
            Save Funnel
          </Button>
        </div>
      </form>

      <style jsx>{`
        .step-num {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: var(--color-surface-2);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 600;
          color: var(--color-muted);
        }
        .remove-btn {
          background: none;
          border: none;
          color: var(--color-muted);
          font-size: 20px;
          cursor: pointer;
        }
        .remove-btn:hover { color: #ff4444; }
        .ln-select {
          width: 100%;
          background: var(--color-surface-2);
          border: 1px solid var(--color-border);
          border-radius: 6px;
          color: var(--color-text);
          padding: 8px 12px;
          font-size: 14px;
          outline: none;
        }
      `}</style>
    </Modal>
  );
}

/* ── Main Funnels Page ────────────────────────────────────────── */
export default function FunnelsPage() {
  const [funnels, setFunnels] = useState<Funnel[]>([]);
  const [selectedFunnel, setSelectedFunnel] = useState<Funnel | null>(null);
  const [chartData, setChartData] = useState<FunnelStepData[]>([]);
  const [availableEvents, setAvailableEvents] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const params = useParams();
  const projectId = params?.projectId as string;
  const { environmentId } = useEnvironment();
  const token = typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";

  const loadInitial = async () => {
    if (!token || !projectId || !environmentId) return;
    setLoading(true);
    try {
      // 1. Load available funnels
      const list = await funnelsApi.list(projectId, environmentId, token);
      setFunnels(list);
      if (list.length > 0) setSelectedFunnel(list[0]);

      // 2. Load available event names for the builder
      const events = await apiRequest(`/events/names?projectId=${projectId}&environmentId=${environmentId}`, {}, token);
      setAvailableEvents(events);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadFunnelData = async (funnel: Funnel) => {
    setChartLoading(true);
    try {
      const result = await apiRequest(`/metrics/funnel`, {
        method: 'POST',
        body: JSON.stringify({
          projectId,
          environmentId,
          funnelId: funnel.id,
          window: 3600
        })
      }, token);
      
      const mapped = (result as FunnelStepData[]).map(d => ({
        ...d,
        name: funnel.steps[d.level - 1] || `Step ${d.level}`
      })).filter(d => d.level > 0);

      setChartData(mapped);
    } catch (err) {
      console.error(err);
    } finally {
      setChartLoading(false);
    }
  };

  useEffect(() => {
    loadInitial();
  }, [projectId, environmentId]); // eslint-disable-line

  useEffect(() => {
    if (selectedFunnel) loadFunnelData(selectedFunnel);
  }, [selectedFunnel]);

  const handleDeleteFunnel = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this funnel?")) return;
    try {
      await funnelsApi.delete(id, token);
      setFunnels(funnels.filter(f => f.id !== id));
      if (selectedFunnel?.id === id) {
        setSelectedFunnel(funnels.find(f => f.id !== id) || null);
        setChartData([]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="animate-fadein">
      {isModalOpen && (
        <CreateFunnelModal 
          projectId={projectId}
          environmentId={environmentId}
          availableEvents={availableEvents}
          onClose={() => setIsModalOpen(false)}
          onCreated={(f) => {
            setFunnels([f, ...funnels]);
            setSelectedFunnel(f);
          }}
        />
      )}

      <div className="page-header" style={{ marginBottom: 32 }}>
        <div>
          <h1 className="page-title">Conversion Funnels</h1>
          <p className="page-subtitle">Track how users drop off through key flows in your application.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>Create Funnel</Button>
      </div>

      {loading ? (
        <div className="spinner-wrap"><div className="spinner" /> Loading funnels...</div>
      ) : funnels.length === 0 ? (
        <EmptyState 
          icon="🌪️"
          title="No funnels yet"
          description="Create your first funnel to track conversion rates."
        >
          <Button variant="primary" style={{ marginTop: 16 }} onClick={() => setIsModalOpen(true)}>
            Create Funnel
          </Button>
        </EmptyState>
      ) : (
        <div className="funnel-layout">
          {/* Sidebar / List */}
          <div className="funnel-sidebar">
            {funnels.map(f => (
              <div 
                key={f.id} 
                className={`funnel-item ${selectedFunnel?.id === f.id ? 'active' : ''}`}
                onClick={() => setSelectedFunnel(f)}
              >
                <div className="funnel-item-name">{f.name}</div>
                <div className="funnel-item-meta">{f.steps.length} steps</div>
                <button className="delete-icon" onClick={(e) => handleDeleteFunnel(e, f.id)}>×</button>
              </div>
            ))}
          </div>

          {/* Main Content */}
          <div className="funnel-main">
            {selectedFunnel && (
              <div className="metric-card">
                <div className="metric-card-header">
                  <h3 className="metric-card-title">{selectedFunnel.name}</h3>
                </div>

                {chartLoading ? (
                  <div className="spinner-wrap" style={{ height: 300 }}><div className="spinner" /></div>
                ) : (
                  <>
                    <div className="chart-container">
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData} layout="vertical" margin={{ left: 40, right: 40 }}>
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
                          <XAxis type="number" hide />
                          <YAxis 
                            dataKey="name" 
                            type="category" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: 'var(--color-text)', fontSize: 12, fontWeight: 500 }}
                            width={120}
                          />
                          <Tooltip 
                            cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                            contentStyle={{ backgroundColor: '#171717', border: '1px solid var(--color-border)', borderRadius: '8px' }}
                          />
                          <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={40}>
                            {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={`rgba(255, 255, 255, ${1 - index * 0.2})`} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="funnel-stats">
                      {chartData.map((step, i) => {
                        const prev = chartData[i - 1];
                        const conversion = prev ? ((step.count / prev.count) * 100).toFixed(1) : "100";
                        const totalConv = ((step.count / chartData[0].count) * 100).toFixed(1);
                        
                        return (
                          <div key={i} className="funnel-step-stat">
                            <div className="step-index">{i + 1}</div>
                            <div className="step-info">
                              <div className="step-name">{step.name}</div>
                              <div className="step-count">{step.count.toLocaleString()} users</div>
                            </div>
                            <div className="step-conversion">
                              <div className="conv-val">{conversion}%</div>
                              <div className="conv-label">Step conversion</div>
                            </div>
                            {i > 0 && (
                              <div className="step-total-conversion">
                                <div className="conv-val">{totalConv}%</div>
                                <div className="conv-label">Total conversion</div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .funnel-layout {
          display: grid;
          grid-template-columns: 240px 1fr;
          gap: 24px;
        }
        .funnel-sidebar {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .funnel-item {
          padding: 12px 16px;
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
        }
        .funnel-item:hover { background: rgba(255,255,255,0.03); }
        .funnel-item.active {
          border-color: var(--color-brand);
          background: rgba(255,255,255,0.05);
        }
        .funnel-item-name {
          font-size: 14px;
          font-weight: 600;
          color: var(--color-text);
        }
        .funnel-item-meta {
          font-size: 12px;
          color: var(--color-muted);
          margin-top: 2px;
        }
        .delete-icon {
          position: absolute;
          top: 8px;
          right: 8px;
          background: none;
          border: none;
          color: var(--color-muted);
          cursor: pointer;
          opacity: 0;
          transition: opacity 0.2s;
        }
        .funnel-item:hover .delete-icon { opacity: 1; }
        .delete-icon:hover { color: #ff4444; }

        .metric-card {
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: 8px;
          padding: 24px;
        }
        .metric-card-title {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 24px;
        }
        .chart-container { margin-bottom: 32px; }
        .funnel-stats {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .funnel-step-stat {
          display: flex;
          align-items: center;
          padding: 12px 16px;
          background: rgba(255,255,255,0.02);
          border: 1px solid var(--color-border);
          border-radius: 8px;
        }
        .step-index {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: var(--color-brand-muted);
          color: var(--color-brand);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 700;
          margin-right: 16px;
        }
        .step-info { flex: 1; }
        .step-name { font-size: 13px; font-weight: 600; }
        .step-count { font-size: 12px; color: var(--color-muted); }
        .step-conversion, .step-total-conversion {
          text-align: right;
          margin-left: 24px;
          min-width: 90px;
        }
        .conv-val { font-size: 14px; font-weight: 700; }
        .conv-label { font-size: 10px; color: var(--color-muted); text-transform: uppercase; }
      `}</style>
    </div>
  );
}
