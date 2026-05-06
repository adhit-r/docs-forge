# Docs Forge for Antigravity

Use this file as the project-level Antigravity instruction file when a repository needs Docs Forge documentation generation.

## Trigger

When the user asks to document a repo, create a docs site, write API reference docs, write architecture docs, generate product docs, or migrate existing docs, follow the Docs Forge workflow below.

## Workflow

1. Confirm doc type, audience, target framework, output directory, and migration policy for existing docs.
2. Inventory the entire codebase with `git ls-files` when available, otherwise `rg --files`.
3. Classify every non-skipped file as full-read, sample-read, stat-only, or skipped with a reason.
4. Build `.docs-forge/kb/` before writing final docs.
5. Create `.docs-forge/kb/99-open-questions.md` before asking the user anything.
6. Ask only for intent that code cannot prove.
7. Generate framework-native pages with source citations.
8. Produce Antigravity artifacts that make the work reviewable: task list, implementation plan, changed-files summary, validation results, and screenshots only when consent was granted.

## Required Knowledge Base

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

## Consent Rules

Do not install dependencies, start servers, run browser automation, call external services, or use credentials without explicit user consent. Show the exact commands, ports, and environment assumptions first.

## Output Rules

- Do not invent unsupported public APIs.
- Do not treat every export as public unless the user confirms it.
- Do not overwrite existing docs silently.
- Do not embed placeholder screenshots.
- Keep every behavioural claim tied to source evidence or a user answer.

For the longer portable playbook, see `adapters/universal/AGENTS.md` in the Docs Forge repository.
