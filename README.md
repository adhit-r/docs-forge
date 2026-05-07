# Docs Forge

Docs Forge is a portable agent workflow for generating structured, framework-ready documentation from a codebase.

It is designed for multi-page engineering and product documentation work, including architecture docs, API references, deployment guides, tutorials, walkthroughs, and docs-site setup for frameworks such as Fumadocs, Docusaurus, Mintlify, Nextra, Starlight, and MkDocs.

It ships with an `npx` installer that asks which agent you use, plus manual adapters for Codex, Claude Code, Antigravity, and other `AGENTS.md`-compatible coding agents.

Website: https://adhit-r.github.io/docs-forge/

## Install

Run the installer:

```bash
npx github:adhit-r/docs-forge#v0.3.0
```

The terminal prompt asks which agent to install for:

- Codex marketplace plugin
- Claude Code skill
- Antigravity `AGENTS.md` adapter
- Universal `AGENTS.md` playbook

Non-interactive examples:

```bash
npx github:adhit-r/docs-forge#v0.3.0 --agents claude --scope user --yes
npx github:adhit-r/docs-forge#v0.3.0 --agents antigravity --target . --with-gemini --yes
npx github:adhit-r/docs-forge#v0.3.0 --agents claude,antigravity --scope project --target . --yes
```

## Manual Codex Install

Add this repository as a Codex plugin marketplace:

```bash
codex plugin marketplace add adhit-r/docs-forge --ref v0.3.0
```

Then open the Codex plugin UI, install `Docs Forge`, and start a new chat with the plugin enabled.

Use `--ref main` only if you want the latest development version.

## Manual Claude Code Install

Claude Code can consume the same `SKILL.md` directly:

```bash
git clone --branch v0.3.0 --depth 1 https://github.com/adhit-r/docs-forge.git
mkdir -p ~/.claude/skills
cp -R docs-forge/plugins/docs-forge/skills/docs-forge ~/.claude/skills/docs-forge
```

Then restart Claude Code and run:

```text
/docs-forge Document this codebase.
```

See [adapters/claude-code/README.md](adapters/claude-code/README.md) for personal and project install options.

## Antigravity and Other Agents

For Antigravity, copy the adapter into the target project:

```bash
cp docs-forge/adapters/antigravity/AGENTS.md ./AGENTS.md
```

If the target project already has `AGENTS.md`, merge the Docs Forge playbook into it instead of overwriting the file.

If you prefer Antigravity-native overrides, also copy:

```bash
cp docs-forge/adapters/antigravity/GEMINI.md ./GEMINI.md
```

For other coding agents that read `AGENTS.md`, use [adapters/universal/AGENTS.md](adapters/universal/AGENTS.md) as the portable playbook.

## Use

Invoke it directly in Codex:

```text
$docs-forge Document this codebase.
```

Invoke it directly in Claude Code:

```text
/docs-forge Document this codebase.
```

Or use a natural prompt:

```text
Create API reference docs from this repo.
Set up a docs site for this project.
Generate product walkthrough docs for this app.
```

## Repository Layout

```text
.github/workflows/pages.yml
.agents/plugins/marketplace.json
AGENTS.md
adapters/
bin/docs-forge.js
package.json
site/
plugins/docs-forge/.codex-plugin/plugin.json
plugins/docs-forge/skills/docs-forge/SKILL.md
```

## License

MIT
