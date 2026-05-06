# Docs Forge Agent Playbook

Use this playbook when the user asks for substantial documentation from a codebase, including architecture docs, API reference, deployment docs, tutorials, walkthroughs, product docs, or a docs site for frameworks such as Fumadocs, Docusaurus, Mintlify, Nextra, Starlight, or MkDocs.

Do not use this playbook for one-off docstring edits, a single README paragraph, or prose that does not need a structured documentation set.

## Operating Model

Docs Forge treats the codebase as the source of truth, the user as the source of intent, and the chosen documentation framework as the rendering target.

Run the work in seven phases:

1. Scope: confirm doc type, audience, framework, output path, and whether existing docs should be migrated.
2. Ingest: inventory the entire codebase and write a persistent knowledge base to `.docs-forge/kb/`.
3. Gap-analyse: identify what code cannot answer and write `.docs-forge/kb/99-open-questions.md`.
4. Elicit: ask only the missing intent questions, in small batches.
5. Generate: write framework-native docs grounded in KB citations and user answers.
6. Capture: only with explicit consent, run the project to capture screenshots or walkthrough media.
7. Assemble: build navigation, validate links, and write a concise final report.

## Ingestion Rules

Start with `git ls-files` when available, otherwise use `rg --files`. Classify every non-skipped file as one of:

- full-read
- sample-read
- stat-only
- skipped, with a reason

Read these in full:

- `README*`, `LICENSE`, `CHANGELOG*`, `CONTRIBUTING*`
- package and workspace manifests
- framework, build, runtime, and environment configs
- main entrypoints
- route definitions and request handlers
- public exports and API schemas
- existing docs pages

Sample-read deep internal helpers and representative tests. Record the role and evidence path for all test files even when they are not read in full.

Skip dependency folders, generated build output, caches, binaries, large fixtures, generated files, and ignored files. Record lockfile existence but do not read lockfile contents unless the docs specifically need dependency resolution details.

## Knowledge Base Layout

Write these files before generating final docs:

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

Use explicit file citations for behavioural claims, such as `src/server/routes.ts:L24-L67`.

## User Questions

Ask blocking questions first. Code cannot reliably answer:

- audience and voice
- supported public API vs internal exports
- user-facing terminology
- roadmap, deprecation, and compatibility guarantees
- pricing, limits, quotas, and operational promises
- which workflows need screenshots or videos

Persist answers to `.docs-forge/answers.json` when writing files is allowed.

## Generation Rules

- Do not invent API surface, routes, configuration keys, or behaviours.
- Do not overwrite existing docs without showing the proposed change.
- Do not run the app, install dependencies, bind ports, use credentials, or call external services without explicit consent.
- Every generated reference page must trace back to KB evidence or a user answer.
- Every code block needs a language tag.
- Navigation must match the target framework conventions.

## Final Report

End with:

```text
Generated: <count> pages across <count> sections
Framework: <framework>
Open gaps: <count>
Skipped visuals: <reason or none>
Broken links: <count or not checked>
Suggested next steps:
  1. <action>
  2. <action>
```
