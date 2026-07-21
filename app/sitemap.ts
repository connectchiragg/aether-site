import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://aether.haciensus.com", changeFrequency: "weekly", priority: 1 },
    { url: "https://aether.haciensus.com/claude-code-observability/", changeFrequency: "monthly", priority: 0.8 },
    { url: "https://aether.haciensus.com/codex-observability/", changeFrequency: "monthly", priority: 0.8 },
    { url: "https://aether.haciensus.com/ai-agent-context-monitoring/", changeFrequency: "monthly", priority: 0.8 },
  ];
}
