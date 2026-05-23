export default function DocsConceptEnvironmentsPage() {
  return (
    <div className="docs-article">
      <h1 id="overview">Projects & Environments</h1>
      <p>
        SignalHog offers a highly structured hierarchical model to organize, sandbox, and manage configurations safely across multiple stages of your software delivery cycle.
      </p>

      <h2>Projects</h2>
      <p>
        A <b>Project</b> represents a complete application or service group (e.g. <code>Marketing Web</code> or <code>Payment Backend API</code>). Feature flags are created inside a Project and automatically inherit targeting definitions across all of its sub-environments.
      </p>

      <h2>Environments</h2>
      <p>
        An <b>Environment</b> is a fully isolated workspace stage. By default, every project in SignalHog is initialized with three distinct environments:
      </p>
      <ul>
        <li>
          <b>Development:</b> A sandbox workspace designed for engineering experimentation and local unit testing.
        </li>
        <li>
          <b>Staging:</b> A pre-release environment matching production configurations for QA testing and integration reviews.
        </li>
        <li>
          <b>Production:</b> The high-stakes environment serving live application users. Fully audited with scoped change histories.
        </li>
      </ul>

      <h2>Credential Isolation</h2>
      <p>
        To prevent leakage, each environment maintains its own set of dedicated **API Keys**. The values of a feature flag in Development have zero impact on Production, giving your team complete confidence during testing:
      </p>
      <pre>
        <code>{`// Development Client Init
const devClient = new SignalHogClient({ apiKey: 'sh_dev_key_abc123' });

// Production Client Init
const prodClient = new SignalHogClient({ apiKey: 'sh_prod_key_xyz789' });`}</code>
      </pre>

      <div className="docs-note" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '16px', borderRadius: '8px', margin: '32px 0' }}>
        <p style={{ margin: 0, color: '#ef4444', fontSize: '14px' }}>
          <b>Security Precaution:</b> Always store your Staging and Production environment credentials in secure environment variables. Never write raw keys directly inside client-side repository commits.
        </p>
      </div>
    </div>
  );
}
