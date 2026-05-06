# Docs Forge for Claude Code

Claude Code skills use a directory with `SKILL.md` as the entrypoint. Docs Forge already ships that canonical skill at:

```text
plugins/docs-forge/skills/docs-forge/SKILL.md
```

## Personal Install

Use this when you want Docs Forge available in every Claude Code project:

```bash
git clone --branch v0.2.0 --depth 1 https://github.com/adhit-r/docs-forge.git
mkdir -p ~/.claude/skills
cp -R docs-forge/plugins/docs-forge/skills/docs-forge ~/.claude/skills/docs-forge
```

Restart Claude Code, then invoke the skill with:

```text
/docs-forge Document this codebase.
```

Natural prompts also work:

```text
Create API reference docs from this repo.
Set up a docs site for this project.
Generate product walkthrough docs for this app.
```

## Project Install

Use this when the skill should travel with a specific repo:

```bash
mkdir -p .claude/skills
cp -R /path/to/docs-forge/plugins/docs-forge/skills/docs-forge .claude/skills/docs-forge
git add .claude/skills/docs-forge
```

## Update

Pull the latest Docs Forge repository and repeat the copy step. The canonical skill is intentionally not duplicated in this adapter directory, so Claude Code and Codex stay aligned.
