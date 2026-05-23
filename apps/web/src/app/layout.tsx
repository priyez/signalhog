import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SignalHog — Ship with confidence",
  description:
    "Production-grade feature flag platform. Toggle features instantly without redeployments.",
  keywords: ["feature flags", "feature toggles", "development", "deployment", "launchdarkly alternative"],
  authors: [{ name: "SignalHog Team" }],
  openGraph: {
    title: "SignalHog — Ship with confidence",
    description: "Production-grade feature flag platform. Toggle features instantly without redeployments.",
    url: "https://signalhog.com",
    siteName: "SignalHog",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SignalHog — Ship with confidence",
    description: "Production-grade feature flag platform. Toggle features instantly without redeployments.",
  },
};

import { SessionProvider } from "next-auth/react";
import { MobileBlockerWrapper } from "@/components/MobileBlockerWrapper";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <SessionProvider>
          <MobileBlockerWrapper>{children}</MobileBlockerWrapper>
        </SessionProvider>
      </body>
    </html>
  );
}
