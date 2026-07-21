import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://aether.haciensus.com"),
  title: {
    default: "Aether: Claude Code & Codex Observability TUI",
    template: "%s · Aether",
  },
  description:
    "Open-source, local observability for Claude Code and Codex. Track context, tokens, cost, latency, agents, compactions, tools, and code changes.",
  applicationName: "Aether",
  authors: [{ name: "Chirag Goel", url: "https://github.com/connectchiragg" }],
  creator: "Chirag Goel",
  keywords: [
    "Claude Code observability",
    "Codex observability",
    "AI agent monitoring",
    "LLM observability",
    "terminal dashboard",
    "developer tools",
    "Rust TUI",
    "open source",
  ],
  openGraph: {
    type: "website",
    url: "https://aether.haciensus.com",
    siteName: "Aether",
    title: "Aether: Claude Code & Codex Observability TUI",
    description: "See context, tokens, cost, latency, tools, compactions, agents, and code changes in one local terminal dashboard.",
    images: [{ url: "/og.png", width: 1536, height: 1024, alt: "Aether local observability dashboard for Claude Code and Codex" }],
  },
  twitter: {
    card: "summary_large_image",
    creator: "@haciensus",
    title: "Aether: Claude Code & Codex Observability TUI",
    description: "See context, tokens, cost, latency, tools, compactions, agents, and code changes locally.",
    images: ["/og.png"],
  },
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
  },
};

const softwareApplicationJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Aether",
  applicationCategory: "DeveloperApplication",
  applicationSubCategory: "AI agent observability",
  operatingSystem: "macOS, Linux",
  description:
    "Open-source, local observability TUI for Claude Code and Codex sessions, including context, tokens, cost, latency, tools, agents, compactions, and code changes.",
  url: "https://aether.haciensus.com",
  downloadUrl: "https://github.com/connectchiragg/aether/releases/latest",
  codeRepository: "https://github.com/connectchiragg/aether",
  license: "https://opensource.org/license/mit",
  author: {
    "@type": "Person",
    name: "Chirag Goel",
    url: "https://github.com/connectchiragg",
  },
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationJsonLd) }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Space+Grotesk:wght@400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
