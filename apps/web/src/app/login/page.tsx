"use client";

import Link from "next/link";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { apiRequest } from "@/lib/api";
import { PlatformLogo } from "@/components/PlatformLogo";

export default function LoginPage() {
  const { status } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      localStorage.setItem("token", response.token);
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo">
          <PlatformLogo />
          <span className="logo-text">SignalHog</span>
        </div>

        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Sign in to your workspace</p>

        {error && <div className="form-error">{error}</div>}

        <div className="oauth-grid" style={{ gridTemplateColumns: "1fr", gap: "12px", marginTop: "24px" }}>
          <button className="oauth-btn" style={{ padding: "12px" }} onClick={() => signIn("github", { callbackUrl: "/dashboard" })}>
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
            </svg>
            Continue with GitHub
          </button>
          <button className="oauth-btn" style={{ padding: "12px" }} onClick={() => signIn("google", { callbackUrl: "/dashboard" })}>
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.49 12.275c0-.825-.075-1.62-.21-2.385H12v4.515h6.45c-.285 1.515-1.14 2.805-2.43 3.66v3.045h3.93c2.31-2.13 3.63-5.265 3.63-8.835z" />
              <path fill="#34A853" d="M12 24c3.24 0 5.955-1.08 7.935-2.91l-3.93-3.045c-1.08.735-2.475 1.155-4.005 1.155-3.09 0-5.715-2.085-6.645-4.89H1.425v3.135C3.405 21.39 7.395 24 12 24z" />
              <path fill="#FBBC05" d="M5.355 14.31c-.24-.72-.375-1.485-.375-2.31s.135-1.59.375-2.31V6.555H1.425C.525 8.355 0 10.365 0 12.5s.525 4.145 1.425 5.94l3.93-3.13z" />
              <path fill="#EA4335" d="M12 4.755c1.77 0 3.36.615 4.605 1.8l3.45-3.45C17.94 1.185 15.225 0 12 0 7.395 0 3.405 2.61 1.425 6.555L5.355 9.69c.93-2.805 3.555-4.935 6.645-4.935z" />
            </svg>
            Continue with Google
          </button>
        </div>

        <p className="auth-link-row">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="auth-link">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
