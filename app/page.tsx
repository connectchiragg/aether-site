import type { Metadata } from "next";
import { AetherLanding } from "./AetherLanding";

export const metadata: Metadata = {
  title: { absolute: "Aether: Claude Code & Codex Observability TUI" },
  description:
    "Open-source, local observability for Claude Code and Codex. Track context, tokens, cost, latency, agents, compactions, tools, and code changes.",
  alternates: { canonical: "/" },
};

export default function Home() {
  return <AetherLanding />;
}
