import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import React from "react";
import { renderToString } from "react-dom/server";
import { createServer } from "vite";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const output = resolve(root, "pages-dist/index.html");
const vite = await createServer({
  root,
  configFile: false,
  appType: "custom",
  server: { middlewareMode: true },
});

try {
  const { AetherLanding } = await vite.ssrLoadModule("/app/AetherLanding.tsx");
  const markup = renderToString(React.createElement(AetherLanding));
  const html = await readFile(output, "utf8");
  const prerendered = html.replace('<div id="root"></div>', `<div id="root">${markup}</div>`);

  if (prerendered === html) {
    throw new Error("Static root mount was not found during prerendering");
  }

  await writeFile(output, prerendered);
} finally {
  await vite.close();
}
