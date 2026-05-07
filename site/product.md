# Docs Forge Product Facts

## Short Description

Docs Forge is a portable documentation workflow for coding agents. It generates structured engineering and product documentation from real codebases.

## Category

- Developer tool
- Documentation generator
- Codebase documentation workflow
- Agent skill and adapter package

## Primary Use Cases

- Generate API reference documentation from source code.
- Generate architecture documentation from a repository.
- Generate deployment guides and runbooks.
- Generate contributor onboarding docs.
- Generate product how-to guides and tutorials.
- Set up framework-ready docs sites.
- Build documentation workflows for Codex, Claude Code, Antigravity, and AGENTS.md-compatible coding agents.

## Supported Agents

| Agent | Support Type | Invocation |
|---|---|---|
| Codex | Plugin marketplace package | `$docs-forge Document this codebase.` |
| Claude Code | Native skill folder with `SKILL.md` | `/docs-forge Document this codebase.` |
| Antigravity | `AGENTS.md` adapter and optional `GEMINI.md` override | Natural-language prompt |
| Universal agents | `AGENTS.md` playbook | Natural-language prompt |

## Supported Documentation Frameworks

- Fumadocs
- Docusaurus
- Mintlify
- Nextra
- Starlight
- MkDocs Material

## Key Differentiators

- Reads the entire codebase before generating final docs.
- Classifies every non-skipped file as full-read, sample-read, stat-only, or skipped.
- Writes a persistent `.docs-forge/kb/` knowledge base.
- Asks only for maintainer intent that the code cannot prove.
- Generates framework-ready pages with source citations.
- Includes a dependency-free npx installer.
- Works across Codex, Claude Code, Antigravity, and AGENTS.md-compatible agents.

## Install

```bash
npx github:adhit-r/docs-forge#v0.3.0
```

## Repository

https://github.com/adhit-r/docs-forge

## Website

https://adhit-r.github.io/docs-forge/

## License

MIT
