# Docs Forge

Docs Forge is a portable documentation workflow for coding agents. It turns a real codebase into structured, framework-ready engineering and product documentation by reading the repo first, writing an on-disk knowledge base, asking only for missing maintainer intent, and then generating docs with source citations.

It works across:

- Codex, as a plugin marketplace install with the `$docs-forge` skill.
- Claude Code, as a native `SKILL.md` skill.
- Antigravity, through `AGENTS.md` and optional `GEMINI.md` adapters.
- Other coding agents that read repository instruction files such as `AGENTS.md`.

Website: https://adhit-r.github.io/docs-forge/

Current release: `v0.3.0`

## AI Search Assets

Docs Forge includes crawler-readable and LLM-readable assets for AI search discovery:

- AI answer page: https://adhit-r.github.io/docs-forge/ai-documentation-generator.html
- `llms.txt`: https://adhit-r.github.io/docs-forge/llms.txt
- Product facts: https://adhit-r.github.io/docs-forge/product.md
- Capabilities: https://adhit-r.github.io/docs-forge/capabilities.md
- Pricing: https://adhit-r.github.io/docs-forge/pricing.md
- Sitemap: https://adhit-r.github.io/docs-forge/sitemap.xml

## What Docs Forge Generates

Docs Forge is meant for multi-page documentation work, not one-off prose edits.

It is a good fit for:

- Architecture documentation.
- API references.
- SDK or library documentation.
- Configuration and environment variable references.
- Deployment guides.
- Contributor onboarding.
- Runbooks and troubleshooting docs.
- Product how-to guides.
- Tutorials and walkthroughs.
- Docs-site setup for Fumadocs, Docusaurus, Mintlify, Nextra, Starlight, and MkDocs.

It should not be used for:

- A single docstring or code comment.
- A short README paragraph edit.
- Blog posts or memos with no codebase-grounded structure.
- API client code generation from OpenAPI specs.

## Quick Install

Run the GitHub-backed `npx` installer:

```bash
npx github:adhit-r/docs-forge#v0.3.0
```

The TUI-style terminal prompt asks which agent you want to configure:

```text
Select agents to install:
  1. Codex marketplace plugin (codex)
  2. Claude Code skill (claude)
  3. Antigravity AGENTS.md adapter (antigravity)
  4. Universal AGENTS.md playbook (universal)
  5. All agents
Agents [all]:
```

This is currently GitHub-backed `npx`, not an npm-registry package. Use the full `github:adhit-r/docs-forge#v0.3.0` form until a registry package is published.

## Non-Interactive Installs

Claude Code, user-wide:

```bash
npx github:adhit-r/docs-forge#v0.3.0 --agents claude --scope user --yes
```

Claude Code, project-local:

```bash
npx github:adhit-r/docs-forge#v0.3.0 --agents claude --scope project --target . --yes
```

Antigravity in the current project, including the optional `GEMINI.md` override:

```bash
npx github:adhit-r/docs-forge#v0.3.0 --agents antigravity --target . --with-gemini --yes
```

Universal `AGENTS.md` playbook in the current project:

```bash
npx github:adhit-r/docs-forge#v0.3.0 --agents universal --target . --yes
```

Claude Code plus Antigravity in one project:

```bash
npx github:adhit-r/docs-forge#v0.3.0 --agents claude,antigravity --scope project --target . --with-gemini --yes
```

Codex dry run:

```bash
npx github:adhit-r/docs-forge#v0.3.0 --agents codex --dry-run --yes
```

All supported agent paths:

```bash
npx github:adhit-r/docs-forge#v0.3.0 --agents all --target . --with-gemini
```

## Installer Options

```text
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
  --help                Show help.
  --version             Show version.
```

Accepted agent names:

| Agent | Aliases | What it installs |
|---|---|---|
| `codex` | none | Runs or prints the Codex marketplace add command. |
| `claude` | `claude-code`, `claude_code` | Copies the canonical Docs Forge skill folder. |
| `antigravity` | none | Merges the Antigravity `AGENTS.md` adapter into the target project. |
| `universal` | none | Merges the universal `AGENTS.md` playbook into the target project. |
| `all` | `5` in the prompt | Installs every supported path. |

## What Gets Written

### Codex

The installer runs this command when `codex` is selected and the Codex CLI exists:

```bash
codex plugin marketplace add adhit-r/docs-forge --ref v0.3.0
```

If `codex` is not available on `PATH`, the installer prints the manual command instead of failing the whole install.

### Claude Code

For `--scope user`, the skill is copied to:

```text
~/.claude/skills/docs-forge/
```

For `--scope project --target .`, the skill is copied to:

```text
.claude/skills/docs-forge/
```

The copied folder contains the canonical skill entrypoint:

```text
SKILL.md
```

If the destination already exists, the installer asks before replacing it. In non-interactive mode with `--yes`, it will skip an existing destination unless `--force` is also provided.

### Antigravity

The installer merges this adapter:

```text
adapters/antigravity/AGENTS.md
```

into the target project's:

```text
AGENTS.md
```

The inserted block is wrapped in markers so future installer runs can update the same block instead of duplicating it:

```text
<!-- docs-forge:antigravity:start -->
...
<!-- docs-forge:antigravity:end -->
```

With `--with-gemini`, it also merges:

```text
adapters/antigravity/GEMINI.md
```

into:

```text
GEMINI.md
```

### Universal AGENTS.md

The universal adapter is for agents that read `AGENTS.md` but do not support skills directly:

```text
adapters/universal/AGENTS.md
```

It is merged into the target project's `AGENTS.md` with these markers:

```text
<!-- docs-forge:universal:start -->
...
<!-- docs-forge:universal:end -->
```

## Manual Install

The `npx` installer is preferred, but every install path can be performed manually.

### Manual Codex Install

```bash
codex plugin marketplace add adhit-r/docs-forge --ref v0.3.0
```

Then open the Codex plugin UI, install `Docs Forge`, and start a new chat with the plugin enabled.

Use `--ref main` only if you want the latest development version.

### Manual Claude Code Install

```bash
git clone --branch v0.3.0 --depth 1 https://github.com/adhit-r/docs-forge.git
mkdir -p ~/.claude/skills
cp -R docs-forge/plugins/docs-forge/skills/docs-forge ~/.claude/skills/docs-forge
```

Restart Claude Code, then invoke:

```text
/docs-forge Document this codebase.
```

For project-local Claude installs:

```bash
mkdir -p .claude/skills
cp -R /path/to/docs-forge/plugins/docs-forge/skills/docs-forge .claude/skills/docs-forge
```

### Manual Antigravity Install

Copy or merge:

```text
adapters/antigravity/AGENTS.md
```

into the target repo's:

```text
AGENTS.md
```

Optionally copy or merge:

```text
adapters/antigravity/GEMINI.md
```

into:

```text
GEMINI.md
```

If the target project already has `AGENTS.md`, merge the Docs Forge playbook into it instead of overwriting the file.

### Manual Universal Agent Install

Copy or merge:

```text
adapters/universal/AGENTS.md
```

into the target repo's:

```text
AGENTS.md
```

## How To Use

Codex direct invocation:

```text
$docs-forge Document this codebase.
```

Claude Code direct invocation:

```text
/docs-forge Document this codebase.
```

Natural prompts also work in any supported agent after installation:

```text
Create API reference docs from this repo.
Set up a docs site for this project.
Generate product walkthrough docs for this app.
Create architecture docs and a deployment guide.
Document all public routes and configuration options.
Regenerate stale docs from the current codebase.
```

## Workflow

Docs Forge uses a seven-phase workflow.

| Phase | Purpose | Output |
|---|---|---|
| 1. Scope | Confirm doc type, audience, framework, output path, and existing docs policy. | `.docs-forge/scope.json` |
| 2. Ingest | Inventory the entire codebase and classify every non-skipped file. | `.docs-forge/kb/*.md` |
| 3. Gap-analyse | Identify what code cannot answer. | `.docs-forge/kb/99-open-questions.md` |
| 4. Elicit | Ask only the missing maintainer-intent questions. | `.docs-forge/answers.json` |
| 5. Generate | Write framework-native pages grounded in citations and answers. | Docs pages in the selected output dir |
| 6. Capture | Optionally run the app for screenshots or videos after explicit consent. | `media/screenshots/`, `media/videos/` |
| 7. Assemble | Build nav, validate links, and write a final report. | Nav config, link report, completeness report |

The workflow is resumable. If `.docs-forge/` already exists, the agent should continue from the latest completed phase instead of re-reading everything blindly.

## Codebase Ingestion

Docs Forge starts with `git ls-files` when available, otherwise `rg --files`.

It classifies every non-skipped file as:

- `full-read`
- `sample-read`
- `stat-only`
- `skipped`, with a reason

It always prioritizes:

- `README*`, `LICENSE`, `CHANGELOG*`, `CONTRIBUTING*`
- package manifests and workspace manifests
- framework, build, runtime, and environment configs
- main entrypoints
- route definitions and request handlers
- public exports and API schemas
- domain models and schemas
- CI/CD and infrastructure files
- representative tests
- existing docs pages

It skips dependency folders, generated output, caches, binaries, large fixtures, generated files, ignored files, and lockfile contents unless they are specifically needed.

## Knowledge Base Layout

Before generating final docs, Docs Forge writes:

```text
.docs-forge/kb/
|-- 00-project-overview.md
|-- 01-architecture.md
|-- 02-public-surface.md
|-- 03-features.md
|-- 04-existing-docs.md
|-- 05-build-and-run.md
|-- 06-glossary.md
`-- 99-open-questions.md
```

The knowledge base should include source citations for behaviour claims, such as:

```text
src/server/routes.ts:L24-L67
```

Those citations are what keep generated docs verifiable instead of plausibly shaped.

## Supported Documentation Frameworks

Docs Forge can adapt generated pages and navigation for:

| Framework | Typical files | Navigation |
|---|---|---|
| Fumadocs | `.mdx` | `meta.json` |
| Docusaurus | `.mdx` | `sidebars.js` or autogen |
| Mintlify | `.mdx` | `mint.json` |
| Nextra | `.mdx` | `_meta.json` |
| Starlight | `.md` or `.mdx` | `astro.config.*` sidebar |
| MkDocs Material | `.md` | `mkdocs.yml` |

If no docs framework exists in the target repo, the agent should detect the stack and recommend a small set of suitable options before generating files.

## Safety Rules

Docs Forge is allowed to read and write documentation files, adapters, and `.docs-forge/` artifacts.

It should not:

- Invent public APIs, routes, configuration keys, limits, or behaviours.
- Treat every export as public without maintainer confirmation.
- Overwrite existing docs silently.
- Run install commands, dev servers, browser automation, or external services without explicit consent.
- Use real credentials without explicit user approval.
- Embed placeholder screenshots.
- Claim visuals were captured when they were not.

Visual capture is opt-in. Before running an app, the agent should show the exact commands, ports, environment variables, and test data it plans to use.

## Repository Layout

```text
.github/workflows/pages.yml
.agents/plugins/marketplace.json
AGENTS.md
CHANGELOG.md
LICENSE
README.md
adapters/
  antigravity/
    AGENTS.md
    GEMINI.md
  claude-code/
    README.md
  universal/
    AGENTS.md
bin/
  docs-forge.js
package.json
plugins/
  docs-forge/
    .codex-plugin/
      plugin.json
    skills/
      docs-forge/
        SKILL.md
site/
  index.html
  styles.css
  favicon.svg
```

## Development

Run the CLI locally:

```bash
node bin/docs-forge.js --help
node bin/docs-forge.js --version
```

Run a dry-run Codex install:

```bash
node bin/docs-forge.js install --agents codex --dry-run --yes
```

Test project-local writes in a temp directory:

```bash
node bin/docs-forge.js install \
  --agents claude,antigravity,universal \
  --scope project \
  --target /private/tmp/docs-forge-installer-smoke \
  --with-gemini \
  --force \
  --yes
```

Validate JSON files:

```bash
jq . package.json
jq . plugins/docs-forge/.codex-plugin/plugin.json
```

Check the npm package contents without writing to the default npm cache:

```bash
npm --cache /private/tmp/docs-forge-npm-cache pack --dry-run
```

Run the package test:

```bash
npm --cache /private/tmp/docs-forge-npm-cache test
```

## Troubleshooting

### `npx docs-forge` does not work

Docs Forge is not currently published to the npm registry. Use the GitHub-backed command:

```bash
npx github:adhit-r/docs-forge#v0.3.0
```

### npm cache permission errors

If npm reports permission errors under `~/.npm`, use a writable cache for this command:

```bash
npm --cache /private/tmp/docs-forge-npm-cache exec --yes --package github:adhit-r/docs-forge#v0.3.0 docs-forge -- --help
```

### Codex CLI is not found

The installer will print the manual Codex command:

```bash
codex plugin marketplace add adhit-r/docs-forge --ref v0.3.0
```

Install or open Codex first, then run the command manually.

### Claude Code skill already exists

Re-run with `--force` if you want to replace the existing skill folder:

```bash
npx github:adhit-r/docs-forge#v0.3.0 --agents claude --scope user --force --yes
```

### Existing `AGENTS.md` already has project instructions

The installer appends or updates a marked Docs Forge block. It does not delete unrelated project instructions.

If you install manually, merge the adapter content into the existing file instead of replacing it.

## Versioning

Use pinned release refs for reproducible installs:

```bash
npx github:adhit-r/docs-forge#v0.3.0
```

Use `main` only if you want the latest development version:

```bash
npx github:adhit-r/docs-forge#main
```

## License

MIT
