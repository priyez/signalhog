export default function DocsConceptTargetingPage() {
  return (
    <div className="docs-article">
      <h1 id="overview">Targeting Rules & Gradual Rollouts</h1>
      <p>
        SignalHog features a powerful, deterministic evaluation engine that lets you target features to specific users, cohorts, or percentage allocations with ultra-low latency.
      </p>

      <h2>User Context</h2>
      <p>
        When evaluating a feature flag, you pass a <b>Context Object</b> containing user properties. The targeting engine evaluates your rules sequentially against these keys:
      </p>
      <pre>
        <code>{`const context = {
  key: 'user_409',            // Required unique identifier for hashing
  email: 'john@company.com',   // Custom targeting key
  country: 'US',              // Cohort matching key
  customProps: {
    plan: 'enterprise',
    version: '2.4.0'
  }
};`}</code>
      </pre>

      <h2>Rule Operators</h2>
      <p>
        SignalHog supports advanced comparison operators to cover complex business logic:
      </p>
      <ul>
        <li><b>String Matching:</b> <code>equals</code>, <code>contains</code>, <code>startsWith</code>, <code>endsWith</code> (e.g. <code>email endsWith "@company.com"</code>).</li>
        <li><b>Numeric Comparisons:</b> <code>&gt;</code>, <code>&gt;=</code>, <code>&lt;</code>, <code>&lt;=</code> (e.g. <code>revenue &gt; 100</code>).</li>
        <li><b>Segment Allocations:</b> Check membership within pre-compiled target user segments.</li>
      </ul>

      <h2>Deterministic Percentage Rollouts</h2>
      <p>
        Gradual percentage rollouts (e.g. roll out a feature to exactly 10% of users) use **MurmurHash3** calculations:
      </p>
      <ul>
        <li>The system hashes the combination of the <code>User Key</code> and the <code>Flag Key</code>.</li>
        <li>This yields a consistent, uniform distribution integer between 0 and 99.</li>
        <li>Because the calculation is purely mathematical and local, the same user is guaranteed to receive the exact same variation on every request, requiring zero database calls or stickiness tables.</li>
      </ul>

      <div className="docs-note" style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', padding: '16px', borderRadius: '8px', margin: '32px 0' }}>
        <p style={{ margin: 0, color: '#3b82f6', fontSize: '14px' }}>
          <b>A/B Testing Alignment:</b> Dynamic evaluations remain perfectly stable as long as the user's key remains constant. This ensures zero cohort pollution during active experimentations.
        </p>
      </div>
    </div>
  );
}
