import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import test from "node:test";

test("static Pages build includes Aether metadata and root mount", async () => {
  const html = await readFile(new URL("../pages-dist/index.html", import.meta.url), "utf8");
  assert.match(html, /Aether — See the invisible/);
  assert.match(html, /aether\.haciensus\.com/);
  assert.match(html, /id="root"/);
});

test("critical media and 3D assets are present", async () => {
  const model = await stat(new URL("../pages-dist/models/all-seeing-eye.glb", import.meta.url));
  const video = await stat(new URL("../pages-dist/media/aether-demo-v0.6.0.mp4", import.meta.url));
  assert.ok(model.size < 4_000_000, "optimized eye model should remain under 4 MB");
  assert.ok(video.size < 8_000_000, "optimized product tour should remain under 8 MB");
});
