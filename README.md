# web-starter

**AI-ready project templates.** Each template is a folder of plain Markdown instructions (stack, structure, commands, rules, and first-run setup) that any AI coding agent can follow to build a web project the same way every time, with current library versions.

Copy a template, describe your project, and tell your AI: *"Read AGENTS.md and bootstrap the project."*

## Templates

| Template | Use it for | Stack |
| --- | --- | --- |
| [`fullstack-with-database`](projects/fullstack-with-database) | Apps that store their own data: accounts, CRUD, dashboards | **Frontend:** React, Vite, Tailwind CSS, Zustand, Motion · **Backend:** Node.js, Express, MongoDB (Mongoose) · pnpm workspaces |
| [`fullstack-without-database`](projects/fullstack-without-database) | Landing pages, marketing sites, blogs, portfolios, apps over external APIs | Next.js (App Router, Cache Components), Tailwind CSS, Motion |
| [`frontend`](projects/frontend) | Client-only apps: landing pages, portfolios, tools, games | React, Vite, Tailwind CSS, Motion, plus Zustand when needed |

All templates use TypeScript, pnpm, Zod, Prettier and Vitest. Versions were verified on **2026-11-04**: React 19, Vite 8, Next.js 16, Tailwind CSS 4, Motion 14, Zustand 5, React Router 8, Express 5, Mongoose 9, Zod 4, TypeScript 7, Node.js 24.

## Quick start

```bash
git clone git@github.com:MohamedABBJ/web-starter.git
cd web-starter
node scripts/new-project.mjs frontend ../my-new-app
```

Or copy a single template without cloning (public repos only):

```bash
npx degit MohamedABBJ/web-starter/projects/frontend my-new-app
```

Then:

1. Open `my-new-app/PROJECT.md` and describe what you want, or skip it and let the AI interview you.
2. Open the folder in your AI tool and say: **"Read AGENTS.md and bootstrap the project."**
3. Ask for features one at a time: *"Build the contact form from PROJECT.md."*

## What's inside a template

```
my-new-app/
├── AGENTS.md                        # main instructions: stack, structure, commands, non-negotiables
├── BOOTSTRAP.md                     # one-time setup: exact scaffold commands + starter code
├── PROJECT.md                       # your brief: what to build (features, pages, data, design)
├── ai-rules/                        # detailed rules per topic (react.md, tailwind.md, motion.md…)
├── CLAUDE.md · GEMINI.md            # point Claude Code / Gemini CLI to AGENTS.md
└── .github/copilot-instructions.md  # points GitHub Copilot to AGENTS.md
```

The templates don't ship app code. Scaffolding runs the official CLIs (`create-vite`, `create-next-app`) at their latest versions, so nothing goes stale. Every `BOOTSTRAP.md` was tested end to end: typecheck, lint, tests and build pass, and the fullstack template was run against a real MongoDB.

## Supported AI tools

| Tool | Reads |
| --- | --- |
| OpenAI Codex, Cursor, Windsurf, GitHub Copilot (agent mode), Zed, Aider, Jules and other tools that support `AGENTS.md` | `AGENTS.md` |
| Claude Code | `CLAUDE.md` → imports `AGENTS.md` |
| Gemini CLI | `GEMINI.md` → imports `AGENTS.md` |
| GitHub Copilot (chat) | `.github/copilot-instructions.md` → points to `AGENTS.md` |
| ChatGPT, Claude.ai or any chat UI | Upload or paste `AGENTS.md`, `PROJECT.md` and the relevant `ai-rules/` files |

## Up-to-date docs with Context7

Every template's rules tell the AI to check current documentation before using an API it isn't sure about, using version-matched docs bundled with Next.js, the [Context7](https://context7.com) MCP server, or Context7's HTTP API. Installing the MCP server makes this automatic:

```bash
claude mcp add --transport http context7 https://mcp.context7.com/mcp
```

Other tools: add an MCP server with the URL `https://mcp.context7.com/mcp`.

## Maintaining the rules

- `rules/` holds the source of truth, one file per topic.
- `node scripts/sync-rules.mjs` copies them into each template's `ai-rules/` folder. CI checks that the copies are up to date.
- Which rules each template gets is set in `scripts/sync-rules.mjs`.

| Rule file | Covers |
| --- | --- |
| `workflow.md` | How the AI works: read first, scope, package manager, definition of done, git |
| `docs-lookup.md` | Getting current docs (bundled docs, Context7 MCP/HTTP), library IDs |
| `typescript.md` | Strictness, erasable syntax, imports, naming |
| `security.md` | Secrets, validation, auth, CORS, headers, uploads |
| `testing.md` | Vitest, supertest, Testing Library, what to test |
| `react.md` | React 19 components, state, effects, forms, accessibility, UI states |
| `tailwind.md` | Tailwind v4 CSS-first config, tokens, `cn()`, v3 → v4 renames |
| `motion.md` | Motion (`motion/react`), reduced motion, performance, Next.js usage |
| `zustand.md` | When to use it, store shape, selectors, `useShallow`, persist |
| `react-router.md` | v8 data mode, loaders and actions, lazy routes, errors |
| `nextjs.md` | Next.js 16: async request APIs, Cache Components, Server Actions, `proxy.ts` |
| `express.md` | Express 5 on Node 24 TypeScript, layered modules, API conventions |
| `mongodb.md` | Mongoose 9 models, inferred types, queries, indexes |
