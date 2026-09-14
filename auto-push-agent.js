#!/usr/bin/env node
'use strict';

const { spawnSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const ROOT = __dirname;
const DEFAULT_REMOTE = 'https://github.com/Sanket-Umrani/LearningPlaywrightFundamentals.git';
const DEFAULT_BRANCH = 'main';
const CO_AUTHOR = 'Co-authored-by: CommandCodeBot <noreply@commandcode.ai>';

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const NO_PUSH = args.includes('--no-push');

const log = (message) => process.stdout.write(message + '\n');

function run(args, { inherit = false } = {}) {
  const result = spawnSync('git', args, {
    cwd: ROOT,
    encoding: 'utf8',
    stdio: inherit ? 'inherit' : ['ignore', 'pipe', 'pipe'],
  });

  if (result.error) {
    const error = new Error('Unable to run git: ' + result.error.message);
    error.code = 'ENOGIT';
    throw error;
  }
  if (result.status !== 0) {
    const detail = inherit ? '' : (result.stderr || result.stdout || '').trim();
    const error = new Error('git ' + args.join(' ') + ' failed' + (detail ? '\n' + detail : ''));
    error.code = 'GITFAIL';
    throw error;
  }

  return inherit ? '' : (result.stdout || '').trim();
}

function attempt(args) {
  const result = spawnSync('git', args, { cwd: ROOT, encoding: 'utf8' });
  if (result.error || result.status !== 0) return null;
  return (result.stdout || '').trim();
}

function ensureGit() {
  const version = attempt(['--version']);
  if (!version) {
    throw new Error('git is not installed or is not on your PATH. Install it from https://git-scm.com/downloads');
  }
  log('Using ' + version);
}

function ensureRepo() {
  if (attempt(['rev-parse', '--is-inside-work-tree']) === 'true') {
    log('Existing repository detected.');
    return;
  }

  log('No repository here — initialising in ' + path.basename(ROOT) + '.');
  const init = spawnSync('git', ['init', '-b', DEFAULT_BRANCH], { cwd: ROOT, encoding: 'utf8' });
  if (init.status !== 0) {
    run(['init']);
    run(['symbolic-ref', 'HEAD', 'refs/heads/' + DEFAULT_BRANCH]);
  }
}

function ensureRemote() {
  const existing = attempt(['remote', 'get-url', 'origin']);
  if (existing) {
    log('origin -> ' + existing);
    return existing;
  }

  log('Adding origin -> ' + DEFAULT_REMOTE);
  run(['remote', 'add', 'origin', DEFAULT_REMOTE]);
  return DEFAULT_REMOTE;
}

function ensureIdentity() {
  if (!attempt(['config', 'user.email'])) {
    run(['config', 'user.email', 'noreply@commandcode.ai']);
  }
  if (!attempt(['config', 'user.name'])) {
    run(['config', 'user.name', 'CommandCodeBot']);
  }
}

function stagedChanges() {
  const raw = attempt(['diff', '--cached', '--name-status']) || '';
  if (!raw) return [];

  return raw.split('\n').map((line) => {
    const [code, ...rest] = line.split('\t');
    return { code: code.trim(), file: rest.join(' ').trim() };
  });
}

function currentBranch() {
  const branch = attempt(['rev-parse', '--abbrev-ref', 'HEAD']);
  if (!branch || branch === 'HEAD') {
    throw new Error('HEAD is detached. Check out a branch before pushing.');
  }
  return branch;
}

function warnAboutSecrets() {
  const diff = attempt(['diff', '--cached', '--unified=0']) || '';
  const hits = [];

  for (const line of diff.split('\n')) {
    if (!line.startsWith('+') || line.startsWith('+++')) continue;
    const match = line.match(/\.fill\(\s*(['"`])([^'"`]+)\1/);
    if (match && (/@/.test(match[2]) || /password|passwd|email|secret|token/i.test(line))) {
      hits.push(line.slice(1).trim());
    }
  }

  if (hits.length === 0) return;
  log('');
  log('WARNING: possible hard-coded credentials in the staged content:');
  for (const hit of hits) log('  ' + hit);
  log('This repository is public. Move secrets to environment variables.');
  log('');
}

function buildMessage(changes) {
  const groups = new Map();
  for (const change of changes) {
    const key = change.code.charAt(0);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(change.file);
  }

  const labels = { A: 'Added', M: 'Modified', D: 'Deleted', R: 'Renamed', C: 'Copied' };
  const body = [];

  for (const [code, files] of groups) {
    body.push((labels[code] || 'Changed') + ':');
    for (const file of files) body.push('- ' + file);
    body.push('');
  }

  const subject = 'Auto-sync: ' + changes.length + ' file' + (changes.length === 1 ? '' : 's') + ' changed';
  return [subject, '', ...body, CO_AUTHOR].join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n';
}

function commit(changes) {
  const messageFile = path.join(os.tmpdir(), 'auto-push-agent-' + process.pid + '.txt');
  fs.writeFileSync(messageFile, buildMessage(changes), 'utf8');
  try {
    run(['commit', '-F', messageFile], { inherit: true });
  } finally {
    fs.unlinkSync(messageFile);
  }
}

function fetchRemote(branch) {
  const result = spawnSync('git', ['fetch', 'origin', branch], { cwd: ROOT, encoding: 'utf8' });
  if (result.status !== 0) {
    log('Could not fetch origin/' + branch + ' (continuing with local history).');
    return null;
  }
  return attempt(['rev-parse', '--verify', '--quiet', 'refs/remotes/origin/' + branch]);
}

function reconcile(branch, remoteRef) {
  if (!remoteRef) return;

  const mergeBase = attempt(['merge-base', 'HEAD', 'refs/remotes/origin/' + branch]);
  if (mergeBase) return;

  log('Remote history is unrelated to local history — merging it in, keeping your local files.');
  run(['merge', '--allow-unrelated-histories', '--no-edit', '-X', 'ours', 'refs/remotes/origin/' + branch]);
}

function unpushedCount(branch) {
  const count = attempt(['rev-list', '--count', 'refs/remotes/origin/' + branch + '..HEAD']);
  return count === null ? null : Number(count);
}

function pushHint(error) {
  const text = error.message;
  if (/Authentication failed|could not read Username|terminal prompts disabled|Permission denied|403/i.test(text)) {
    return (
      'Authentication with GitHub failed. Either sign in with the GitHub CLI (gh auth login) or create a\n' +
      'personal access token with "repo" scope and use:\n' +
      '  git remote set-url origin https://<token>@github.com/Sanket-Umrani/LearningPlaywrightFundamentals.git'
    );
  }
  if (/rejected|non-fast-forward|fetch first/i.test(text)) {
    return 'The remote has commits you do not have locally. Pull them first, then re-run this script.';
  }
  return null;
}

function preview() {
  log('Dry run — nothing will be changed or pushed.');
  log('');
  log('Remote: ' + (attempt(['remote', 'get-url', 'origin']) || DEFAULT_REMOTE));
  log('Branch: ' + (attempt(['rev-parse', '--abbrev-ref', 'HEAD']) || DEFAULT_BRANCH) + ' (or ' + DEFAULT_BRANCH + ' if initialised)');
  log('');

  if (attempt(['rev-parse', '--is-inside-work-tree']) !== 'true') {
    log('This directory is not a repository yet. It would be initialised, all files staged, committed, and pushed.');
    return;
  }

  const status = attempt(['status', '--porcelain=v1']) || '';
  if (!status) {
    log('Working tree is clean — nothing to commit.');
    return;
  }

  log('Files that would be staged and committed:');
  for (const line of status.split('\n')) log('  ' + line);
}

function main() {
  log('auto-push-agent');
  log('Repository: ' + DEFAULT_REMOTE);
  log('');

  ensureGit();

  if (DRY_RUN) {
    preview();
    return;
  }

  ensureRepo();
  const remote = ensureRemote();
  ensureIdentity();

  const branch = attempt(['rev-parse', '--abbrev-ref', 'HEAD']) || DEFAULT_BRANCH;
  const remoteRef = fetchRemote(branch);

  run(['add', '-A']);
  const changes = stagedChanges();

  if (changes.length === 0) {
    log('No untracked or modified files to commit.');
    if (attempt(['rev-parse', 'HEAD']) === null) {
      log('Nothing has ever been committed here, so there is nothing to push yet.');
      return;
    }
  } else {
    log('Staging ' + changes.length + ' changed file(s):');
    for (const change of changes) log('  ' + change.code + '  ' + change.file);
    warnAboutSecrets();
    commit(changes);
  }

  reconcile(currentBranch(), remoteRef);

  if (NO_PUSH) {
    log('--no-push supplied, so stopping before push.');
    return;
  }

  const ahead = unpushedCount(branch);
  if (ahead === 0) {
    log('Remote is already up to date with ' + branch + '. Nothing to push.');
    return;
  }

  log('Pushing ' + (ahead === null ? 'commits' : ahead + ' commit(s)') + ' to origin/' + branch + '...');
  run(['push', '-u', 'origin', branch], { inherit: true });
  log('');
  log('Done. ' + remote + ' (' + branch + ') is up to date.');
}

try {
  main();
} catch (error) {
  log('');
  log('ERROR: ' + error.message);
  const hint = pushHint(error);
  if (hint) log('\n' + hint);
  process.exit(1);
}
