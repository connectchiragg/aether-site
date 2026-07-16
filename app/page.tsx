import type { Metadata } from "next";
import { AetherLanding } from "./AetherLanding";

export const metadata: Metadata = {
  title: "Aether — See the invisible",
  description:
    "Local, live observability for Claude Code and Codex. Understand context, cost, complexity, code changes, tools, compactions, and sub-agents without leaving your terminal.",
  alternates: { canonical: "/" },
};

export default function Home() {
  return <AetherLanding />;
}
