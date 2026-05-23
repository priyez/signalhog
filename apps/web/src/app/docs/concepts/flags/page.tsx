export default function DocsConceptFlagsPage() {
  return (
    <div className="docs-article">
      <h1 id="overview">Feature Flags</h1>
      <p>
        Feature flags (also known as feature toggles) are the core primitives inside SignalHog. They allow you to decouple software deployments from feature releases, enabling safe, incremental, and controllable rollouts.
      </p>

      <h2>Flag States</h2>
      <p>
        Every feature flag in SignalHog has two primary global states that determine how targeting configurations are processed:
      </p>
      <ul>
        <li>
          <b>Active / ON:</b> The SDK evaluates targeting rules, segments, and percentage rollouts dynamically against the provided user context.
        </li>
        <li>
          <b>Inactive / OFF:</b> The SDK completely bypasses the rule evaluation engine and immediately returns the global fallback variation.
        </li>
      </ul>

      <h2>Variations</h2>
      <p>
        SignalHog supports multiple variation types to fit a wide range of use cases:
      </p>
      <ul>
        <li>
          <b>Boolean:</b> The most common flag type. Evaluates to either <code>true</code> or <code>false</code>. Perfect for toggling UI elements or turning backend blocks on and off.
        </li>
        <li>
          <b>Multivariate:</b> Returns custom string values (e.g. <code>"variation-a"</code>, <code>"variation-b"</code>, <code>"control"</code>). Excellent for A/B testing, theme adjustments, or config overrides.
        </li>
      </ul>

      <h2>Scoping & Keys</h2>
      <p>
        Feature flags are uniquely identified across a project by their <b>Flag Key</b>. This key is an alphanumeric, kebab-case identifier (e.g. <code>new-signup-funnel</code>) used directly inside your codebase.
      </p>
      <pre>
        <code>{`// Example codebase reference
const isFeatureEnabled = await client.evaluate('kebab-case-flag-key', userContext);`}</code>
      </pre>

      <div className="docs-note" style={{ background: 'rgba(248, 190, 42, 0.1)', border: '1px solid rgba(248, 190, 42, 0.2)', padding: '16px', borderRadius: '8px', margin: '32px 0' }}>
        <p style={{ margin: 0, color: '#f8be2a', fontSize: '14px' }}>
          <b>Key immutability:</b> To prevent broken code paths, flag keys cannot be modified once they are created. Ensure you follow a consistent naming convention across your engineering team.
        </p>
      </div>
    </div>
  );
}
