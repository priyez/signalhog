export default function DocsQuickstartPage() {
  return (
    <div className="docs-article">
      <h1 id="overview">Quickstart Guide</h1>
      <p>
        Get up and running with SignalHog in under 5 minutes. This quickstart guide walks you through setting up your first feature flag, initializing the SDK, and streaming live evaluation data.
      </p>

      <h2>1. Get your API Credentials</h2>
      <p>
        Before writing code, retrieve your Environment API Key from the SignalHog dashboard:
      </p>
      <ul>
        <li>Navigate to <b>Settings &gt; API Keys</b>.</li>
        <li>Copy your client-side or server-side key for the <code>Development</code> environment.</li>
      </ul>

      <h2>2. Install the SDK</h2>
      <p>
        Install the native SignalHog client package into your application:
      </p>
      <pre>
        <code>npm install @signalhog/node</code>
      </pre>

      <h2>3. Initialize and Evaluate</h2>
      <p>
        Initialize the local client using your API Key and evaluate a target feature flag instantly with deterministic local evaluation:
      </p>
      <pre>
        <code>{`import { SignalHogClient } from '@signalhog/node';

// Initialize the zero-latency client
const signalhog = new SignalHogClient({
  apiKey: 'sh_dev_key_example_928c',
  pollIntervalMs: 10000, // Sync flag updates in background
});

// Evaluate targeting rules locally in 100 microseconds
const userContext = {
  key: 'user_409',
  email: 'dev@company.com',
  country: 'US',
};

const isBetaEnabled = await signalhog.evaluate('new-signup-funnel', userContext, false);

if (isBetaEnabled) {
  console.log("Serving the immersive Beta Onboarding experience!");
} else {
  console.log("Serving the standard onboarding experience.");
}`}</code>
      </pre>

      <div className="docs-note" style={{ background: 'rgba(52, 211, 153, 0.1)', border: '1px solid rgba(52, 211, 153, 0.2)', padding: '16px', borderRadius: '8px', margin: '32px 0' }}>
        <p style={{ margin: 0, color: '#34d399', fontSize: '14px' }}>
          <b>Deterministic Evaluation:</b> Becausetargeting evaluations are performed in-memory, you achieve zero-latency responses without blocking server threads or calling external APIs on every request.
        </p>
      </div>

      <h2>4. Stream Telemetry Analytics</h2>
      <p>
        Evaluation logs and event telemetry are automatically queued and streamed in batches to the ClickHouse pipeline:
      </p>
      <pre>
        <code>{`// Log standard custom events to correlate flags with conversion metrics
signalhog.track('user_onboarded', userContext, {
  revenue: 29.00,
  durationSeconds: 45
});`}</code>
      </pre>
    </div>
  );
}
