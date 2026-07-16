import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://aether.haciensus.com"),
  title: {
    default: "Aether — See the invisible",
    template: "%s · Aether",
  },
  description:
    "Local, live observability for Claude Code and Codex. Understand context, cost, complexity, code changes, tools, compactions, and sub-agents without leaving your terminal.",
  applicationName: "Aether",
  authors: [{ name: "Chirag Goel", url: "https://github.com/connectchiragg" }],
  keywords: ["Claude Code", "Codex", "observability", "terminal", "developer tools", "Rust", "open source"],
  openGraph: {
    type: "website",
    url: "https://aether.haciensus.com",
    siteName: "Aether",
    title: "Aether — See the invisible",
    description: "Local, live observability for Claude Code and Codex.",
    images: [{ url: "/og.png", width: 1536, height: 1024, alt: "Aether — See the invisible" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Aether — See the invisible",
    description: "Local, live observability for Claude Code and Codex.",
    images: ["/og.png"],
  },
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Space+Grotesk:wght@400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
