# Taste

## Tooling & Workflow

- Uses Playwright with TypeScript for browser test specs (`.spec.ts`) as their primary learning/automation stack. Confidence: 0.5

- Prefers documentation (e.g. README) to be generated programmatically from source-of-truth files via a namespaced npm script (e.g. `npm run readme:sync`) rather than hand-maintained, so docs stay in sync with the code. Confidence: 0.7
- Prefers repetitive workflows (docs generation, git stage/commit/push) automated as standalone `node <script>.js` CLI commands run from the repo root (e.g. `auto-push-agent.js`) rather than doing the steps manually. Confidence: 0.7
- Prioritizes shipping progress over credential hygiene in personal learning/sandbox repos: when warned that hard-coded test credentials would become public, chose to commit and push everything as-is rather than sanitize first. Confidence: 0.45
