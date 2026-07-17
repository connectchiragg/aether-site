import assert from "node:assert/strict";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    {
      ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
    },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server renders Aether's readable first response", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /Aether — See the invisible/);
  assert.match(html, /See the invisible/);
  assert.match(html, /View product tour/);
  assert.match(html, /Install with Homebrew/);
  assert.match(html, /brew trust --formula connectchiragg\/tap\/aether/);
  assert.match(html, /aether watch/);
  assert.doesNotMatch(html, /brew tap/);
  assert.doesNotMatch(html, /aether setup/);
  assert.match(html, /id="tour"/);
  assert.match(html, /id="signals"/);
  assert.match(html, /id="how-it-works"/);
  assert.match(html, /id="privacy"/);
  assert.match(html, /id="install"/);
});

test("heavy assets are deferred from the initial document", async () => {
  const response = await render();
  const html = await response.text();
  assert.match(html, /preload="metadata"/);
  assert.match(html, /autoPlay|autoplay/);
  assert.match(html, /loop=""/);
  assert.match(html, /muted=""/);
  assert.match(html, /loading="lazy"/);
  assert.doesNotMatch(html, /<link[^>]+(?:all-seeing-eye\.glb|aether-demo-v0\.6\.0\.mp4)/i);
});
