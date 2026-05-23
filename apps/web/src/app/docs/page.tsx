export default function DocsPage() {
  return (
    <div className="docs-article">
      <h1 id="overview">What is SignalHog?</h1>
      <p>
        SignalHog is a high-performance feature management and product analytics platform built for engineering teams 
        who demand speed, type safety, and deep insights.
      </p>

      <p>
        Unlike traditional feature flag tools that operate as separate silos, SignalHog integrates directly with your 
        event streams (via ClickHouse) to provide immediate correlation between feature toggles and user behavior.
      </p>

      <div className="docs-note" style={{ background: 'rgba(52, 211, 153, 0.1)', border: '1px solid rgba(52, 211, 153, 0.2)', padding: '16px', borderRadius: '8px', margin: '32px 0' }}>
        <p style={{ margin: 0, color: '#34d399', fontSize: '14px' }}>
          <b>Think of it like a CDN for your logic.</b> Distribute configuration changes globally in milliseconds with full TypeScript safety and zero-latency evaluation.
        </p>
      </div>

      <h2 id="why-it-exists">Why it exists</h2>
      <p>
        Modern software development requires moving fast without breaking things. However, most teams find themselves 
        choosing between:
      </p>
      <ul>
        <li><b>Brittle config files:</b> Hard to change, requires redeploys, and provides zero visibility.</li>
        <li><b>Overpriced SaaS:</b> Limited flexibility, vendor lock-in, and disconnected from your actual user data.</li>
      </ul>
      <p>
        FeatureFlags bridges this gap by providing an open-source, scalable foundation for feature experimentation 
        and deterministic rollouts.
      </p>

      <h2>Key Features</h2>
      <ul>
        <li><b>Real-time Rollouts:</b> Update flags across your entire stack in under 100ms.</li>
        <li><b>Advanced Targeting:</b> Roll out features based on user properties, cohorts, or percentage-based traffic.</li>
        <li><b>Integrated Analytics:</b> Automatically track how flags affect your conversion funnels and retention.</li>
        <li><b>Developer First:</b> Native SDKs for React, Node.js, and more with full type safety.</li>
      </ul>
    </div>
  );
}
