"use client";

import React, { useState, useRef } from "react";

const sdkSnippets = {
  install: `$ pnpm add @signalhog/node

# Initializing SignalHog config...
$ npx signalhost init

✔ Created signalhog.config.json
✔ Linked workspace with SignalHost Cloud Edge
✔ Local evaluation modules initialized!

You're ready to ship feature flags in <1ms.`,
  js: `import { SignalHog } from "@signalhog/js";

const client = new SignalHog("sh_pk_live_8f792b");
await client.init();

if (client.evaluate("new-payment-flow", { userId: "user_872" })) {
  renderModernPaymentScreen();
} else {
  renderLegacyPaymentScreen();
}`,
  node: `const { SignalHog } = require("@signalhog/node");

const client = new SignalHog({
  apiKey: "sh_sk_live_f893ca",
  localEvaluation: true, // evaluated locally in 0.1ms
});

app.get("/checkout", async (req, res) => {
  const isEnabled = await client.isFeatureEnabled("new-pricing-flow", req.user.id);
  res.render("checkout", { isEnabled });
});`
};

export function LandingDeveloperSuite() {
  const [selectedSdk, setSelectedSdk] = useState<"install" | "js" | "node">("install");
  const [copiedSdk, setCopiedSdk] = useState(false);
  const [simulatedLogs, setSimulatedLogs] = useState<Array<{ id: number; text: string; latency: string; flag: string }>>([
    { id: 1, flag: "new-pricing-flow", text: "user_891 evaluated Gold Tier", latency: "0.22ms" },
    { id: 2, flag: "beta-portal", text: "user_421 evaluated Off (Control)", latency: "0.15ms" },
    { id: 3, flag: "search-algorithm", text: "user_303 evaluated AI Search v2", latency: "0.45ms" },
  ]);

  const logCounterRef = useRef(4);

  const handleCopySdk = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedSdk(true);
    setTimeout(() => setCopiedSdk(false), 2000);
  };

  const handleSimulateLog = () => {
    const flags = ["analytics-v2", "dark-mode-default", "smart-recommendations", "onboarding-v4"];
    const evaluations = ["Gold Tier", "Off (Control)", "Experimental Variation", "Active Test Group"];
    const randomFlag = flags[Math.floor(Math.random() * flags.length)];
    const randomEval = evaluations[Math.floor(Math.random() * evaluations.length)];
    const randomUser = `user_${Math.floor(Math.random() * 800) + 100}`;
    const randomLatency = `${(Math.random() * 0.4 + 0.1).toFixed(2)}ms`;

    const newLog = {
      id: logCounterRef.current++,
      flag: randomFlag,
      text: `${randomUser} evaluated ${randomEval}`,
      latency: randomLatency
    };

    setSimulatedLogs(prev => [newLog, ...prev.slice(0, 5)]);
  };

  return (
    <section id="features" className="developer-suite">
      <h2 className="section-pretitle">developer suite</h2>
      <h3 className="section-title">First-class developer experience</h3>

      <div className="dev-grid">
        {/* Card A: SDK Tabs */}
        <div className="dev-card card-sdk">
          <div className="card-header sdk-card-header">
            <div className="header-window-dots">
              <span className="window-dot red"></span>
              <span className="window-dot yellow"></span>
              <span className="window-dot green"></span>
            </div>
            <div className="sdk-tabs">
              <button
                onClick={() => setSelectedSdk("install")}
                className={`sdk-tab-btn ${selectedSdk === 'install' ? 'active' : ''}`}
              >
                Pnpm Install
              </button>
              <button
                onClick={() => setSelectedSdk("js")}
                className={`sdk-tab-btn ${selectedSdk === 'js' ? 'active' : ''}`}
              >
                JS Client
              </button>
              <button
                onClick={() => setSelectedSdk("node")}
                className={`sdk-tab-btn ${selectedSdk === 'node' ? 'active' : ''}`}
              >
                Node.js
              </button>
            </div>
            <button
              onClick={() => handleCopySdk(sdkSnippets[selectedSdk])}
              className="sdk-copy-btn"
              title="Copy code snippet"
            >
              {copiedSdk ? (
                <span className="sdk-copied-text">Copied!</span>
              ) : (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
              )}
            </button>
          </div>
          <div className="card-body snippet-body">
            <pre className="code-snippet">
              <code>{sdkSnippets[selectedSdk]}</code>
            </pre>
          </div>
        </div>

        {/* Card B: Real-time Ingestion Stream */}
        <div className="dev-card card-ingestion">
          <div className="card-header">
            <div className="card-badge">Instant Observability</div>
            <button onClick={handleSimulateLog} className="simulate-btn">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Simulate Flag Click
            </button>
          </div>
          <div className="card-body scrollable-logs">
            <div className="log-panel-header">
              <span>ClickHouse Stream Log</span>
              <span className="ingest-pulse">
                <span className="pulse-dot"></span>
                Active
              </span>
            </div>
            <div className="log-rows-container">
              {simulatedLogs.map(log => (
                <div key={log.id} className="log-row-item animate-fadein">
                  <span className="log-dot animate-pulse"></span>
                  <span className="log-flag">{log.flag}</span>
                  <span className="log-text">{log.text}</span>
                  <span className="log-latency">{log.latency}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
