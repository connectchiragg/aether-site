/* eslint-disable @next/next/no-html-link-for-pages -- emitted as standalone static documents */

const installCommands = [
  "brew trust --formula connectchiragg/tap/aether",
  "brew install connectchiragg/tap/aether",
  "aether watch",
];

type GuideQuestion = {
  question: string;
  answer: string;
};

export type IntentPageContent = {
  slug: string;
  navLabel: string;
  title: string;
  description: string;
  eyebrow: string;
  heading: string;
  emphasis: string;
  lede: string;
  screenshot: string;
  screenshotAlt: string;
  figureCaption: string;
  problemTitle: string;
  problemCopy: string;
  highlights: Array<[string, string, string]>;
  workflow: Array<[string, string]>;
  questions: GuideQuestion[];
};

export const intentPages: IntentPageContent[] = [
  {
    slug: "claude-code-observability",
    navLabel: "Claude Code",
    title: "Claude Code Observability: Context, Cost & Agents | Aether",
    description:
      "Monitor Claude Code sessions locally. See context usage, estimated cost, token flow, tool calls, compactions, code changes, and nested agents in one terminal TUI.",
    eyebrow: "Claude Code observability",
    heading: "See what Claude Code",
    emphasis: "is doing to your context.",
    lede:
      "Aether turns Claude Code's local session trail into a live operational view. Find expensive turns, compaction resets, tool-heavy work, and nested agents without adding an SDK or uploading prompts.",
    screenshot: "/screenshots/metrics.png",
    screenshotAlt: "Aether displaying synchronized Claude Code context, cost, token, duration, complexity, and code diff graphs",
    figureCaption: "Claude Code telemetry aligned by turn in a local terminal dashboard.",
    problemTitle: "Claude Code is productive. Its resource use is easy to miss.",
    problemCopy:
      "A long coding session can accumulate context, repeat cached input, launch agents, compact history, and touch many files. Aether keeps those events on one timeline so a slow or expensive turn has an explanation, not just a number.",
    highlights: [
      ["Context pressure", "Watch the active context window grow and see genuine compaction resets.", "WINDOW / %"],
      ["Token economics", "Separate input, output, cache reads, and reasoning emitted by Claude Code.", "TOKENS / USD"],
      ["Agent hierarchy", "Keep sub-agents attached to the parent turn, with their tools and code impact.", "PARENT / CHILD"],
      ["Work attribution", "Estimate which inputs consumed each request: context, tools, agents, memory, hooks, and runtime.", "INPUT / SPLIT"],
    ],
    workflow: [
      ["Discover", "Aether detects existing Claude Code session files automatically."],
      ["Normalize", "Provider-native events become turns, usage, actions, agents, and compactions."],
      ["Observe", "The terminal UI updates as Claude Code writes new events."],
    ],
    questions: [
      { question: "Does Aether require a Claude API key?", answer: "No. Aether reads Claude Code's existing local session data and never calls another model." },
      { question: "Does it upload Claude Code prompts or responses?", answer: "No. Parsing and rendering happen locally, and Aether does not modify provider transcripts." },
      { question: "Can it show Claude Code sub-agents?", answer: "Yes. Agent work is nested under the parent session rather than appearing as unrelated top-level chats." },
    ],
  },
  {
    slug: "codex-observability",
    navLabel: "Codex",
    title: "Codex Observability: Tokens, Cost, Context & Agents | Aether",
    description:
      "Observe OpenAI Codex sessions locally. Track context, estimated cost, tokens, duration, tools, compactions, code changes, and sub-agents from one terminal TUI.",
    eyebrow: "OpenAI Codex observability",
    heading: "Trace every Codex turn.",
    emphasis: "Keep the whole session legible.",
    lede:
      "Aether reads Codex's native local rollouts and turns them into synchronized graphs, action summaries, agent traces, and per-request input attribution. No hooks, API keys, or cloud dashboard are required.",
    screenshot: "/screenshots/agents.png",
    screenshotAlt: "Aether showing Codex sub-agents and their work inside a parent coding session",
    figureCaption: "Codex agents, actions, and code changes remain attached to their parent turn.",
    problemTitle: "A successful patch does not explain the path that produced it.",
    problemCopy:
      "Codex can search, patch, run tools, spawn agents, and compact context across a single task. Aether reconstructs that path from local rollouts, preserving provider titles and project identity while exposing the operational signals behind the result.",
    highlights: [
      ["Turn timeline", "Move across duration, cost, token, context, complexity, and code-diff graphs together.", "TURN / SYNC"],
      ["Cost estimates", "Use maintained model pricing and provider token totals for transparent API-equivalent estimates.", "MODEL / USD"],
      ["Tool outcomes", "See successful searches, patches, commands, compactions, and file changes by turn.", "ACTION / RESULT"],
      ["Input work", "Break each request into user prompt, retained context, tools, agents, memory, and provider runtime.", "ROOT / BRANCH"],
    ],
    workflow: [
      ["Discover", "Aether finds Codex sessions already stored on the machine."],
      ["Correlate", "Rollout records become sessions, turns, tool events, agents, and usage."],
      ["Follow", "Live tailing keeps the selected Codex session current while it runs."],
    ],
    questions: [
      { question: "Does Codex need special setup?", answer: "No. Run aether watch and installed providers are discovered automatically." },
      { question: "Are cost figures provider bills?", answer: "No. They are transparent API-equivalent estimates based on emitted token usage and maintained model pricing." },
      { question: "Can Aether distinguish Codex projects and sessions?", answer: "Yes. It uses provider-native session metadata and keeps nested agent work inside the parent session." },
    ],
  },
  {
    slug: "ai-agent-context-monitoring",
    navLabel: "Context monitoring",
    title: "AI Agent Context Monitoring & Token Attribution | Aether",
    description:
      "Understand what consumes an AI coding agent's context window. Aether visualizes context growth, compactions, tokens, tools, prompts, agents, and provider runtime locally.",
    eyebrow: "AI agent context monitoring",
    heading: "Context is a budget.",
    emphasis: "See where it goes.",
    lede:
      "Aether shows how coding-agent context grows across turns and estimates which sources account for each request. Repeated context is counted when the provider processes it again, while compacted history is replaced by the active summary.",
    screenshot: "/screenshots/metrics.png",
    screenshotAlt: "Aether context and token telemetry for an AI coding agent session",
    figureCaption: "Context growth and compaction markers share the same turn range as cost, tokens, and duration.",
    problemTitle: "Token totals tell you how much. Attribution tells you why.",
    problemCopy:
      "A request can include the new user prompt, retained history, tool definitions and results, agent instructions, memory, hooks, documents, and provider runtime. Aether reconciles deterministic estimates to provider-native input totals and makes the approximation explicit.",
    highlights: [
      ["Context growth", "Follow the active window turn by turn and distinguish material compactions from small usage changes.", "ACTIVE / %"],
      ["Input attribution", "Explore a left-to-right tree from the prompt root through categories and named sources.", "TOKENS / SHARE"],
      ["Repeated work", "Count retained context each time it is processed across internal parent and agent requests.", "ALL / REQUEST"],
      ["Safe labels", "Use sanitized tool, document, and agent identifiers without exposing prompts, arguments, or contents.", "LOCAL / PRIVATE"],
    ],
    workflow: [
      ["Read totals", "Provider-emitted input and cache totals remain the authoritative root."],
      ["Reconstruct", "A sequential ledger models retained history, tools, agents, and compaction boundaries."],
      ["Reconcile", "Estimated categories scale deterministically to the native total and are marked with a tilde."],
    ],
    questions: [
      { question: "Is per-component token attribution exact?", answer: "No. Providers expose request totals, not every component total. Aether marks category allocations as deterministic estimates." },
      { question: "What happens after compaction?", answer: "The compact summary replaces earlier active history in the context ledger instead of being added on top of it." },
      { question: "Does Aether display prompt or document contents?", answer: "No. The attribution tree uses sanitized metadata and never renders raw prompts, arguments, schemas, memory, or documents." },
    ],
  },
];

export function IntentPage({ content }: { content: IntentPageContent }) {
  return (
    <main className="guide-page">
      <header className="site-nav">
        <a className="wordmark" href="/" aria-label="Aether home">
          <span className="wordmark-dot" aria-hidden="true" />
          <span>aether</span>
        </a>
        <nav aria-label="Guide navigation">
          <a href="/#signals">Signals</a>
          <a href="/#install">Install</a>
          <a className="nav-github" href="https://github.com/connectchiragg/aether">GitHub ↗</a>
        </nav>
      </header>

      <section className="guide-hero section-shell">
        <div className="guide-hero-copy">
          <p className="eyebrow"><span>GUIDE</span><i /> {content.eyebrow}</p>
          <h1>{content.heading}<br /><em>{content.emphasis}</em></h1>
          <p>{content.lede}</p>
          <div className="hero-actions">
            <a className="primary-button" href="#install"><span>$</span> Install Aether</a>
            <a className="secondary-button" href="https://github.com/connectchiragg/aether"><span>★</span> Star on GitHub</a>
          </div>
        </div>
        <figure className="guide-hero-shot">
          <img src={content.screenshot} alt={content.screenshotAlt} />
          <figcaption>{content.figureCaption}</figcaption>
        </figure>
      </section>

      <section className="guide-problem section-shell section-rule">
        <p className="eyebrow"><span>01</span><i /> The operational gap</p>
        <div className="guide-problem-grid">
          <h2>{content.problemTitle}</h2>
          <p>{content.problemCopy}</p>
        </div>
      </section>

      <section className="section-shell section-rule">
        <div className="section-heading">
          <p className="eyebrow"><span>02</span><i /> What becomes visible</p>
          <h2>Useful signals.<br /><em>One shared timeline.</em></h2>
        </div>
        <div className="guide-signal-grid">
          {content.highlights.map(([title, description, meta]) => (
            <article key={title}>
              <code>{meta}</code>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-shell section-rule">
        <div className="section-heading">
          <p className="eyebrow"><span>03</span><i /> Local pipeline</p>
          <h2>Native trails in.<br /><em>Operational clarity out.</em></h2>
        </div>
        <div className="guide-workflow">
          {content.workflow.map(([title, description], index) => (
            <article key={title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-shell section-rule guide-faq">
        <div className="section-heading">
          <p className="eyebrow"><span>04</span><i /> Practical questions</p>
          <h2>Know what Aether<br /><em>does and does not do.</em></h2>
        </div>
        <div className="guide-faq-list">
          {content.questions.map(({ question, answer }) => (
            <article key={question}>
              <h3>{question}</h3>
              <p>{answer}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="install" className="install-section section-shell section-rule">
        <div className="section-heading section-heading--center">
          <p className="eyebrow"><span>05</span><i /> Start observing</p>
          <h2>Three commands.<br /><em>No instrumentation.</em></h2>
        </div>
        <div className="terminal-install">
          <div className="terminal-title"><span>AETHER SETUP</span><span>LOCAL SHELL</span></div>
          {installCommands.map((command) => (
            <div className="command-row" key={command}>
              <span className="prompt">$</span>
              <code>{command}</code>
            </div>
          ))}
        </div>
      </section>

      <section className="guide-related section-shell section-rule">
        <p className="eyebrow"><span>06</span><i /> More field guides</p>
        <div className="guide-related-grid">
          {intentPages.filter((page) => page.slug !== content.slug).map((page) => (
            <a href={`/${page.slug}/`} key={page.slug}>
              <span>{page.eyebrow}</span>
              <strong>{page.heading}</strong>
              <i>Read guide →</i>
            </a>
          ))}
        </div>
      </section>

      <footer className="site-footer section-shell">
        <div className="footer-main">
          <a className="wordmark" href="/"><span className="wordmark-dot" aria-hidden="true" /><span>aether</span></a>
          <p>Local, live observability for coding agents.</p>
          <a href="https://github.com/connectchiragg/aether">Star on GitHub ↗</a>
        </div>
        <div className="footer-meta"><span>© 2026 Chirag Goel · MIT</span><span>macOS + Linux</span></div>
      </footer>
    </main>
  );
}
