export default function DocsNodeSdkPage() {
  return (
    <div className="docs-article">
      <h1 id="overview">Node.js SDK Integration</h1>
      <p>
        The `@signalhog/node` package is a high-performance server-side client designed to handle local evaluation, in-memory rule evaluations, and background flag polling synchronization.
      </p>

      <h2>1. Installation</h2>
      <pre>
        <code>npm install @signalhog/node</code>
      </pre>

      <h2>2. Initialization Options</h2>
      <p>
        Configure the Node client inside your server startup routing. The client automatically starts a background synchronization thread to fetch targets periodically:
      </p>
      <pre>
        <code>{`import { SignalHogClient } from '@signalhog/node';

const client = new SignalHogClient({
  apiKey: 'sh_secret_key_88fa29', // Server-side environment key
  pollIntervalMs: 15000,           // Sync updates every 15 seconds
  timeoutMs: 3000,                 // HTTP sync timeout
  logger: console,                 // Custom log adapter
});`}</code>
      </pre>

      <div className="docs-note" style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', padding: '16px', borderRadius: '8px', margin: '32px 0' }}>
        <p style={{ margin: 0, color: '#3b82f6', fontSize: '14px' }}>
          <b>Security Notice:</b> Server-side API Keys carry full targeting configuration scopes. Never commit server API Keys directly into client bundle files or client-side NextAuth configs.
        </p>
      </div>

      <h2>3. Evaluating Flags Locally</h2>
      <p>
        Since flag targets are compiled in-memory, evaluating user context takes under 100 microseconds, completely avoiding external network latency:
      </p>
      <pre>
        <code>{`const context = {
  key: 'user_node_9281',
  email: 'admin@company.com',
  country: 'UK',
  customProps: {
    role: 'administrator'
  }
};

// Zero latency evaluation
const isSystemActive = await client.evaluate('admin-control-panel', context, false);`}</code>
      </pre>

      <h2>4. Flushing Events</h2>
      <p>
        By default, the client buffers telemetry evaluations and click actions to batch-insert them into the event warehouse pipeline. If your server is shutting down or runs inside a serverless (lambda) environment, you can trigger a manual flush:
      </p>
      <pre>
        <code>{`// Force flush buffered tracking events to ClickHouse pipelines
await client.flush();`}</code>
      </pre>
    </div>
  );
}
