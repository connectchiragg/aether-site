import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import test from "node:test";

test("static Pages build includes search metadata and prerendered product copy", async () => {
  const html = await readFile(new URL("../pages-dist/index.html", import.meta.url), "utf8");
  assert.match(html, /Aether: Claude Code &amp; Codex Observability TUI/);
  assert.match(html, /aether\.haciensus\.com/);
  assert.match(html, /application\/ld\+json/);
  assert.match(html, /"@type": "SoftwareApplication"/);
  assert.match(html, /id="root">[\s\S]*?<main>/);
  assert.match(html, /View product tour/);
  assert.match(html, /Star on GitHub/);
  assert.match(html, /href="\/claude-code-observability\/"/);
  assert.match(html, /href="\/codex-observability\/"/);
  assert.match(html, /href="\/ai-agent-context-monitoring\/"/);
});

const guides = [
  ["claude-code-observability", "Claude Code Observability", /See what Claude Code/],
  ["codex-observability", "Codex Observability", /Trace every Codex turn/],
  ["ai-agent-context-monitoring", "AI Agent Context Monitoring", /Context is a budget/],
];

for (const [slug, title, bodyPattern] of guides) {
  test(`${slug} is a standalone indexed guide`, async () => {
    const html = await readFile(new URL(`../pages-dist/${slug}/index.html`, import.meta.url), "utf8");
    assert.match(html, new RegExp(`<title>${title}`));
    assert.match(html, new RegExp(`rel="canonical" href="https://aether\\.haciensus\\.com/${slug}/"`));
    assert.match(html, /"@type":"FAQPage"/);
    assert.match(html, bodyPattern);
    assert.match(html, /Star on GitHub/);
    assert.doesNotMatch(html, /<div id="root"><\/div>/);
    assert.doesNotMatch(html, /<script type="module"[^>]*src=/);
  });
}

test("sitemap exposes every indexed guide", async () => {
  const sitemap = await readFile(new URL("../pages-dist/sitemap.xml", import.meta.url), "utf8");
  for (const [slug] of guides) {
    assert.match(sitemap, new RegExp(`https://aether\\.haciensus\\.com/${slug}/`));
  }
});

test("critical media and 3D assets are present", async () => {
  const model = await stat(new URL("../pages-dist/models/all-seeing-eye.glb", import.meta.url));
  const video = await stat(new URL("../pages-dist/media/aether-demo-v0.6.0.mp4", import.meta.url));
  assert.ok(model.size < 4_000_000, "optimized eye model should remain under 4 MB");
  assert.ok(video.size < 8_000_000, "optimized product tour should remain under 8 MB");
});
