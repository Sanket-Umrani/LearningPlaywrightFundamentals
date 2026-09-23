#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const TARGET_DIR = path.join(ROOT, 'Concept_Understanding');
const DEFAULT_TIMEOUT_MS = 15 * 60 * 1000;

const USAGE = [
  'concept:analysis — research a concept and save it as a Markdown note',
  '',
  'Usage:',
  '  npm run concept:analysis <Concept name> [-- --force] [-- --no-ai] [-- --title "<Display title>"]',
  '  npm run concept:analysis -- --list',
  '',
  'Examples:',
  '  npm run concept:analysis Codegen           -> Concept_Understanding/Codegen.md',
  '  npm run concept:analysis "Session State"   -> Concept_Understanding/Session_State.md',
  '  npm run concept:analysis Codegen -- --no-ai -> write the blank template only, no research',
  '  npm run concept:analysis Codegen -- --force -> overwrite an existing note',
  '',
  'Options:',
  '  --no-ai            Skip the research run and write the blank template instead.',
  '  --force            Overwrite an existing note (the previous version is kept as .md.bak).',
  '  --title "<text>"   Display title for the H1. Defaults to the concept name.',
  '  --list             List every concept note in Concept_Understanding/.',
  '  --help             Show this message.',
  '',
  'Environment:',
  '  CONCEPT_ANALYSIS_CLI          Command that runs Command Code headlessly.',
  '  CONCEPT_ANALYSIS_TIMEOUT_MS   Research timeout. Defaults to 900000 (15 minutes).',
].join('\n');

const EXIT_CODES = {
  3: 'Not authenticated — open Command Code once and sign in.',
  4: 'Permission denied.',
  5: 'Rate limit exceeded.',
  6: 'Network failure.',
  7: 'API server error.',
  8: 'Max turns reached before a final answer.',
  9: 'The model produced no response.',
  10: 'Insufficient credits.',
  130: 'Interrupted.',
};

const args = process.argv.slice(2).filter((arg) => arg !== '--');
const flags = new Set(args.filter((arg) => arg.startsWith('--')));
const positional = args.filter((arg) => !arg.startsWith('--'));

const log = (message) => process.stdout.write(message + '\n');

function valueOf(flag) {
  const index = args.indexOf(flag);
  return index === -1 ? null : args[index + 1] || null;
}

function toFileName(raw) {
  return raw
    .trim()
    .split(/[\s_\-]+/)
    .filter(Boolean)
    .map((word) => (/[A-Z]/.test(word) ? word : word.charAt(0).toUpperCase() + word.slice(1)))
    .join('_');
}

function listNotes() {
  if (!fs.existsSync(TARGET_DIR)) {
    log('No Concept_Understanding/ folder yet. Run the command with a concept name to create one.');
    return;
  }

  const notes = fs
    .readdirSync(TARGET_DIR)
    .filter((file) => file.endsWith('.md'))
    .sort();

  if (notes.length === 0) {
    log('Concept_Understanding/ is empty. Run: npm run concept:analysis <Concept name>');
    return;
  }

  log(notes.length + ' concept note(s) in Concept_Understanding/:');
  for (const note of notes) log('  ' + note);
}

function buildTemplate(title, concept) {
  const today = new Date().toISOString().slice(0, 10);

  return [
    '<!-- Scaffolded by `npm run concept:analysis --no-ai`. Fill in the sections below. -->',
    '',
    '# ' + title,
    '',
    '> Concept notes for interview preparation. Beginner-friendly, with the Selenium vs Playwright',
    '> comparison and a ready-to-say interview answer.',
    '',
    'Status: draft — created ' + today + '.',
    '',
    '## 1. What is ' + concept + '? (beginner version)',
    '',
    'Explain it with a real-world analogy first, then give the technical definition.',
    '',
    '## 2. Why do testers care? (the point of it)',
    '',
    'What problem does it solve? What breaks or slows down without it?',
    '',
    '## 3. Playwright\'s version (built-in)',
    '',
    'Name the Playwright API and show a short, runnable snippet.',
    '',
    '## 4. Selenium\'s version (manual)',
    '',
    'Explain what you have to build yourself and the caveats.',
    '',
    '## 5. Selenium vs Playwright — the comparison',
    '',
    '| Aspect | Selenium | Playwright |',
    '| --- | --- | --- |',
    '| Built-in support | | |',
    '| What it covers | | |',
    '| Effort | | |',
    '| Handles modern SPAs | | |',
    '',
    '## 6. Which is more powerful?',
    '',
    'Give the verdict, then the fair nuance for the other tool.',
    '',
    '## 7. Ready-to-say interview answer',
    '',
    '> One short paragraph you can deliver out loud.',
    '',
    '## Related files',
    '',
    '- ',
    '',
  ].join('\n');
}

function buildPrompt(concept, title) {
  return [
    'You are writing a study note for a QA engineer who is preparing for job interviews.',
    'The concept to research and explain is: "' + concept + '".',
    '',
    'The reader is a beginner: they can write basic tests but are new to this topic, and they may be',
    'asked about it in an interview. Explain it so they could repeat it confidently out loud.',
    '',
    'Output ONE complete Markdown document with exactly these sections, in this order:',
    '',
    '# ' + title,
    '',
    '> A one-line summary of what this note covers.',
    '',
    '## 1. What is ' + concept + '? (beginner version)',
    'Open with a concrete, everyday analogy. Then give the technical definition and bold the key terms.',
    'If the concept has parts, layers, or variants, list them as bullets.',
    '',
    '## 2. Why do testers care? (the point of it)',
    'The problem it solves and what goes wrong or gets slow without it. Include a short before/after',
    'sketch in a fenced code block. Close with a bold one-line statement of the benefit.',
    '',
    '## 3. Playwright\'s version',
    'Name the exact Playwright API and show a short, runnable TypeScript snippet using @playwright/test.',
    '',
    '## 4. Selenium\'s version',
    'What you must build yourself, with a short snippet, plus a bullet list of caveats.',
    '',
    '## 5. Playwright vs Selenium — the comparison',
    'A Markdown table with 5 to 7 rows comparing the two tools for this concept specifically.',
    '',
    '## 6. Which is more powerful?',
    'State a direct verdict in the first sentence, then give the honest nuance or counterpoint.',
    '',
    '## 7. Ready-to-say interview answer',
    'A single blockquote paragraph the reader can speak out loud, in natural first-person English.',
    '',
    '## Related files',
    'Only if genuinely relevant, list repository-relative paths you actually found by reading this repo.',
    '',
    'Rules:',
    '- Use the exact section headings above, including their numbering.',
    '- If this concept is not a Playwright-versus-Selenium topic, adapt sections 3 to 6 to the two most',
    '  relevant tools or approaches instead, keeping the numbering and the spirit of each section.',
    '- Be technically accurate. Never invent API names, flags, or method signatures. If you are unsure',
    '  of an exact API, describe the approach in prose instead of guessing.',
    '- Prefer short paragraphs, bold for key terms, and fenced code blocks with language tags.',
    '- Output ONLY the finished Markdown document. No preamble, no commentary, no closing remarks, and',
    '  do not wrap the whole document in a code fence.',
  ].join('\n');
}

function sanitize(markdown) {
  let text = markdown.replace(/\r\n/g, '\n').trim();

  if (/^```(?:markdown|md)?\n/.test(text)) {
    text = text.replace(/^```(?:markdown|md)?\n/, '').replace(/\n```$/, '').trim();
  }

  const heading = text.search(/^# /m);
  if (heading > 0) text = text.slice(heading).trim();

  return text + '\n';
}

function resolveCli() {
  if (process.env.CONCEPT_ANALYSIS_CLI) {
    return { command: process.env.CONCEPT_ANALYSIS_CLI, prefix: [], shell: true };
  }

  const entries = [
    process.env.APPDATA && path.join(process.env.APPDATA, 'npm', 'node_modules', 'command-code', 'dist', 'index.mjs'),
    '/usr/local/lib/node_modules/command-code/dist/index.mjs',
    '/usr/lib/node_modules/command-code/dist/index.mjs',
  ].filter((entry) => entry && fs.existsSync(entry));

  if (entries.length > 0) {
    return { command: process.execPath, prefix: [entries[0]], shell: false };
  }

  return { command: 'cmdc', prefix: [], shell: true };
}

function research(prompt) {
  const cli = resolveCli();
  const timeout = Number(process.env.CONCEPT_ANALYSIS_TIMEOUT_MS) || DEFAULT_TIMEOUT_MS;

  return spawnSync(cli.command, [...cli.prefix, '-p', '--skip-onboarding'], {
    cwd: ROOT,
    input: prompt,
    encoding: 'utf8',
    shell: cli.shell,
    timeout,
    maxBuffer: 64 * 1024 * 1024,
    windowsHide: true,
  });
}

function main() {
  if (flags.has('--help') || flags.has('-h')) {
    log(USAGE);
    return;
  }

  if (flags.has('--list')) {
    listNotes();
    return;
  }

  const concept = positional.join(' ');
  if (!concept) {
    log(USAGE);
    process.exitCode = 1;
    return;
  }

  const title = valueOf('--title') || concept;
  const fileName = toFileName(concept) + '.md';
  const target = path.join(TARGET_DIR, fileName);

  fs.mkdirSync(TARGET_DIR, { recursive: true });

  if (fs.existsSync(target) && !flags.has('--force')) {
    log('Concept_Understanding/' + fileName + ' already exists. Re-run with --force to overwrite:');
    log('  npm run concept:analysis ' + JSON.stringify(concept) + ' -- --force');
    log('The previous version is kept as ' + fileName + '.bak when you do.');
    process.exitCode = 1;
    return;
  }

  if (flags.has('--no-ai')) {
    fs.writeFileSync(target, buildTemplate(title, concept), 'utf8');
    log('Scaffolded Concept_Understanding/' + fileName + ' (blank template, no research).');
    return;
  }

  log('Researching "' + concept + '" with Command Code...');
  log('This runs headlessly and can take a few minutes. Output: Concept_Understanding/' + fileName);

  const result = research(buildPrompt(concept, title));

  if (result.error) {
    log('');
    log('ERROR: could not start Command Code — ' + result.error.message);
    log('Set CONCEPT_ANALYSIS_CLI to a working command, or use --no-ai to scaffold only.');
    process.exit(1);
  }

  if (result.status !== 0) {
    log('');
    log('ERROR: research run failed (exit ' + result.status + ').');
    const hint = EXIT_CODES[result.status];
    if (hint) log(hint);
    const detail = (result.stderr || '').trim();
    if (detail) log(detail);
    log('Nothing was written. Use --no-ai to scaffold the blank template instead.');
    process.exit(1);
  }

  const markdown = sanitize(result.stdout || '');
  if (!markdown.trim()) {
    log('');
    log('ERROR: the research run returned no content. Nothing was written.');
    process.exit(1);
  }

  if (fs.existsSync(target)) {
    fs.copyFileSync(target, target + '.bak');
    log('Previous version kept as Concept_Understanding/' + fileName + '.bak');
  }

  fs.writeFileSync(target, markdown, 'utf8');
  log('');
  log('Wrote Concept_Understanding/' + fileName + ' (' + markdown.split('\n').length + ' lines).');
  log('Commit it with: node auto-push-agent.js');
}

try {
  main();
} catch (error) {
  log('');
  log('ERROR: ' + error.message);
  process.exit(1);
}
