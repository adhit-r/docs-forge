# Docs Forge Repository Instructions

## Project Scope

Docs Forge is a portable documentation workflow with a Codex plugin package, a Claude Code skill path, and Markdown adapters for Antigravity and other AGENTS.md-compatible coding agents.

## Maintenance Rules

- Keep the canonical workflow in `plugins/docs-forge/skills/docs-forge/SKILL.md`.
- Keep `README.md`, `site/index.html`, `CHANGELOG.md`, and adapter docs aligned when the workflow, install command, or version changes.
- Treat `adapters/universal/AGENTS.md` as the portable playbook for tools that cannot load skills directly.
- Treat `adapters/claude-code/README.md` as the Claude Code install guide. Claude Code consumes the canonical `SKILL.md` without a forked copy.
- Treat `adapters/antigravity/AGENTS.md` and `adapters/antigravity/GEMINI.md` as Antigravity-specific entrypoints.

## UI Rules

- Do not use emoji.
- Do not use purple gradients.
- Keep the website direct, technical, and product-grade.

## Validation

- For content changes, review the changed Markdown and HTML for stale version numbers and mismatched invocation syntax.
- For website changes, inspect the static page structure and check mobile-width text wrapping before publishing.
