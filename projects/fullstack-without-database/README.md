# Fullstack App without a Database (Next.js): AI Project Template

Next.js (App Router, Cache Components) + Tailwind CSS + Motion, in TypeScript. The server side is Next.js itself (Server Components, Server Actions, Route Handlers), with no database. A good fit for landing pages, marketing sites, portfolios, blogs, and apps built on external APIs.

This folder holds **no app code yet**. It contains instructions that any AI coding agent can follow to scaffold and build the app with current library versions and consistent conventions.

## How to use

1. Copy this folder to wherever your new project should live, and rename it.
2. Describe your project in `PROJECT.md`, or skip that and let the AI interview you.
3. Open the folder in your AI tool and say:

   > Read AGENTS.md and bootstrap the project.

4. Then ask for features: "Build the pricing page from PROJECT.md."

## What each file is for

| File | Purpose |
| --- | --- |
| `AGENTS.md` | Main instructions: stack, structure, commands, rules. It starts with a block that Next.js manages itself |
| `CLAUDE.md`, `GEMINI.md` | Point Claude Code and Gemini CLI to `AGENTS.md` |
| `.github/copilot-instructions.md` | Points GitHub Copilot to `AGENTS.md` |
| `BOOTSTRAP.md` | One-time scaffolding steps, including starter code |
| `PROJECT.md` | Your project brief: what to build |
| `ai-rules/` | Detailed rules per topic (Next.js, React, Tailwind, Motion, TypeScript…) |

## Requirements

- Node.js 24 or newer
- pnpm (`corepack enable pnpm`)
- Recommended: the [Context7](https://context7.com) MCP server in your AI tool, so it reads up-to-date docs
