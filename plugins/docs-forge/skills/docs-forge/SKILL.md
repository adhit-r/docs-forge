---
name: docs-forge
description: Use when the user wants to generate, regenerate, or substantially expand documentation for a codebase. Triggers include "document this project," "create a docs site," "write an API reference," "generate how-to guides," "set up Fumadocs/Docusaurus/Mintlify/Nextra/Starlight/MkDocs," "build product docs," or any request to produce structured developer or product documentation from existing code. Works as a Codex skill and as a Claude Code skill because the canonical entrypoint is this SKILL.md. For Antigravity and other AGENTS.md-compatible tools, use the adapter playbooks in this repository. Handles engineering docs (architecture, API reference, contributing, deployment) and product docs (how-tos, tutorials, walkthroughs, FAQs). Builds an on-disk knowledge base from the entire codebase, identifies what code cannot answer (audience, naming, use cases, deprecation, constraints), runs targeted Q&A to fill gaps, then emits framework-ready output with optional screenshots or Remotion videos after explicit consent to run code locally. Do NOT use for one-off docstring fixes, single-page edits, or prose without structural intent.
---

# Docs Forge

A documentation-generation skill that treats a codebase as the source of truth, the user as the source of *intent*, and the chosen docs framework as the rendering target. It is opinionated about what code can answer on its own, what only the user can answer, and what can only be answered by *running* the code.

This `SKILL.md` is the canonical skill entrypoint for both Codex and Claude Code. Antigravity, Gemini-style agents, and other coding agents that do not load skills directly should use the Markdown adapters in `adapters/`.

## What this skill does

Given a codebase and a user goal, Docs Forge produces a complete, framework-ready documentation set in seven phases:

1. **Scope** — confirm doc type, audience, framework, and output location.
2. **Ingest** — walk the entire codebase, classify every non-skipped file, and persist a structured knowledge base to `.docs-forge/kb/`.
3. **Gap-analyse** — diff what code reveals vs. what good docs need; produce an `open-questions.md`.
4. **Elicit** — ask the user only the questions code cannot answer, in tight batches.
5. **Generate** — render pages in the chosen framework's conventions (Fumadocs / Docusaurus / Mintlify / Nextra / Starlight / MkDocs).
6. **Capture** (optional) — with explicit consent, run the project locally to take screenshots or generate Remotion videos.
7. **Assemble** — build navigation/sidebars, cross-link pages, validate links and structure, run a final completeness review.

The skill is resumable: every phase writes its state to `.docs-forge/` so a later session can continue without re-reading the codebase.

## When to use this skill

**Use it when:**

- The user references a docs framework by name (Fumadocs, Docusaurus, Mintlify, Nextra, Starlight, MkDocs, GitBook, ReadMe).
- The user says "document this codebase," "I need an API reference," "set up a docs site," "write product docs," or anything implying multi-page structured output.
- The user wants a how-to, tutorial, or walkthrough generated from working code.
- An existing docs site is stale and needs a regeneration pass against current code.
- The user wants developer onboarding material (architecture, contributing, runbooks).

**Do NOT use it when:**

- The user wants a single docstring or comment fix.
- The user wants prose with no structural intent (a blog post, a memo, a single README paragraph) — use the relevant content skill instead.
- The user wants to *edit* one existing page in place — just edit it directly.
- The user wants API client code generated from an OpenAPI spec — that is a code-gen task, not a docs task.

---

## The seven-phase workflow at a glance

| Phase | Output artefact | Resumable? |
|---|---|---|
| 1. Scope | `.docs-forge/scope.json` | Yes |
| 2. Ingest | `.docs-forge/kb/*.md` | Yes |
| 3. Gap-analyse | `.docs-forge/kb/99-open-questions.md` | Yes |
| 4. Elicit | `.docs-forge/answers.json` | Yes |
| 5. Generate | Framework-native pages in target dir | Yes |
| 6. Capture | `media/screenshots/`, `media/videos/` | Yes |
| 7. Assemble | Sidebar/nav config, link report | Yes |

If `.docs-forge/` already exists, the skill **resumes from the latest completed phase** and confirms with the user before redoing earlier work.

---

## Phase 1 — Scope and framework selection

This phase happens **before any code is read**. The cost of misunderstanding scope is high: a knowledge base built for an API reference is not the same shape as one built for product how-tos.

### What to confirm with the user

Ask in one consolidated message (use multiple-choice elicitation if available):

1. **Doc type** — engineering docs, product docs, or both?
   - *Engineering*: architecture, API reference, configuration, deployment, contributing, runbooks.
   - *Product*: how-to guides, tutorials, feature walkthroughs, FAQs, troubleshooting.
2. **Audience** — internal team, external developers, end users (technical), end users (non-technical), or mixed.
3. **Framework** — auto-detect first by scanning for `docusaurus.config.*`, `mint.json`, `astro.config.*` with `@astrojs/starlight`, `next.config.*` with `nextra`, `fumadocs.config.*`, or `mkdocs.yml`. If nothing is found, offer the top three based on stack:
   - JS/TS project, dev-tool flavour → **Fumadocs** or **Nextra**.
   - JS/TS project, marketing-doc flavour → **Mintlify** or **Docusaurus**.
   - Polyglot or Python-heavy → **MkDocs (Material)**.
   - Astro/static-first → **Starlight**.
4. **Output location** — default to `docs/` or the framework's convention; confirm if a non-default path is desired.
5. **Existing docs** — are there pages to migrate, or is this greenfield?

Persist the answers to `.docs-forge/scope.json`:

```json
{
  "doc_type": ["engineering", "product"],
  "audience": "external developers",
  "framework": "fumadocs",
  "output_dir": "content/docs",
  "existing_docs": "migrate",
  "existing_docs_path": "docs/",
  "version": "v1"
}
```

### Framework matrix

| Framework | File extension | Frontmatter keys | Nav config | Notable components |
|---|---|---|---|---|
| Fumadocs | `.mdx` | `title`, `description` | `meta.json` per folder | `<Cards>`, `<Steps>`, `<Tabs>`, `<Callout>` |
| Docusaurus | `.mdx` | `id`, `title`, `sidebar_label`, `sidebar_position` | `sidebars.js` (or autogen) | `<Tabs>`, `<TabItem>`, `:::note/tip/warning` |
| Mintlify | `.mdx` | `title`, `description`, `icon` | `mint.json` `navigation` array | `<Card>`, `<CardGroup>`, `<Steps>`, `<AccordionGroup>` |
| Nextra | `.mdx` | `title` | `_meta.json` per folder | `<Callout>`, `<Tabs>`, `<Steps>` |
| Starlight | `.md`/`.mdx` | `title`, `description` | `astro.config.mjs` `sidebar` | `<Card>`, `<CardGrid>`, `<Tabs>`, `<Aside>` |
| MkDocs Material | `.md` | none (use H1) | `mkdocs.yml` `nav` | admonitions `!!! note`, content tabs, mermaid |

### If existing docs are present

Inventory them before generating new content. For each existing page:

- Extract title, slug, frontmatter, last-modified date.
- Decide one of: **keep verbatim**, **regenerate from code**, **merge with new**, **deprecate**.
- Save the inventory to `.docs-forge/kb/04-existing-docs.md`. Do not touch existing files until Phase 5, and even then only with the user's confirmation per page.

---

## Phase 2 — Codebase knowledge base

Goal: a structured, on-disk understanding of the entire project that is good enough for a future agent session to write accurate docs without re-reading the codebase.

Start by inventorying the whole codebase with `git ls-files` when available, otherwise `rg --files`. The priority list below controls read order and depth, not scope: every non-skipped source file should be classified as full-read, sample-read, stat-only, or skipped with a reason.

### Ingestion priority (read the whole codebase in this order)

1. **Project metadata** — `README*`, `package.json`, `pyproject.toml`, `Cargo.toml`, `go.mod`, `composer.json`, `Gemfile`, `requirements*.txt`, `pnpm-workspace.yaml`, `turbo.json`, `nx.json`, `LICENSE`, `CHANGELOG*`, `CONTRIBUTING*`, `.tool-versions`.
2. **Configuration that shapes behaviour** — env templates (`.env.example`, `*.env.template`), framework configs (`next.config.*`, `vite.config.*`, `tsconfig*.json`, `astro.config.*`, `nuxt.config.*`, `django settings`, `application.yml`).
3. **Entry points** — `src/index.*`, `src/main.*`, `app/page.*`, `pages/_app.*`, `cmd/*/main.go`, `manage.py`, `wsgi.py`, `asgi.py`, `bin/*`.
4. **Public API surfaces** — anything that consumers import: top-level `index.ts` re-exports, `__init__.py` exports, `lib/`, `pkg/`, OpenAPI/Swagger files, GraphQL schemas, protobuf, route definitions.
5. **Routes and handlers** — Next.js `app/`, Express/Fastify routers, FastAPI/Flask blueprints, Rails routes, Django urls.
6. **Domain models** — `models/`, `schemas/`, `entities/`, `prisma/schema.prisma`, ORM definitions.
7. **CI/CD and infra** — `.github/workflows/*`, `Dockerfile*`, `docker-compose*.yml`, `terraform/`, `kubernetes/`, `helm/`, `vercel.json`, `netlify.toml`.
8. **Tests** — sample-read 5–10 representative tests per major module to learn intended behaviour and naming.
9. **Existing docs** — every file already inside `docs/`, `documentation/`, `wiki/`, or the framework's content dir.

### What to skip

- `node_modules/`, `vendor/`, `.venv/`, `__pycache__/`, `target/`, `build/`, `dist/`, `.next/`, `.nuxt/`, `out/`.
- Lockfiles (`package-lock.json`, `pnpm-lock.yaml`, `yarn.lock`, `poetry.lock`, `Cargo.lock`, `go.sum`) — record their existence, not contents.
- Generated files (anything with `// AUTOGENERATED` or `# Code generated` headers, `*.gen.*`, `*.pb.go`).
- Binary assets, large fixtures, snapshot tests.
- Anything in `.gitignore` (use `git ls-files` if available; otherwise respect the ignore file manually).

### Reading discipline

- **Classify every non-skipped file**: record its role, read depth, and why it matters or does not matter for docs.
- **Always read in full**: README, top-level config files, main entry points, top-level route file, public re-export files, OpenAPI/GraphQL schemas, existing docs.
- **Sample-read** (head + tail + any function with a docstring): deep utilities, internal helpers, large model files.
- **Stat-only** (record existence, size, role): test files, fixtures, generated files, large data files.

### Knowledge base file layout

Write to `.docs-forge/kb/`:

```
.docs-forge/kb/
├── 00-project-overview.md       # one-paragraph "what is this", stack, package manager, run/build commands
├── 01-architecture.md           # module map, data flow, external dependencies
├── 02-public-surface.md         # exported APIs, routes, CLI commands, env vars
├── 03-features.md               # one entry per user-visible feature: name, location in code, status
├── 04-existing-docs.md          # inventory of pre-existing docs
├── 05-build-and-run.md          # how to install, build, test, run locally, deploy
├── 06-glossary.md               # internal terms found in code
└── 99-open-questions.md         # written in Phase 3
```

Each file is a structured markdown note with **explicit citations to source paths** (e.g., `src/auth/session.ts:L42-L78`). Citations matter: in Phase 5 the docs page generator uses them to verify claims.

### Monorepo and polyglot handling

- **Monorepo**: detect via `pnpm-workspace.yaml`, `turbo.json`, `nx.json`, `lerna.json`, `Cargo.toml [workspace]`, or top-level `packages/`/`apps/`/`services/`. Build *one knowledge base per package* under `.docs-forge/kb/<package-name>/`, plus a top-level `00-monorepo-overview.md`.
- **Polyglot**: detect by file extension distribution. If a project has e.g. a Python backend and a TS frontend, treat them as logical sub-projects with their own KB folders.
- **Confirm with the user** before generating per-package docs vs. one combined site. This is a Phase 1 follow-up question if a monorepo is detected.

---

## Phase 3 — Gap analysis

The knowledge base captures what *exists*. The gap analysis captures what *good documentation also needs*, which the codebase usually cannot supply.

### What code cannot tell you

- **Audience**: who is this for? (developers integrating? end users? auditors?)
- **Public vs. internal API**: an exported symbol is not necessarily a *supported* one.
- **User-facing terminology**: code calls it `WidgetConfig`; users call it "widget settings."
- **Why decisions were made**: ADRs are rare; code rarely explains itself.
- **Use cases and workflows**: a feature in code is not a user story.
- **Deprecation and roadmap**: which features should be documented, omitted, or labelled "preview"?
- **Compatibility guarantees**: semver behaviour, supported versions, breaking-change policy.
- **Operational characteristics**: limits, quotas, performance envelopes, pricing tiers.
- **Visual context**: which features need screenshots? videos? diagrams?
- **Voice and tone**: formal? friendly? terse?

### Output: `99-open-questions.md`

Group questions by category and tag each as **blocking** (cannot generate accurate docs without an answer), **important** (docs will be vague without it), or **optional** (improves polish).

```markdown
## Audience
- [BLOCKING] Who is the primary reader for the API reference — internal engineers, partner integrators, or both?

## Naming
- [IMPORTANT] In code this is `OrgScope`. What term should end users see?

## Public surface
- [BLOCKING] `src/internal/legacy.ts` exports four functions. Are any of these supported public API, or all internal?

## Use cases
- [IMPORTANT] What are the top three things a user does with the `Webhooks` feature?

## Visuals
- [OPTIONAL] Should the "Quick start" tutorial include a recorded walkthrough video?
```

This file is written before any user questions are asked. The user can review and edit it directly.

---

## Phase 4 — Targeted Q&A with the user

### Question batching

- Ask blocking questions first, in batches of **3–5**.
- Use multiple-choice/structured elicitation where possible (e.g., for audience, voice, doc-type-per-feature). Reserve free-text for naming, use cases, and rationale.
- Allow **"skip"** or **"I'll come back to this"** on every non-blocking question; record the skip in `.docs-forge/answers.json` so the gap is visible in the final report.

### Question types

| Type | Format | Example |
|---|---|---|
| Audience | single-select | Who reads this? *Internal devs / Partner devs / End users (technical) / End users (non-technical)* |
| Public/internal | per-symbol multi-select | Which of these exports are supported public API? |
| Naming | free-text with default | User-facing name for `OrgScope` *(default: "organisation scope")* |
| Use case | free-text bulleted | List the top 3 user workflows for this feature |
| Voice/tone | single-select | *Formal / Friendly / Terse* |
| Visual asset | per-page yes/no | Should the X page include a screenshot? |

### Persisting answers

Write everything to `.docs-forge/answers.json`. On any later run, re-prompt only for unanswered or stale entries (entries can be marked stale if the underlying code has changed — track via git SHA of relevant files).

---

## Phase 5 — Documentation generation

Pages are written one at a time, each grounded in (a) specific KB citations and (b) specific answer entries. A page that cannot cite either fails the completeness check and is flagged in Phase 7.

### Engineering docs deliverables

A complete engineering docs set typically includes:

- **Getting started** — install, run locally, hello-world.
- **Architecture overview** — system context, module map, data flow.
- **API reference** — one page per public module/route/CLI command.
- **Configuration** — every env var and config key, with defaults.
- **Authentication & authorization** (if applicable).
- **Deployment** — environments, CI/CD, infra requirements.
- **Contributing** — dev setup, testing, PR conventions, code style.
- **Runbooks** — common operational tasks, troubleshooting.
- **Changelog / migration guides** — generated from `CHANGELOG.md` if present.

### Product docs deliverables

- **Quick start / first success** — the shortest path to a working result.
- **Concept guides** — one per top-level mental model (e.g., "How projects work").
- **How-to guides** — task-oriented, one per user workflow.
- **Tutorials** — longer, end-to-end, narrative.
- **Reference** — settings, limits, plans, pricing if applicable.
- **Troubleshooting / FAQ**.

### Page template (framework-agnostic)

Every generated page follows this internal structure before being adapted to a framework:

```
TITLE
Description (≤160 chars, used in frontmatter and SEO)

WHEN TO USE THIS / WHO THIS IS FOR     ← skip for reference pages
PREREQUISITES
STEPS or SECTIONS                      ← numbered for how-to/tutorial
EXAMPLES                               ← code blocks with language tags
LIMITATIONS / GOTCHAS                  ← if KB flagged any
RELATED                                ← cross-links
```

### Framework adapters

Each adapter takes the generic page and emits framework-correct files plus nav config. Adapters live in `references/adapters/<framework>.md` (see *Companion files*).

#### Fumadocs

```mdx
---
title: Webhooks
description: Subscribe to events from your account in real time.
---

import { Callout } from 'fumadocs-ui/components/callout';
import { Steps, Step } from 'fumadocs-ui/components/steps';

# Webhooks

<Callout type="info">Available on Pro plans and above.</Callout>

<Steps>
  <Step>Create an endpoint in your dashboard.</Step>
  <Step>Verify the signing secret on receipt.</Step>
</Steps>
```

`meta.json` per folder:

```json
{
  "title": "Reference",
  "pages": ["webhooks", "events", "errors"]
}
```

#### Docusaurus

```mdx
---
id: webhooks
title: Webhooks
sidebar_label: Webhooks
sidebar_position: 3
description: Subscribe to events from your account in real time.
---

:::info
Available on Pro plans and above.
:::

## Create an endpoint

```ts
// example
```
```

`sidebars.js` (only if not autogenerated):

```js
module.exports = {
  docs: [
    'intro',
    { type: 'category', label: 'Reference', items: ['webhooks', 'events', 'errors'] },
  ],
};
```

#### Mintlify

```mdx
---
title: "Webhooks"
description: "Subscribe to events from your account in real time."
icon: "bell"
---

<Steps>
  <Step title="Create an endpoint">…</Step>
  <Step title="Verify the signing secret">…</Step>
</Steps>
```

`mint.json` `navigation`:

```json
"navigation": [
  { "group": "Reference", "pages": ["webhooks", "events", "errors"] }
]
```

#### Nextra

```mdx
---
title: Webhooks
---

import { Callout, Steps } from 'nextra/components';

<Callout type="info">Available on Pro plans and above.</Callout>

<Steps>
### Create an endpoint
### Verify the signing secret
</Steps>
```

`_meta.json`:

```json
{
  "webhooks": "Webhooks",
  "events": "Events",
  "errors": "Errors"
}
```

#### Starlight

```md
---
title: Webhooks
description: Subscribe to events from your account in real time.
---

import { Aside, Steps } from '@astrojs/starlight/components';

<Aside type="tip">Available on Pro plans and above.</Aside>

<Steps>
1. Create an endpoint.
2. Verify the signing secret.
</Steps>
```

`astro.config.mjs` sidebar entry added under the relevant group.

#### MkDocs (Material)

```md
# Webhooks

!!! info
    Available on Pro plans and above.

1. Create an endpoint.
2. Verify the signing secret.
```

`mkdocs.yml`:

```yaml
nav:
  - Reference:
    - Webhooks: reference/webhooks.md
```

### Code snippets

Every code snippet must:

- Use a real example from the codebase or a minimal-but-runnable construction.
- Include a language tag.
- Be short enough to read in one screen (≤30 lines preferred). Long examples get a short snippet inline plus a link to the full file.
- Be tested via "does this compile/run" sanity check when feasible (Phase 6 covers this for product flows; Phase 5 only does syntax-level checks).

---

## Phase 6 — Visual asset capture (optional, consent-gated)

This phase **only runs** if the user opted in during Phase 1 *or* explicitly requested visuals during Phase 4.

### Consent flow

Before any code execution:

1. Show the user the exact commands the skill plans to run (install, build, dev server start, browser automation).
2. List the ports it will bind, the env vars it will read, and the test data it will use.
3. Ask for explicit go-ahead. Default to "no."
4. If the user approves, persist the consent decision (and exact command set) to `.docs-forge/consent.json` with timestamp.

If the project requires real credentials (a `.env` with secrets) or external services, **stop and ask** before proceeding. Offer a "demo mode" path: spin up with mocked dependencies if the project supports it; otherwise skip visuals for that page.

### Screenshots

Default tooling: Playwright (Chromium). Fallback: Puppeteer.

Workflow per screenshot:

1. Start the dev server with the recorded command.
2. Wait for readiness (poll the URL with a timeout; respect `wait-on`-style patterns).
3. Navigate to the target route.
4. If the route requires auth, use a seeded test account from `.docs-forge/test-fixtures.json` (created with the user's input or by following a "create test account" flow they document).
5. Capture full-page or viewport screenshot at standard widths: 1440 (desktop), 768 (tablet), 390 (mobile).
6. Annotate if needed (numbered callouts) using a script in `scripts/annotate.mjs`.
7. Save to `media/screenshots/<page-slug>/<step>-<width>.png`.
8. Embed in the relevant docs page using the framework's image syntax.

Tear down the server after capture.

### Videos via Remotion

If the user has the `remotion` skill (or Remotion installed) and asked for videos:

1. Generate a Remotion composition spec from the how-to steps: each step becomes a scene with screenshot + caption + voiceover-ready text.
2. Hand off to the Remotion skill for actual rendering. Pass:
   - the screenshot sequence,
   - per-scene durations,
   - caption text,
   - target resolution and FPS.
3. Save outputs to `media/videos/<page-slug>.mp4` and embed in the docs page.

If Remotion is not available, fall back to an animated GIF via `ffmpeg` from the screenshot sequence — explicitly note the fallback to the user.

### Annotation conventions

- Numbered red circles, no thick borders, anchored to the relevant UI element.
- Captions in plain prose under the image, not embedded in the image.
- Alt text generated from the caption for accessibility.

---

## Phase 7 — Assembly and validation

### Navigation

Generate the framework's nav config from the page set:

- Order pages by the structure declared in Phase 1 (Quick start → Concepts → How-to → Reference, or similar).
- Group by folder where the framework supports it (`meta.json`, `_meta.json`, `sidebars.js`, `mkdocs.yml`).
- Verify every page is reachable from the top nav.

### Link checking

- Resolve all internal links against the generated file tree.
- Resolve external links via HEAD requests (skip if offline or not allowed).
- Flag broken links in `.docs-forge/link-report.md`.

### Completeness review

For every page, confirm:

- It cites at least one KB entry or one user answer.
- It has a description and title.
- Code snippets have language tags.
- Required sections for its page type are present (e.g., a how-to has steps; a reference page has parameters).

Any failures go into `.docs-forge/completeness-report.md`. The skill surfaces this report to the user as the final deliverable summary.

### Final summary to the user

End with a short, structured report:

```
Generated: 27 pages across 4 sections
Framework: Fumadocs
Open gaps: 3 (see .docs-forge/open-questions.md)
Skipped visuals: 2 (auth-gated routes — credentials required)
Broken links: 0
Suggested next steps:
  1. Answer the 3 open questions to unblock the "Webhooks" how-to.
  2. Provide test credentials to capture the missing screenshots.
  3. Run `<framework dev command>` to preview locally.
```

---

## Companion files (recommended skill structure)

A full installation of this skill should sit in a folder like:

```
docs-forge/
├── SKILL.md                          # this file
├── references/
│   ├── adapters/
│   │   ├── fumadocs.md
│   │   ├── docusaurus.md
│   │   ├── mintlify.md
│   │   ├── nextra.md
│   │   ├── starlight.md
│   │   └── mkdocs-material.md
│   ├── page-templates/
│   │   ├── how-to.md
│   │   ├── tutorial.md
│   │   ├── concept.md
│   │   ├── api-reference.md
│   │   ├── runbook.md
│   │   └── faq.md
│   └── question-banks/
│       ├── audience.md
│       ├── naming.md
│       ├── use-cases.md
│       └── visuals.md
├── scripts/
│   ├── ingest.mjs                    # walks the codebase, writes kb/
│   ├── annotate.mjs                  # screenshot annotation
│   ├── screenshot.mjs                # Playwright capture
│   ├── linkcheck.mjs                 # link validator
│   └── completeness.mjs              # final review check
└── prompts/
    ├── kb-section.md                 # template for each kb/*.md file
    ├── page-from-kb.md               # generation prompt per page type
    └── gap-analysis.md               # turns kb into open-questions.md
```

The reference files are loaded **on demand** during the relevant phase, not upfront.

---

## Anti-patterns

Things this skill must not do:

- **Invent API surface.** If a function is not in the codebase, it does not go in the docs. Every reference page entry traces back to a source citation.
- **Ask redundant questions.** If `package.json` says `"name": "acme-cli"`, do not ask the project's name.
- **Generate without elicitation.** Skipping Phase 4 because "the code is clear enough" produces docs that read like dumped JSDoc. Always run gap analysis even if it's short.
- **Run code without consent.** Phase 6 is opt-in, no exceptions, and consent is per-session — do not assume continued consent from a previous session.
- **Mix frameworks.** A single docs site uses one framework. If a monorepo needs different frameworks per package, build separate sites.
- **Touch existing user docs silently.** When migrating, show a diff and ask before overwriting.
- **Skip the citations layer.** Every claim about behaviour cites a file path and line range in the KB. This is what makes the docs verifiable instead of plausibly-shaped.
- **Pretend to have screenshots.** If visuals weren't captured, do not embed a placeholder — leave a clearly-labelled gap and surface it in the final report.
- **Use frontmatter the framework does not understand.** Frameworks differ on key names; respect the adapter.

---

## Quick-start examples

### Example 1: Greenfield Fumadocs for a TypeScript SDK

User: *"I have a TS client SDK in `./sdk/`. Set up Fumadocs and generate full developer docs."*

Skill flow:

1. Phase 1 confirms: engineering docs, external developers, Fumadocs, output `content/docs/`, no existing docs.
2. Phase 2 walks `sdk/`, builds KB with citations to `sdk/src/index.ts`, `sdk/src/client.ts`, `sdk/src/resources/*`.
3. Phase 3 produces 12 open questions: 4 blocking (which exports are public, deprecation status of two functions, naming for "Org" vs "Workspace", supported Node versions), 5 important, 3 optional.
4. Phase 4 elicits answers in two batches.
5. Phase 5 generates: Quick start, Authentication, 8 resource reference pages, Errors, Pagination, Webhooks, Migration from v1.
6. Phase 6 skipped (engineering-only set, user declined visuals).
7. Phase 7 assembles `meta.json` files, validates links, reports zero gaps.

### Example 2: Product how-to with video for a SaaS dashboard

User: *"Write a how-to for setting up SSO in our app. Include a video walkthrough."*

Skill flow:

1. Phase 1 confirms: product docs, end users (technical), framework already detected as Mintlify, output `docs/how-to/`.
2. Phase 2 reads SSO-related code under `app/settings/sso/`, identity provider integrations, and existing auth docs.
3. Phase 3 surfaces: which IdPs are officially supported? what plan tier is required? is there a sandbox? naming for user roles?
4. Phase 4 elicits answers.
5. Phase 5 generates a single Mintlify page with `<Steps>`, code-style XML configs, and `<AccordionGroup>` for per-IdP variants.
6. Phase 6 — consent obtained — runs the dev server in demo mode, captures 7 screenshots across the SSO setup flow, hands the sequence to the Remotion skill which renders a 90-second walkthrough at 1080p. Embeds video and screenshots in the page.
7. Phase 7 confirms link integrity, ships.

### Example 3: Resuming a previous run

User: *"Continue where we left off on the docs."*

Skill flow:

1. Detects `.docs-forge/` exists. Reads `scope.json` and the latest phase marker.
2. Reports: "I have a knowledge base from 2 days ago and 3 unanswered blocking questions. Should I (a) re-ingest in case code has changed, (b) re-run gap analysis only, or (c) jump straight to answering the open questions?"
3. Proceeds based on the user's choice; updates the KB and answers as needed.

---

*End of SKILL.md.*
