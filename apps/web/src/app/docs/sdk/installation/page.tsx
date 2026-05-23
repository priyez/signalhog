export default function SDKInstallationPage() {
  return (
    <div className="docs-article">
      <h1>SDK Installation</h1>
      <p>
        Getting started with SignalHog is easy. We provide official SDKs for major platforms, 
        ensuring you have type safety and high-performance flag evaluation out of the box.
      </p>

      <h2>React / Next.js</h2>
      <p>Install the React SDK using your preferred package manager:</p>
      <pre>
        <code>npm install @signalhog/react</code>
      </pre>

      <h2>Node.js</h2>
      <p>For server-side environments, use the Node.js SDK:</p>
      <pre>
        <code>npm install @signalhog/node</code>
      </pre>

      <h2>Python (Coming Soon)</h2>
      <p>The Python SDK is currently in beta. To participate, please contact our engineering team.</p>

      <h2>Core Architecture</h2>
      <p>
        Our SDKs are designed to be <b>local-first</b>. Instead of making an HTTP request for every flag check, 
        the SDK fetches the project configuration once and evaluates flags locally on the device or server.
      </p>
      
      <ul>
        <li><b>Zero Latency:</b> Flag evaluation happens in microseconds.</li>
        <li><b>Resilience:</b> If the SignalHog API is unavailable, the SDK uses cached values or safe defaults.</li>
        <li><b>Security:</b> Your targeting rules stay within your infrastructure.</li>
      </ul>
    </div>
  );
}
