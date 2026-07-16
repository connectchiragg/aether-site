"use client";

import { useRef, useState } from "react";
import { EyeCanvas } from "./EyeCanvas";

const installCommand = "brew install connectchiragg/tap/aether";

const signals = [
  ["Context", "See how much of the model window is occupied, including real compaction resets.", "WINDOW / LIVE"],
  ["Duration", "Find slow turns and compare them with the session median without leaving the terminal.", "TIME / Δ"],
  ["Estimated cost", "Read transparent API-equivalent token estimates with partial sessions clearly labelled.", "USD / EST"],
  ["Tokens", "Separate input, output, cached input, and reasoning usage emitted by each provider.", "I/O / CACHE"],
  ["Complexity", "A deterministic 0–100% view of reasoning effort across every turn.", "EFFORT / 100"],
  ["Code diff", "Track successful additions, removals, created files, and deleted files.", "+ / −"],
  ["Agent topology", "Keep sub-agents and hooks attached to the parent turn that created them.", "PARENT / CHILD"],
  ["Actions", "Inspect tools, patches, searches, compactions, outcomes, and model metadata.", "EVENT / STREAM"],
];

export function AetherLanding() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [copied, setCopied] = useState(false);

  const playTour = () => {
    const tour = document.getElementById("tour");
    tour?.scrollIntoView({ behavior: "smooth", block: "center" });
    window.setTimeout(() => videoRef.current?.play().catch(() => undefined), 650);
  };

  const copyInstall = async () => {
    try {
      await navigator.clipboard.writeText(installCommand);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.prompt("Copy the Homebrew command:", installCommand);
    }
  };

  return (
    <main>
      <header className="site-nav">
        <a className="wordmark" href="#top" aria-label="Aether home">
          <span className="wordmark-mark">æ</span>
          <span>aether</span>
        </a>
        <nav aria-label="Primary navigation">
          <a href="#signals">Signals</a>
          <a href="#privacy">Privacy</a>
          <a href="#install">Install</a>
          <a className="nav-github" href="https://github.com/connectchiragg/aether" target="_blank" rel="noreferrer">GitHub ↗</a>
        </nav>
      </header>

      <section id="top" className="hero section-shell">
        <div className="hero-grid">
          <div className="hero-copy">
            <p className="eyebrow"><span>00</span><i /> Local observability / v0.6.0</p>
            <h1><span>Aether.</span> See the<br />invisible.</h1>
            <p className="hero-lede">
              Local, live observability for <strong>Claude Code</strong> and <strong>Codex</strong>.
              Follow context, cost, complexity, code changes, tools, compactions, and sub-agents—without sending your data anywhere.
            </p>
            <div className="hero-actions">
              <button className="primary-button" onClick={playTour}><span>▶</span> Watch product tour</button>
              <a className="secondary-button" href="#install"><span>$</span> Install with Homebrew</a>
            </div>
            <div className="hero-proof" aria-label="Aether privacy summary">
              <span><b>01</b> No SDK</span>
              <span><b>02</b> No API keys</span>
              <span><b>03</b> No cloud dashboard</span>
            </div>
          </div>
          <div className="hero-visual">
            <EyeCanvas />
          </div>
        </div>
        <div className="scroll-marker" aria-hidden="true"><span>Scroll to observe</span><i /></div>
      </section>

      <section id="tour" className="tour-section section-shell section-rule">
        <div className="section-heading">
          <p className="eyebrow"><span>01</span><i /> Product tour</p>
          <h2>One session.<br /><em>Every signal aligned.</em></h2>
          <p>Move once and context, duration, cost, tokens, complexity, and code impact stay synchronized across the same turns.</p>
        </div>
        <div className="tour-frame">
          <div className="frame-bar">
            <span><i className="frame-live" /> AETHER / SESSION 7F–A2</span>
            <span>46 SEC · SILENT · LOCAL</span>
          </div>
          <video ref={videoRef} controls playsInline preload="metadata" poster="/media/tour-poster.jpg" aria-label="46-second Aether product tour">
            <source src="/media/aether-demo-v0.6.0.mp4" type="video/mp4" />
            Your browser does not support the product tour video.
          </video>
        </div>
      </section>

      <section id="signals" className="signals-section section-shell section-rule">
        <div className="section-heading section-heading--split">
          <div>
            <p className="eyebrow"><span>02</span><i /> Signal map</p>
            <h2>Telemetry that<br /><em>answers questions.</em></h2>
          </div>
          <p>Your coding agent already leaves a trail. Aether turns that native trail into an operational picture—without instrumentation.</p>
        </div>
        <div className="signal-grid">
          {signals.map(([title, description, meta], index) => (
            <article className="signal-card" key={title}>
              <div className="signal-card-top"><span>{String(index + 1).padStart(2, "0")}</span><code>{meta}</code></div>
              <h3>{title}</h3>
              <p>{description}</p>
              <div className="signal-line"><i /><i /><i /><i /><i /></div>
            </article>
          ))}
        </div>
        <figure className="product-shot product-shot--wide">
          <img src="/screenshots/metrics.png" alt="Aether synchronized metrics dashboard" loading="lazy" />
          <figcaption><span>FIG. 01</span> Six synchronized graph panels keep every signal on the same turn range.</figcaption>
        </figure>
      </section>

      <section id="how-it-works" className="how-section section-shell section-rule">
        <div className="section-heading">
          <p className="eyebrow"><span>03</span><i /> Under the hood</p>
          <h2>Native trails in.<br /><em>Clarity out.</em></h2>
        </div>
        <div className="flow" aria-label="How Aether processes local session files">
          <div className="flow-source"><span>CLAUDE</span><code>~/.claude/projects/*.jsonl</code></div>
          <div className="flow-source"><span>CODEX</span><code>~/.codex/sessions/*.jsonl</code></div>
          <div className="flow-arrow">→</div>
          <div className="flow-core"><b>provider parsers</b><span>normalize turns, usage, actions, relationships</span></div>
          <div className="flow-arrow">→</div>
          <div className="flow-output"><b>live TUI</b><span>synchronized and local</span></div>
        </div>
        <div className="how-grid">
          <figure className="product-shot">
            <img src="/screenshots/agents.png" alt="Aether showing nested agents within a parent Codex turn" loading="lazy" />
            <figcaption><span>FIG. 02</span> Nested work stays attached to the turn that created it.</figcaption>
          </figure>
          <div className="agent-copy">
            <p className="eyebrow"><span>TRACE</span><i /> Agents, not extra chats</p>
            <h3>See who did what.</h3>
            <p>Each agent trace keeps its request, response, model, duration, token use, tools, and code impact. Hooks and sub-agents stay in context instead of polluting the session list.</p>
            <ul>
              <li>Parent and nested agent relationships</li>
              <li>Provider-native titles and project identity</li>
              <li>Successful edits, searches, tools, and outcomes</li>
            </ul>
          </div>
        </div>
      </section>

      <section id="privacy" className="privacy-section section-shell section-rule">
        <p className="eyebrow"><span>04</span><i /> Privacy by construction</p>
        <div className="privacy-grid">
          <h2>Your sessions stay<br /><em>on your machine.</em></h2>
          <div className="privacy-list">
            <p><span>01</span>Session data is read locally.</p>
            <p><span>02</span>No provider API key is required.</p>
            <p><span>03</span>No prompt, response, or metric is uploaded.</p>
            <p><span>04</span>No additional LLM is called for telemetry.</p>
            <p><span>05</span>Provider transcripts are never modified.</p>
          </div>
        </div>
        <div className="privacy-statement"><span className="live-dot" /> Everything remains on your machine.</div>
      </section>

      <section id="install" className="install-section section-shell section-rule">
        <div className="section-heading section-heading--center">
          <p className="eyebrow"><span>05</span><i /> Install</p>
          <h2>Three commands.<br /><em>Then watch.</em></h2>
          <p>macOS and Linux · MIT licensed · built in Rust</p>
        </div>
        <div className="terminal-install">
          <div className="terminal-title"><span>AETHER SETUP</span><span>LOCAL SHELL</span></div>
          <div className="command-row"><span className="prompt">$</span><code>{installCommand}</code><button onClick={copyInstall} aria-label="Copy Homebrew install command">{copied ? "Copied" : "Copy"}</button></div>
          <div className="command-row"><span className="prompt">$</span><code>aether setup claude &amp;&amp; aether setup codex</code></div>
          <div className="command-row"><span className="prompt">$</span><code>aether watch</code><span className="command-status"><i className="live-dot" /> live</span></div>
        </div>
        <div className="install-alternatives">
          <a href="https://raw.githubusercontent.com/connectchiragg/aether/master/install.sh">Shell installer ↗</a>
          <a href="https://github.com/connectchiragg/aether#build-from-source">Build from source ↗</a>
          <a href="https://github.com/connectchiragg/aether/releases/latest">Latest release ↗</a>
        </div>
      </section>

      <section className="open-source section-shell section-rule">
        <p className="eyebrow"><span>06</span><i /> Open source</p>
        <div className="open-source-grid">
          <h2>Understand what your<br /><em>agents actually did.</em></h2>
          <div><p>Issues and pull requests are welcome—especially new providers, telemetry fields, pricing updates, and parser fixtures.</p><a className="primary-button" href="https://github.com/connectchiragg/aether" target="_blank" rel="noreferrer">Explore on GitHub <span>↗</span></a></div>
        </div>
      </section>

      <footer className="site-footer section-shell">
        <div className="footer-main"><a className="wordmark" href="#top"><span className="wordmark-mark">æ</span><span>aether</span></a><p>Local, live observability for coding agents.</p><a href="#top">Back to signal ↑</a></div>
        <div className="footer-meta"><span>© 2026 Chirag Goel · MIT</span><span>Built for macOS + Linux</span></div>
        <p className="attribution">
          3D model <a href="https://sketchfab.com/3d-models/the-all-seeing-eye-eba076cbdee94f2f9d399d95267f6ade" target="_blank" rel="noreferrer">“The All Seeing Eye”</a> by <a href="https://sketchfab.com/TheWarVet" target="_blank" rel="noreferrer">The WarVet</a>, modified for Aether, licensed under <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC BY 4.0</a>. No endorsement implied.
        </p>
      </footer>
    </main>
  );
}
