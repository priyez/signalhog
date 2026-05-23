export default function DocsReactSdkPage() {
  return (
    <div className="docs-article">
      <h1 id="overview">React SDK Integration</h1>
      <p>
        The `@signalhog/react` library provides seamless client-side state synchronizations, reactive hooks, and telemetry event captures optimized for React and Next.js client environments.
      </p>

      <h2>1. Install the SDK</h2>
      <pre>
        <code>npm install @signalhog/react</code>
      </pre>

      <h2>2. Set up the Provider</h2>
      <p>
        Wrap your main layout or root component with the <code>SignalHogProvider</code>. Pass your environment client-side API Key and the current user context:
      </p>
      <pre>
        <code>{`import React from 'react';
import { SignalHogProvider } from '@signalhog/react';

const userContext = {
  key: 'user_409',
  email: 'client@company.com',
  customProps: {
    plan: 'enterprise'
  }
};

export default function App({ children }) {
  return (
    <SignalHogProvider
      apiKey="sh_client_key_77a28bc"
      user={userContext}
      options={{
        bootstrap: {}, // Preload server-side flags
        enableTelemetry: true
      }}
    >
      {children}
    </SignalHogProvider>
  );
}`}</code>
      </pre>

      <h2>3. Evaluate Flags using Hooks</h2>
      <p>
        Evaluate dynamic targeting flags reactively using the <code>useFeatureFlag</code> hook inside any child component:
      </p>
      <pre>
        <code>{`import React from 'react';
import { useFeatureFlag } from '@signalhog/react';

export function OnboardingWidget() {
  // Evaluates rule matching and falls back to 'false' if offline
  const isBetaPortalEnabled = useFeatureFlag('new-signup-funnel', false);

  return (
    <div className="widget-container">
      {isBetaPortalEnabled ? (
        <div className="premium-portal">Welcome to the Beta Portal!</div>
      ) : (
        <div className="standard-portal">Standard dashboard controls</div>
      )}
    </div>
  );
}`}</code>
      </pre>

      <h2>4. Dynamic Event Logging</h2>
      <p>
        Log customized user actions directly from client layouts to analyze flag correlations in the real-time ClickHouse metrics dashboard:
      </p>
      <pre>
        <code>{`import { useSignalHog } from '@signalhog/react';

export function CheckoutButton() {
  const signalhog = useSignalHog();

  const handleCheckout = () => {
    // Log conversion event
    signalhog.track('checkout_completed', {
      cartValue: 120.50,
      paymentMethod: 'stripe'
    });
  };

  return (
    <button onClick={handleCheckout} className="btn-buy">
      Complete Checkout
    </button>
  );
}`}</code>
      </pre>
    </div>
  );
}
