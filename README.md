# Docs Forge

Docs Forge is a Codex plugin that adds the `docs-forge` skill for generating structured, framework-ready documentation from a codebase.

It is designed for multi-page engineering and product documentation work, including architecture docs, API references, deployment guides, tutorials, walkthroughs, and docs-site setup for frameworks such as Fumadocs, Docusaurus, Mintlify, Nextra, Starlight, and MkDocs.

## Install

Add this repository as a Codex plugin marketplace:

```bash
codex plugin marketplace add adhit-r/docs-forge
```

Then open the Codex plugin UI, install `Docs Forge`, and start a new chat with the plugin enabled.

## Use

Invoke it directly:

```text
@docs-forge Document this codebase.
```

Or use a natural prompt:

```text
Create API reference docs from this repo.
Set up a docs site for this project.
Generate product walkthrough docs for this app.
```

## Repository Layout

```text
.agents/plugins/marketplace.json
plugins/docs-forge/.codex-plugin/plugin.json
plugins/docs-forge/skills/docs-forge/SKILL.md
```

## License

This repository is currently marked `UNLICENSED` in the plugin manifest. Add a license before encouraging reuse or contributions.
