'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const IGNORED = new Set([
  'node_modules',
  '.git',
  '.commandcode',
  'playwright-report',
  'test-results',
  'blob-report',
  '.cache',
  'README.md',
]);

const read = (relative) => fs.readFileSync(path.join(ROOT, relative), 'utf8');
const toPosix = (absolute) => path.relative(ROOT, absolute).split(path.sep).join('/');

function stripComments(source) {
  let out = '';
  let i = 0;
  let quote = null;

  while (i < source.length) {
    const char = source[i];
    const next = source[i + 1];

    if (quote) {
      out += char;
      if (char === '\\') {
        out += next === undefined ? '' : next;
        i += 2;
        continue;
      }
      if (char === quote) quote = null;
      i += 1;
      continue;
    }

    if (char === '"' || char === "'" || char === '`') {
      quote = char;
      out += char;
      i += 1;
      continue;
    }
    if (char === '/' && next === '/') {
      while (i < source.length && source[i] !== '\n') i += 1;
      continue;
    }
    if (char === '/' && next === '*') {
      i += 2;
      while (i < source.length && !(source[i] === '*' && source[i + 1] === '/')) i += 1;
      i += 2;
      continue;
    }

    out += char;
    i += 1;
  }

  return out;
}

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (IGNORED.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else files.push(full);
  }
  return files.sort();
}

function sliceBalanced(source, fromIndex, open, close) {
  const start = source.indexOf(open, fromIndex);
  if (start === -1) return '';

  let depth = 0;
  for (let i = start; i < source.length; i += 1) {
    if (source[i] === open) depth += 1;
    else if (source[i] === close) {
      depth -= 1;
      if (depth === 0) return source.slice(start + 1, i);
    }
  }
  return '';
}

const QUOTED = /:\s*(['"`])(.+?)\1/;
const RAW = /:\s*([^,\n]+)/;

function parseConfig() {
  const source = stripComments(read('playwright.config.ts'));
  const grabQuoted = (key, fallback = '—') => {
    const match = source.match(new RegExp(key + QUOTED.source));
    return match ? match[2].trim() : fallback;
  };
  const grabRaw = (key, fallback = '—') => {
    const match = source.match(new RegExp(key + RAW.source));
    return match ? match[1].trim() : fallback;
  };

  const projectsIndex = source.indexOf('projects');
  const projectsBlock = projectsIndex === -1 ? '' : sliceBalanced(source, projectsIndex, '[', ']');
  const projects = [...projectsBlock.matchAll(/name:\s*(['"`])([^'"`]+)\1/g)].map((m) => m[2]);

  return {
    testDir: grabQuoted('testDir'),
    fullyParallel: grabRaw('fullyParallel'),
    retries: grabRaw('retries'),
    workers: grabRaw('workers'),
    reporter: grabQuoted('reporter'),
    trace: grabQuoted('trace'),
    headless: grabRaw('headless'),
    projects,
  };
}

function findSecrets(source) {
  const lines = source.split('\n');
  const found = [];

  lines.forEach((line, index) => {
    const fill = line.match(/\.fill\(\s*(['"`])([^'"`]+)\1/);
    if (!fill) return;
    const value = fill[2];
    if (/password|passwd|email|secret|token/i.test(line) || /@/.test(value)) {
      found.push({ line: index + 1, value });
    }
  });

  return found;
}

function parseSpecs() {
  const dir = path.join(ROOT, 'tests');
  if (!fs.existsSync(dir)) return [];

  return walk(dir)
    .filter((file) => /\.spec\.[jt]s$/.test(file))
    .map((file) => {
      const source = fs.readFileSync(file, 'utf8');
      return {
        file: toPosix(file),
        titles: [...source.matchAll(/^\s*test(?:\.\w+)?\(\s*(['"`])(.+?)\1/gm)].map((m) => m[2]),
        urls: [...new Set([...source.matchAll(/page\.goto\(\s*(['"`])(.+?)\1/g)].map((m) => m[2]))],
        secrets: findSecrets(source),
      };
    });
}

function buildTree() {
  const rootName = path.basename(ROOT) + '/';
  const entries = fs
    .readdirSync(ROOT, { withFileTypes: true })
    .filter((entry) => !IGNORED.has(entry.name))
    .sort((a, b) => {
      if (a.isDirectory() !== b.isDirectory()) return a.isDirectory() ? -1 : 1;
      return a.name.localeCompare(b.name);
    });

  const lines = [rootName];

  entries.forEach((entry, index) => {
    const last = index === entries.length - 1;
    const pad = last ? '    ' : '│   ';
    lines.push((last ? '└── ' : '├── ') + entry.name + (entry.isDirectory() ? '/' : ''));

    if (!entry.isDirectory()) return;
    const children = fs
      .readdirSync(path.join(ROOT, entry.name), { withFileTypes: true })
      .filter((child) => !IGNORED.has(child.name))
      .sort((a, b) => a.name.localeCompare(b.name));

    children.forEach((child, childIndex) => {
      const childLast = childIndex === children.length - 1;
      lines.push(pad + (childLast ? '└── ' : '├── ') + child.name + (child.isDirectory() ? '/' : ''));
    });
  });

  return lines.join('\n');
}

function buildSpecSection(spec) {
  const lines = ['### ' + '`' + spec.file + '`', ''];

  if (spec.urls.length === 1) lines.push('Target: ' + spec.urls[0], '');
  else if (spec.urls.length > 1) lines.push('Targets:', ...spec.urls.map((url) => '- ' + url), '');

  if (spec.titles.length === 0) lines.push('_No top-level `test(...)` blocks found in this file._', '');
  else {
    lines.push(spec.titles.length + ' test case(s):', '');
    lines.push(...spec.titles.map((title) => '- **' + title + '**'));
    lines.push('');
  }

  for (const secret of spec.secrets) {
    lines.push(
      '> **Warning:** line ' +
        secret.line +
        ' hard-codes the literal `' +
        secret.value +
        '` in a `fill()` call. Move credentials to environment variables before this repository is shared.',
      ''
    );
  }

  return lines;
}

function build() {
  const config = parseConfig();
  const specs = parseSpecs();
  const pkg = JSON.parse(read('package.json'));
  const scripts = Object.entries(pkg.scripts || {});
  const runtimeDeps = Object.entries(pkg.dependencies || {});
  const devDeps = Object.entries(pkg.devDependencies || {});
  const name = path.basename(ROOT) || pkg.name || 'Project';

  const out = [];

  out.push('<!-- Generated by `npm run readme:sync`. Edit scripts/readme-sync.js, not this file. -->', '');
  out.push('# ' + name, '');
  out.push(
    'Hands-on learning project for the [Playwright](https://playwright.dev/) end-to-end testing framework, built with `@playwright/test` and TypeScript.',
    ''
  );
  out.push('## Overview', '');
  out.push(
    'This repository collects practice specs that exercise Playwright fundamentals: page navigation, role-based and test-id locators, web-first assertions, and a full login flow against a public demo application.',
    ''
  );

  out.push('## Prerequisites', '', '- [Node.js](https://nodejs.org/) (LTS recommended)', '- npm', '');

  out.push('## Installation', '', '```bash', 'npm install', 'npx playwright install chromium', '```', '');
  out.push('The second command downloads the Chromium binary required by the configured project.', '');

  out.push('## Project Structure', '', '```', buildTree(), '```', '');
  out.push('`playwright-report/` and `test-results/` are generated at run time and are gitignored.', '');

  out.push('## Test Suites', '');
  if (specs.length === 0) out.push('No spec files found under `tests/`.', '');
  else out.push(...specs.flatMap(buildSpecSection));

  out.push('## Configuration', '', 'From `playwright.config.ts`:', '');
  out.push('| Setting | Value |', '| --- | --- |');
  out.push('| `testDir` | `' + config.testDir + '` |');
  out.push('| `fullyParallel` | `' + config.fullyParallel + '` |');
  out.push('| `retries` | `' + config.retries + '` |');
  out.push('| `workers` | `' + config.workers + '` |');
  out.push('| `reporter` | `' + config.reporter + '` |');
  out.push('| `trace` | `' + config.trace + '` |');
  out.push('| `headless` | `' + config.headless + '` |');
  out.push(
    '| Projects | ' + (config.projects.length ? config.projects.map((p) => '`' + p + '`').join(', ') : '_none_') + ' |',
    ''
  );
  out.push('Failures produce artifacts under `test-results/`, and traces are captured when a test is retried.', '');

  out.push('## Concept Analysis', '');
  out.push(
    'The `npm run concept:analysis` command supports both explicit concepts and working-tree analysis:',
    '',
    '```bash',
    'npm run concept:analysis Codegen',
    'npm run concept:analysis "Session State"',
    'npm run concept:analysis',
    'npm run concept:analysis -- --no-ai',
    'npm run concept:analysis -- --list',
    '```',
    '',
    '- With a concept name, it researches that concept and writes `Concept_Understanding/<Concept>.md`.',
    '- With no concept name, it reads the current tracked modifications and untracked source/config files, then writes `Concept_Understanding/ConceptAnalysis.md`.',
    '- Automatic analysis skips generated reports, secrets, binaries, backups, and its own previous output; recurring runs keep the prior automatic note as `ConceptAnalysis.md.bak`.',
    '- `--no-ai` writes a template instead of launching the headless research process, and `--force` is required to overwrite an existing named concept note.',
    '',
    'The automatic mode is designed for future changes: rerun it after modifying source, tests, or configuration files.',
    '',
  );
  out.push('## Dependencies', '');
  if (runtimeDeps.length) out.push('Runtime:', '', ...runtimeDeps.map(([dep, v]) => '- `' + dep + '` ' + v), '');
  if (devDeps.length) out.push('Development:', '', ...devDeps.map(([dep, v]) => '- `' + dep + '` ' + v), '');

  out.push('## Scripts', '');
  if (scripts.length) {
    out.push('| Command | Runs |', '| --- | --- |');
    out.push(...scripts.map(([key, value]) => '| `npm run ' + key + '` | `' + value + '` |'));
    out.push('');
  } else out.push('No npm scripts defined.', '');

  out.push('## Running Tests', '', '```bash');
  out.push('npx playwright test                      # all tests');
  out.push('npx playwright test tests/example.spec.ts # a single spec');
  out.push('npx playwright test --headed             # show the browser');
  out.push('npx playwright test --ui                 # interactive UI mode');
  out.push('npx playwright show-report               # open the last HTML report');
  out.push('```', '');

  out.push('## Regenerating This README', '', '```bash', 'npm run readme:sync', '```', '');
  out.push('The command walks the working tree, reads `playwright.config.ts`, `package.json`, and every `tests/**/*.spec.ts`, then rewrites this file.', '');

  return out.join('\n');
}

const target = path.join(ROOT, 'README.md');
fs.writeFileSync(target, build(), 'utf8');
process.stdout.write('README.md synced from the working tree.\n');
