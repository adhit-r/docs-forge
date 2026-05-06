# Docs Forge Antigravity Override

This file is optional. Use it when Antigravity should prefer a native `GEMINI.md` entrypoint in addition to, or instead of, `AGENTS.md`.

## Instruction

For documentation-generation requests, follow the Docs Forge workflow from `AGENTS.md` in this directory:

- Scope before reading code.
- Ingest the entire codebase and classify every non-skipped file.
- Persist `.docs-forge/kb/` before generating docs.
- Ask only for missing maintainer intent.
- Generate framework-native docs with source citations.
- Run local apps, browser automation, or external calls only after explicit consent.

Antigravity-specific artifacts should include the plan, task list, changed-files summary, validation results, and any approved screenshots or browser recordings.
