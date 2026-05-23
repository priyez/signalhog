export default function SDKAuthenticationPage() {
  return (
    <div className="docs-article">
      <h1>Authentication</h1>
      <p>
        To securely connect your application to SignalHog, you must provide a valid API key. 
        Depending on your environment, you will use either a <b>Public</b> or <b>Secret</b> key.
      </p>

      <h2>Key Types</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', margin: '32px 0' }}>
        <div className="ln-card" style={{ padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)' }}>
          <h3 style={{ fontSize: '14px', marginBottom: '8px', color: '#fff' }}>Public Key (pk_...)</h3>
          <p style={{ fontSize: '13px', margin: 0 }}>Safe for client-side use (React, iOS, Android). Scoped to read-only flag evaluation.</p>
        </div>
        <div className="ln-card" style={{ padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)' }}>
          <h3 style={{ fontSize: '14px', marginBottom: '8px', color: '#fff' }}>Secret Key (sk_...)</h3>
          <p style={{ fontSize: '13px', margin: 0 }}>For server-side use only. Provides full access to management and analytics APIs.</p>
        </div>
      </div>

      <h2>Initialization</h2>
      <p>Initialize the SDK at the entry point of your application:</p>
      
      <h3>React</h3>
      <pre>
        <code>{`import { FeatureProvider } from '@signalhog/react';

function App({ children }) {
  return (
    <FeatureProvider apiKey="pk_your_public_key">
      {children}
    </FeatureProvider>
  );
}`}</code>
      </pre>

      <h3>Node.js</h3>
      <pre>
        <code>{`const { SignalHog } = require('@signalhog/node');

const client = new SignalHog({
  apiKey: "sk_your_secret_key"
});

await client.waitForInitialization();`}</code>
      </pre>

      <div className="docs-warning" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '16px', borderRadius: '8px', margin: '32px 0' }}>
        <p style={{ margin: 0, color: '#ef4444', fontSize: '14px' }}>
          <b>Security Warning:</b> Never expose your Secret Key (sk_...) in client-side code, public repositories, or environment variables accessible to the browser.
        </p>
      </div>
    </div>
  );
}
