# Fullstack App with Database: AI Project Template

React + Vite + Tailwind CSS + Zustand + Motion on the frontend, and Node.js + Express + MongoDB on the backend. TypeScript everywhere, in a pnpm monorepo.

This folder holds **no app code yet**. It contains instructions that any AI coding agent can follow to scaffold and build the app with current library versions and consistent conventions.

## How to use

1. Copy this folder to wherever your new project should live, and rename it.
2. Describe your project in `PROJECT.md`, or skip that and let the AI interview you.
3. Open the folder in your AI tool and say:

   > Read AGENTS.md and bootstrap the project.

4. Then ask for features: "Build the recipes feature from PROJECT.md."

## What each file is for

| File | Purpose |
| --- | --- |
| `AGENTS.md` | Main instructions: stack, structure, commands, rules. Read automatically by Codex, Cursor, Copilot, Windsurf and others |
| `CLAUDE.md`, `GEMINI.md` | Point Claude Code and Gemini CLI to `AGENTS.md` |
| `.github/copilot-instructions.md` | Points GitHub Copilot to `AGENTS.md` |
| `BOOTSTRAP.md` | One-time scaffolding steps, including starter code |
| `PROJECT.md` | Your project brief: what to build |
| `ai-rules/` | Detailed rules per topic (React, Tailwind, Motion, Zustand, Express, MongoDB…) |
| `frontend/AGENTS.md`, `backend/AGENTS.md` | Extra instructions for each half of the app |

## Requirements

- Node.js 24 or newer
- pnpm (`corepack enable pnpm`)
- MongoDB: local via Docker (`docker run -d -p 27017:27017 mongo:8`) or MongoDB Atlas
- Recommended: the [Context7](https://context7.com) MCP server in your AI tool, so it reads up-to-date docs
