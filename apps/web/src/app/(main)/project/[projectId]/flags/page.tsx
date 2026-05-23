"use client";

import { useState, useEffect } from "react";
import { flagsApi } from "@/lib/api";
import { useParams } from "next/navigation";
import { useEnvironment } from "@/contexts/EnvironmentContext";
import { Toggle } from "@/components/ui/Toggle";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { DropdownMenu } from "@/components/ui/DropdownMenu";

type TargetingRule = {
  property: string;
  operator: "equals" | "not_equals" | "contains" | "not_contains" | "starts_with" | "ends_with";
  value: any;
};

type Flag = { id: string; key: string; enabled: boolean; rolloutPercentage: number; rules?: TargetingRule[] };

/* ── Flag Form Modal ─────────────────────────────────────────────────── */
function FlagModal({
  projectId,
  environmentId,
  initialFlag,
  onClose,
  onSaved,
}: {
  projectId: string;
  environmentId: string;
  initialFlag?: Flag | null;
  onClose: () => void;
  onSaved: (flag: Flag) => void;
}) {
  const [key, setKey] = useState(initialFlag?.key || "");
  const [rollout, setRollout] = useState(initialFlag?.rolloutPercentage ?? 100);
  const [rules, setRules] = useState<TargetingRule[]>(initialFlag?.rules || []);
  const [createInAllEnvs, setCreateInAllEnvs] = useState(!initialFlag);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isEditing = !!initialFlag;

  const addRule = () => {
    setRules([...rules, { property: "", operator: "equals", value: "" }]);
  };

  const removeRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  const updateRule = (index: number, field: keyof TargetingRule, value: string) => {
    const newRules = [...rules];
    newRules[index] = { ...newRules[index], [field]: value };
    setRules(newRules);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const t = typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";
      let savedFlag;
      if (isEditing && initialFlag) {
        savedFlag = await flagsApi.update(initialFlag.id, {
          key,
          rolloutPercentage: rollout,
          rules,
        }, t);
      } else {
        savedFlag = await flagsApi.create({ 
          projectId, 
          environmentId, 
          key, 
          rolloutPercentage: rollout, 
          rules,
          createInAllEnvs 
        }, t);
      }
      onSaved(savedFlag);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create flag");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title={isEditing ? "Edit feature flag" : "Create feature flag"}>
      {error && <div className="form-error">{error}</div>}

      <form onSubmit={handleSubmit}>
            <Input
              id="flag-key"
              label="Flag key"
              hint="Lowercase letters, numbers, and underscores only."
              type="text"
              required
              autoFocus
              value={key}
              disabled={isEditing} // Prevent changing key after creation
              onChange={(e) => setKey(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "_"))}
              placeholder="new_feature_name"
              className="mono"
            />

            <div className="form-group">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <label className="form-label" style={{ marginBottom: 0 }}>Rollout percentage</label>
                <span className="range-value">{rollout}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={rollout}
                onChange={(e) => setRollout(Number(e.target.value))}
                className="ln-range"
              />
              <div className="range-labels"><span>0%</span><span>50%</span><span>100%</span></div>
            </div>
            <div className="form-group">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <label className="form-label" style={{ marginBottom: 0 }}>Targeting Rules</label>
                <Button type="button" variant="ghost" size="sm" onClick={addRule}>
                  + Add rule
                </Button>
              </div>
              
              <div className="rules-list">
                {rules.map((rule, i) => (
                  <div key={i} className="rule-row">
                    <Input
                      inline
                      placeholder="Property"
                      value={rule.property}
                      onChange={(e) => updateRule(i, "property", e.target.value)}
                      className="ln-input-sm"
                    />
                    <Select
                      inline
                      value={rule.operator}
                      onChange={(e) => updateRule(i, "operator", e.target.value as any)}
                      className="ln-select-sm"
                      options={[
                        { value: "equals", label: "Equals" },
                        { value: "not_equals", label: "Not equals" },
                        { value: "contains", label: "Contains" },
                        { value: "not_contains", label: "Not contains" },
                        { value: "starts_with", label: "Starts with" },
                        { value: "ends_with", label: "Ends with" },
                      ]}
                    />
                    <Input
                      inline
                      placeholder="Value"
                      value={rule.value}
                      onChange={(e) => updateRule(i, "value", e.target.value)}
                      className="ln-input-sm"
                    />
                    <button type="button" onClick={() => removeRule(i)} className="rule-remove">×</button>
                  </div>
                ))}
                {rules.length === 0 && (
                  <p className="form-hint" style={{ marginTop: 0 }}>No rules. Flag will apply to all users based on rollout.</p>
                )}
              </div>
            </div>

            {!isEditing && (
              <div className="form-group" style={{ marginTop: 12 }}>
                <label className="checkbox-wrap" style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                  <Toggle 
                    enabled={createInAllEnvs} 
                    onChange={setCreateInAllEnvs} 
                    ariaLabel="Create in all environments"
                  />
                  <span style={{ fontSize: 13, fontWeight: 500, color: '#fff' }}>Create in all environments</span>
                </label>
                <p className="form-hint" style={{ marginTop: 4, marginLeft: 26 }}>
                  The flag will be available in Development, Staging, and Production immediately.
                </p>
              </div>
            )}

            <div className="btn-row">
              <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
              <Button type="submit" variant="primary" loading={loading} disabled={!key}>
                {isEditing ? "Save changes" : "Create flag"}
              </Button>
            </div>
          </form>
    </Modal>
  );
}

/* ── Flags Page ────────────────────────────────────────────────────────── */


export default function FlagsPage() {
  const [flags, setFlags] = useState<Flag[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFlag, setEditingFlag] = useState<Flag | null>(null);
  const params = useParams();
  const projectId = params?.projectId as string;
  const { environmentId } = useEnvironment();
  const [token, setToken] = useState("");

  useEffect(() => {
    const t = localStorage.getItem("token") || "";
    setToken(t);

    const loadFlags = async () => {
      if (!t || !projectId || !environmentId) { 
        if (!environmentId) return; // Wait for env to load
        setLoading(false); 
        return; 
      }
      
      setLoading(true);
      try {
        const data = await flagsApi.list(projectId, environmentId, t);
        setFlags(data);
      } catch (err) {
        console.error("Failed to load flags:", err);
      } finally {
        setLoading(false);
      }
    };

    loadFlags();
  }, [projectId, environmentId]);

  const handleToggle = async (flag: Flag) => {
    try {
      const updated = await flagsApi.update(flag.id, { enabled: !flag.enabled }, token);
      setFlags((prev) => prev.map((f) => (f.id === flag.id ? updated : f)));
    } catch (err) { console.error(err); }
  };

  const handleRollout = async (flag: Flag, pct: number) => {
    try {
      const updated = await flagsApi.update(flag.id, { rolloutPercentage: pct }, token);
      setFlags((prev) => prev.map((f) => (f.id === flag.id ? updated : f)));
    } catch (err) { console.error(err); }
  };

  const handleSaveFlag = (savedFlag: Flag) => {
    if (editingFlag) {
      setFlags(flags.map(f => f.id === savedFlag.id ? savedFlag : f));
    } else {
      setFlags([...flags, savedFlag]);
    }
    setEditingFlag(null);
    setIsModalOpen(false);
  };

  const handleDelete = async (flag: Flag) => {
    if (!confirm(`Are you sure you want to delete flag "${flag.key}"? This action cannot be undone.`)) return;
    try {
      await flagsApi.delete(flag.id, token);
      setFlags(flags.filter(f => f.id !== flag.id));
    } catch (err) {
      console.error("Failed to delete flag:", err);
      alert("Failed to delete flag. Please try again.");
    }
  };

  const openEditModal = (flag: Flag) => {
    setEditingFlag(flag);
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setEditingFlag(null);
    setIsModalOpen(true);
  };



  return (
    <div className="animate-fadein">
      {isModalOpen && environmentId && projectId && (
        <FlagModal
          projectId={projectId}
          environmentId={environmentId}
          initialFlag={editingFlag}
          onClose={() => {
            setIsModalOpen(false);
            setEditingFlag(null);
          }}
          onSaved={handleSaveFlag}
        />
      )}

      {/* Page header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Feature Flags</h1>
          <p className="page-subtitle">Toggle features instantly — no redeployments required.</p>
        </div>
        <button className="ln-btn" onClick={openCreateModal}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
          Create flag
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="spinner-wrap">
          <div className="spinner" />
          Loading flags…
        </div>
      ) : (
        <div className="ln-table-wrap">
          <table className="ln-table">
            <colgroup>
              <col style={{ width: "30%" }} />
              <col style={{ width: "16%" }} />
              <col />
              <col style={{ width: "80px" }} />
              <col style={{ width: "120px" }} />
            </colgroup>
            <thead>
              <tr>
                <th>Flag key</th>
                <th>Status</th>
                <th>Rollout</th>
                <th style={{ textAlign: "center" }}>Toggle</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {flags.map((flag) => (
                <tr key={flag.id}>
                  {/* Key */}
                  <td>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--color-text)" }}>
                      {flag.key}
                    </span>
                  </td>

                  {/* Status */}
                  <td>
                    {flag.enabled ? (
                      <span className="badge-active">
                        <span className="badge-dot badge-dot-pulse" />
                        Active
                      </span>
                    ) : (
                      <span className="badge-inactive">
                        <span className="badge-dot" />
                        Inactive
                      </span>
                    )}
                  </td>

                  {/* Rollout */}
                  <td>
                    <div className="rollout-wrap">
                      <div className="rollout-track">
                        <div
                          className={`rollout-fill${flag.enabled ? "" : " off"}`}
                          style={{ width: `${flag.rolloutPercentage}%` }}
                        />
                      </div>
                      <Input
                        inline
                        type="number"
                        min={0}
                        max={100}
                        value={flag.rolloutPercentage}
                        onChange={(e) => handleRollout(flag, Number(e.target.value))}
                        className="rollout-input"
                      />
                      <span className="rollout-pct">%</span>
                    </div>
                  </td>

                  {/* Toggle */}
                  <td style={{ textAlign: "center" }}>
                    <Toggle enabled={flag.enabled} onChange={() => handleToggle(flag)} />
                  </td>

                  {/* Actions */}
                  <td style={{ textAlign: "right" }}>
                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                      <DropdownMenu 
                        items={[
                          { label: "Edit flag", onClick: () => openEditModal(flag) },
                          { label: "Delete", onClick: () => handleDelete(flag), variant: "danger" }
                        ]}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {flags.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon">⚑</div>
              <div className="empty-state-title">No flags yet</div>
              <div className="empty-state-desc">Create your first feature flag to get started.</div>
            </div>
          )}
        </div>
      )}
      <style jsx>{`
        .rules-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 12px;
        }
        .rule-row {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr auto;
          gap: 8px;
          align-items: center;
        }
        .rule-remove {
          background: none;
          border: none;
          color: var(--color-muted);
          font-size: 18px;
          cursor: pointer;
          padding: 0 4px;
        }
        .rule-remove:hover {
          color: #ff4444;
        }
        .ln-input-sm, .ln-select-sm {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--color-border);
          border-radius: 4px;
          color: var(--color-text);
          padding: 4px 8px;
          font-size: 12px;
        }
        .ln-btn-sm {
          padding: 4px 12px;
          font-size: 11px;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
}
