import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: "https://aether.haciensus.com", changeFrequency: "monthly", priority: 1 }];
}
