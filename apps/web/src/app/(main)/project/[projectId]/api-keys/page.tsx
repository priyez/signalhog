"use client";

import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/api";
import { Copy, Check, Monitor, FileCode, Server, AlertTriangle } from "lucide-react";
import { CodeBlock } from "@/components/ui/CodeBlock";

type ApiKey = {
  id: string;
  key: string;
  type: 'PUBLIC' | 'SECRET';
  name?: string;
  environment: { name: string };
};

const ENV_CLASS: Record<string, string> = {
  Development: "env-dev",
  Staging: "env-stg",
  Production: "env-prod",
};

const DEMO_KEYS: ApiKey[] = [
  { id: "1", key: "pk_dev_abc123", type: 'PUBLIC', name: 'Default Public Key', environment: { name: "Development" } },
  { id: "2", key: "sk_dev_xyz789", type: 'SECRET', name: 'Default Secret Key', environment: { name: "Development" } },
];

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('react');

  const projectId = typeof window !== "undefined" ? localStorage.getItem("selectedProjectId") || "" : "";
  const token = typeof window !== "undefined" ? localStorage.getItem("token") || "" : "";

  useEffect(() => {
    if (!token || !projectId) { setLoading(false); return; }
    apiRequest(`/projects`, {}, token)
      .then((projects: unknown[]) => {
        const project = (projects as { id: string; environments: { name: string; apiKeys: any[] }[] }[])
          .find((p) => p.id === projectId);
        if (project) {
          const allKeys = project.environments?.flatMap((env) =>
            (env.apiKeys || []).map((k: any) => ({ ...k, environment: { name: env.name } }))
          ) ?? [];
          setKeys(allKeys);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const displayKeys = keys.length > 0 ? keys : DEMO_KEYS;

  return (
    <div>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div>
          <h1 className="page-title">API Keys</h1>
          <p className="page-subtitle">Manage your project API keys for frontend and backend integration.</p>
        </div>
      </div>

      {/* Integration Guide */}
      <div className="ln-card" style={{ marginBottom: 40, padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', background: 'rgba(255,255,255,0.02)' }}>
          {[
            { id: 'react', name: 'React', icon: <Monitor size={14} /> },
            { id: 'js', name: 'JavaScript', icon: <FileCode size={14} /> },
            { id: 'node', name: 'Node.js', icon: <Server size={14} /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '12px 20px',
                fontSize: '13px',
                fontWeight: 500,
                color: activeTab === tab.id ? 'var(--color-brand)' : 'var(--color-muted)',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === tab.id ? '2px solid var(--color-brand)' : '2px solid transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
            >
              <span>{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </div>

        <CodeBlock 
          code={getSnippet(activeTab, keys.find(k => k.type === 'PUBLIC' && k.environment.name === 'Development')?.key || 'pk_your_dev_key')}
          language={activeTab === 'react' ? 'tsx' : 'javascript'}
          showLineNumbers
        />
      </div>

      {/* Keys list */}
      {loading ? (
        <div className="spinner-wrap">
          <div className="spinner" />
          Loading keys…
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {['PUBLIC', 'SECRET'].map((type) => (
            <div key={type}>
              <h3 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-muted)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {type === 'PUBLIC' ? 'Public Keys (Browser/Client SDKs)' : 'Secret Keys (Server/Admin SDKs)'}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {displayKeys.filter(k => k.type === type).map((apiKey) => (
                  <div key={apiKey.id} className="key-row">
                    <span className={`key-env-badge ${ENV_CLASS[apiKey.environment.name] ?? "env-dev"}`}>
                      {apiKey.environment.name}
                    </span>
                    <span className="key-value" title={apiKey.key}>{apiKey.key}</span>
                    <button
                      className={`copy-btn${copied === apiKey.key ? " copied" : ""}`}
                      onClick={() => copyKey(apiKey.key)}
                    >
                      {copied === apiKey.key ? "Copied" : "Copy"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}


      <div className="notice">
        <span className="notice-icon">
          <AlertTriangle size={18} color="#f2994a" />
        </span>
        <div>
          <p className="notice-title">Keep your Production key secret</p>
          <p className="notice-desc">
            Never expose API keys in client-side code. Use environment variables and server-side SDK instances only.
          </p>
        </div>
      </div>
    </div>
  );
}

function getSnippet(tab: string, apiKey: string) {
  if (tab === 'react') {
    return `import { SignalHogProvider } from "@signalhog/react"

function App() {
  return (
    <SignalHogProvider apiKey="${apiKey}">
      <MyDashboard />
    </SignalHogProvider>
  )
}

// In your components:
// const { isEnabled } = useSignalHog()`;
  }
  if (tab === 'js') {
    return `import { createClient } from "@signalhog/js"

const hog = createClient({
  apiKey: "${apiKey}"
})

const isNewUi = await hog.isEnabled("new_dashboard_v2")`;
  }
  return `import { SignalHogClient } from "@signalhog/node"

const hog = new SignalHogClient({
  apiKey: "${apiKey}" // Use Public or Secret Key
})

await hog.init()
const enabled = hog.isEnabled("beta_access", "user_123")`;
}
