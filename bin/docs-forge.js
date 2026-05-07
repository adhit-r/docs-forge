#!/usr/bin/env node
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const readline = require('readline');
const childProcess = require('child_process');

const VERSION = '0.3.0';
const RELEASE_REF = `v${VERSION}`;
const REPO = 'adhit-r/docs-forge';
const ROOT = path.resolve(__dirname, '..');

const AGENT_OPTIONS = [
  ['codex', 'Codex marketplace plugin'],
  ['claude', 'Claude Code skill'],
  ['antigravity', 'Antigravity AGENTS.md adapter'],
  ['universal', 'Universal AGENTS.md playbook']
];

const HELP = `Docs Forge ${VERSION}

Usage:
  docs-forge [install] [options]

Options:
  --agents <list>       Comma-separated agents: codex, claude, antigravity, universal, all
  --agent <name>        Add one agent selection. Can be repeated.
  --target <path>       Target project path for project-local installs. Defaults to cwd.
  --scope <scope>       Claude Code install scope: user or project. Defaults to user.
  --with-gemini         Also install Antigravity GEMINI.md override.
  --yes                 Use defaults and skip prompts.
  --force               Replace existing Claude skill directory when needed.
  --dry-run             Print planned actions without writing files or running commands.
  --help                Show this help.
  --version             Show version.

Examples:
  docs-forge
  docs-forge install --agents claude --scope user
  docs-forge install --agents antigravity --target .
  docs-forge install --agents claude,antigravity --scope project --target .
`;

main().catch((error) => {
  console.error(`docs-forge: ${error.message}`);
  process.exitCode = 1;
});

async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (options.help) {
    console.log(HELP);
    return;
  }

  if (options.version) {
    console.log(VERSION);
    return;
  }

  if (options.command && options.command !== 'install') {
    throw new Error(`Unknown command "${options.command}". Run "docs-forge --help".`);
  }

  console.log(`Docs Forge ${VERSION}`);
  console.log('Install the Docs Forge workflow for your coding agent.');
  console.log('');

  const rl = createReadline(options);
  try {
    const agents = await resolveAgents(options, rl);
    const targetDir = path.resolve(options.target || process.cwd());

    if (agents.includes('claude')) {
      await installClaude(options, rl, targetDir);
    }

    if (agents.includes('antigravity')) {
      await installAntigravity(options, rl, targetDir);
    }

    if (agents.includes('universal')) {
      await installUniversal(options, targetDir);
    }

    if (agents.includes('codex')) {
      await installCodex(options, rl);
    }

    console.log('');
    console.log('Docs Forge install complete.');
  } finally {
    rl.close();
  }
}

function parseArgs(argv) {
  const options = {
    agents: [],
    command: null,
    dryRun: false,
    force: false,
    help: false,
    scope: null,
    target: null,
    version: false,
    withGemini: false,
    yes: false
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (!arg.startsWith('-') && !options.command) {
      options.command = arg;
      continue;
    }

    switch (arg) {
      case '--help':
      case '-h':
        options.help = true;
        break;
      case '--version':
      case '-v':
        options.version = true;
        break;
      case '--dry-run':
        options.dryRun = true;
        break;
      case '--force':
        options.force = true;
        break;
      case '--yes':
      case '-y':
        options.yes = true;
        break;
      case '--with-gemini':
        options.withGemini = true;
        break;
      case '--agents':
      case '--agent':
        options.agents.push(...requireValue(argv, index, arg).split(','));
        index += 1;
        break;
      case '--target':
        options.target = requireValue(argv, index, arg);
        index += 1;
        break;
      case '--scope':
        options.scope = requireValue(argv, index, arg);
        index += 1;
        break;
      default:
        throw new Error(`Unknown option "${arg}". Run "docs-forge --help".`);
    }
  }

  if (options.scope && !['user', 'project'].includes(options.scope)) {
    throw new Error('--scope must be "user" or "project".');
  }

  return options;
}

function requireValue(argv, index, flag) {
  const value = argv[index + 1];
  if (!value || value.startsWith('-')) {
    throw new Error(`${flag} requires a value.`);
  }
  return value;
}

function createReadline(options) {
  if (options.yes || !process.stdin.isTTY) {
    return {
      question(_prompt, callback) {
        callback('');
      },
      close() {}
    };
  }

  return readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
}

async function resolveAgents(options, rl) {
  const explicit = normalizeAgents(options.agents);
  if (explicit.length > 0) {
    return explicit;
  }

  if (options.yes || !process.stdin.isTTY) {
    return AGENT_OPTIONS.map(([id]) => id);
  }

  console.log('Select agents to install:');
  AGENT_OPTIONS.forEach(([id, label], index) => {
    console.log(`  ${index + 1}. ${label} (${id})`);
  });
  console.log(`  ${AGENT_OPTIONS.length + 1}. All agents`);

  const answer = await ask(rl, 'Agents [all]: ');
  return normalizeAgents(answer ? answer.split(',') : ['all']);
}

function normalizeAgents(values) {
  const selected = new Set();
  const byNumber = new Map(AGENT_OPTIONS.map(([id], index) => [String(index + 1), id]));

  for (const rawValue of values) {
    const value = String(rawValue).trim().toLowerCase();
    if (!value) {
      continue;
    }
    if (value === 'all' || value === String(AGENT_OPTIONS.length + 1)) {
      AGENT_OPTIONS.forEach(([id]) => selected.add(id));
      continue;
    }
    if (byNumber.has(value)) {
      selected.add(byNumber.get(value));
      continue;
    }
    if (value === 'claude-code' || value === 'claude_code') {
      selected.add('claude');
      continue;
    }
    if (AGENT_OPTIONS.some(([id]) => id === value)) {
      selected.add(value);
      continue;
    }
    throw new Error(`Unknown agent "${rawValue}". Use codex, claude, antigravity, universal, or all.`);
  }

  return [...selected];
}

async function installClaude(options, rl, targetDir) {
  let scope = options.scope;
  if (!scope && !options.yes && process.stdin.isTTY) {
    const answer = await ask(rl, 'Install Claude Code skill globally in ~/.claude/skills? [Y/n]: ');
    scope = /^n(o)?$/i.test(answer.trim()) ? 'project' : 'user';
  }
  scope = scope || 'user';

  const sourceDir = path.join(ROOT, 'plugins', 'docs-forge', 'skills', 'docs-forge');
  const destinationDir = scope === 'user'
    ? path.join(os.homedir(), '.claude', 'skills', 'docs-forge')
    : path.join(targetDir, '.claude', 'skills', 'docs-forge');

  await copyDirectoryWithConfirmation({
    label: `Claude Code skill (${scope})`,
    sourceDir,
    destinationDir,
    options,
    rl
  });
}

async function installAntigravity(options, rl, targetDir) {
  mergeMarkdownFile({
    label: 'Antigravity AGENTS.md adapter',
    blockId: 'antigravity',
    sourcePath: path.join(ROOT, 'adapters', 'antigravity', 'AGENTS.md'),
    destinationPath: path.join(targetDir, 'AGENTS.md'),
    options
  });

  let withGemini = options.withGemini;
  if (!withGemini && !options.yes && process.stdin.isTTY) {
    const answer = await ask(rl, 'Add optional Antigravity GEMINI.md override? [y/N]: ');
    withGemini = /^y(es)?$/i.test(answer.trim());
  }

  if (withGemini) {
    mergeMarkdownFile({
      label: 'Antigravity GEMINI.md override',
      blockId: 'antigravity-gemini',
      sourcePath: path.join(ROOT, 'adapters', 'antigravity', 'GEMINI.md'),
      destinationPath: path.join(targetDir, 'GEMINI.md'),
      options
    });
  }
}

async function installUniversal(options, targetDir) {
  mergeMarkdownFile({
    label: 'Universal AGENTS.md playbook',
    blockId: 'universal',
    sourcePath: path.join(ROOT, 'adapters', 'universal', 'AGENTS.md'),
    destinationPath: path.join(targetDir, 'AGENTS.md'),
    options
  });
}

async function installCodex(options, rl) {
  const command = ['codex', 'plugin', 'marketplace', 'add', REPO, '--ref', RELEASE_REF];

  if (options.dryRun) {
    console.log(`[dry-run] ${command.join(' ')}`);
    return;
  }

  if (!commandExists('codex')) {
    printAction(options, 'Codex marketplace plugin', `codex CLI not found. Run manually: ${command.join(' ')}`);
    return;
  }

  let shouldRun = options.yes;
  if (!shouldRun && process.stdin.isTTY) {
    const answer = await ask(rl, `Run "${command.join(' ')}"? [Y/n]: `);
    shouldRun = !/^n(o)?$/i.test(answer.trim());
  }

  if (!shouldRun) {
    console.log(`Skipped Codex. Manual command: ${command.join(' ')}`);
    return;
  }

  console.log(`Running: ${command.join(' ')}`);
  childProcess.execFileSync(command[0], command.slice(1), { stdio: 'inherit' });
}

async function copyDirectoryWithConfirmation({ label, sourceDir, destinationDir, options, rl }) {
  if (!fs.existsSync(sourceDir)) {
    throw new Error(`Missing source directory: ${sourceDir}`);
  }

  if (fs.existsSync(destinationDir) && !options.force && !options.yes) {
    const answer = await ask(rl, `${label} already exists at ${destinationDir}. Replace it? [y/N]: `);
    if (!/^y(es)?$/i.test(answer.trim())) {
      console.log(`Skipped ${label}.`);
      return;
    }
  }

  if (fs.existsSync(destinationDir) && !options.force && options.yes) {
    console.log(`Skipped ${label}; destination exists. Re-run with --force to replace: ${destinationDir}`);
    return;
  }

  printAction(options, label, `copy ${sourceDir} -> ${destinationDir}`);

  if (options.dryRun) {
    return;
  }

  fs.mkdirSync(path.dirname(destinationDir), { recursive: true });
  fs.rmSync(destinationDir, { recursive: true, force: true });
  fs.cpSync(sourceDir, destinationDir, { recursive: true });
}

function mergeMarkdownFile({ label, blockId, sourcePath, destinationPath, options }) {
  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Missing source file: ${sourcePath}`);
  }

  const source = fs.readFileSync(sourcePath, 'utf8').trim();
  const start = `<!-- docs-forge:${blockId}:start -->`;
  const end = `<!-- docs-forge:${blockId}:end -->`;
  const block = `${start}\n${source}\n${end}\n`;
  const destinationExists = fs.existsSync(destinationPath);
  const current = destinationExists ? fs.readFileSync(destinationPath, 'utf8') : '';
  const next = replaceOrAppendBlock(current, start, end, block);

  const action = destinationExists
    ? `merge ${sourcePath} -> ${destinationPath}`
    : `create ${destinationPath}`;
  printAction(options, label, action);

  if (options.dryRun) {
    return;
  }

  fs.mkdirSync(path.dirname(destinationPath), { recursive: true });
  fs.writeFileSync(destinationPath, next, 'utf8');
}

function replaceOrAppendBlock(current, start, end, block) {
  if (!current.trim()) {
    return `${block}`;
  }

  const startIndex = current.indexOf(start);
  const endIndex = current.indexOf(end);

  if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
    return `${current.slice(0, startIndex)}${block}${current.slice(endIndex + end.length).replace(/^\n+/, '')}`;
  }

  return `${current.replace(/\s*$/, '')}\n\n${block}`;
}

function commandExists(command) {
  try {
    const result = process.platform === 'win32'
      ? childProcess.spawnSync('where', [command], { stdio: 'ignore' })
      : childProcess.spawnSync('sh', ['-c', `command -v ${shellQuote(command)}`], { stdio: 'ignore' });
    return result.status === 0;
  } catch {
    return false;
  }
}

function shellQuote(value) {
  return `'${String(value).replace(/'/g, "'\\''")}'`;
}

function printAction(options, label, action) {
  const prefix = options.dryRun ? '[dry-run]' : '[write]';
  console.log(`${prefix} ${label}: ${action}`);
}

function ask(rl, prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}
