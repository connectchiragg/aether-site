# Aether website

Landing page for [Aether](https://github.com/connectchiragg/aether), a local,
live observability TUI for Claude Code and Codex.

**Production:** [aether.haciensus.com](https://aether.haciensus.com)

## Development

```bash
npm install
npm run dev
```

## Validation

```bash
npm run build
npm run build:pages
npm run test:pages
```

`npm run build` produces the Sites/Worker deployment. `npm run build:pages`
produces the static Cloudflare Pages deployment in `pages-dist/`.

## License

The website code is MIT licensed. The adapted All Seeing Eye model is licensed
under CC BY 4.0; see [CREDITS.md](CREDITS.md) for full attribution and changes.
