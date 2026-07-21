import { mkdir, readFile, writeFile } from "node:fs/promises";
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
  const { IntentPage, intentPages } = await vite.ssrLoadModule("/app/IntentPage.tsx");
  const markup = renderToString(React.createElement(AetherLanding));
  const html = await readFile(output, "utf8");
  const prerendered = html.replace('<div id="root"></div>', `<div id="root">${markup}</div>`);

  if (prerendered === html) {
    throw new Error("Static root mount was not found during prerendering");
  }

  await writeFile(output, prerendered);

  for (const content of intentPages) {
    const pageMarkup = renderToString(React.createElement(IntentPage, { content }));
    const pageUrl = `https://aether.haciensus.com/${content.slug}/`;
    const schema = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebPage",
          name: content.eyebrow,
          headline: content.title.replace(/ \| Aether$/, ""),
          description: content.description,
          url: pageUrl,
          isPartOf: { "@type": "WebSite", name: "Aether", url: "https://aether.haciensus.com/" },
          about: { "@type": "SoftwareApplication", name: "Aether", applicationCategory: "DeveloperApplication" },
        },
        {
          "@type": "FAQPage",
          mainEntity: content.questions.map(({ question, answer }) => ({
            "@type": "Question",
            name: question,
            acceptedAnswer: { "@type": "Answer", text: answer },
          })),
        },
        {
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Aether", item: "https://aether.haciensus.com/" },
            { "@type": "ListItem", position: 2, name: content.eyebrow, item: pageUrl },
          ],
        },
      ],
    };

    let guideHtml = html
      .replace('<div id="root"></div>', `<div id="root">${pageMarkup}</div>`)
      .replace(/<script type="module"[^>]*src="[^"]+"><\/script>/g, "")
      .replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(content.title)}</title>`)
      .replace(/<meta name="description" content="[^"]*"\s*\/?>/, `<meta name="description" content="${escapeHtml(content.description)}" />`)
      .replace(/<link rel="canonical" href="[^"]*"\s*\/?>/, `<link rel="canonical" href="${pageUrl}" />`)
      .replace(/<meta property="og:url" content="[^"]*"\s*\/?>/, `<meta property="og:url" content="${pageUrl}" />`)
      .replace(/<meta property="og:title" content="[^"]*"\s*\/?>/, `<meta property="og:title" content="${escapeHtml(content.title)}" />`)
      .replace(/<meta property="og:description" content="[^"]*"\s*\/?>/, `<meta property="og:description" content="${escapeHtml(content.description)}" />`)
      .replace(/<meta name="twitter:title" content="[^"]*"\s*\/?>/, `<meta name="twitter:title" content="${escapeHtml(content.title)}" />`)
      .replace(/<meta name="twitter:description" content="[^"]*"\s*\/?>/, `<meta name="twitter:description" content="${escapeHtml(content.description)}" />`)
      .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, `<script type="application/ld+json">${safeJson(schema)}</script>`);

    if (!guideHtml.includes(pageMarkup) || guideHtml.includes('<div id="root"></div>')) {
      throw new Error(`Failed to prerender ${content.slug}`);
    }

    const guideDirectory = resolve(root, "pages-dist", content.slug);
    await mkdir(guideDirectory, { recursive: true });
    await writeFile(resolve(guideDirectory, "index.html"), guideHtml);
  }
} finally {
  await vite.close();
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function safeJson(value) {
  return JSON.stringify(value).replaceAll("<", "\\u003c");
}
