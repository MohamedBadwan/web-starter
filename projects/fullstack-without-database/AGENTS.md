<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AGENTS.md: Fullstack App without a Database (Next.js)

> Instructions for AI coding agents (Claude Code, Codex, Cursor, Copilot, Gemini CLI, Windsurf and others). Humans: see `README.md`.
> The block above is managed by Next.js. Keep it, and write project rules below it.

**Stack:** Next.js (App Router, Cache Components) + Tailwind CSS + Motion · TypeScript · pnpm. The backend is the Next.js server itself (Server Components, Server Actions, Route Handlers), with **no database**.

## Read first

1. `PROJECT.md`: what we are building. If it still contains `TODO` placeholders, ask the user for the brief before building features, or fill it in from their request and confirm it with them.
2. If `package.json` is missing, the project isn't scaffolded yet. Follow `BOOTSTRAP.md` before doing anything else.
3. `ai-rules/workflow.md`: how to work, and the definition of done. **Mandatory.**
4. The rule files for the area you're touching:

   | Task | Read |
   | --- | --- |
   | Any code | `ai-rules/typescript.md`, `ai-rules/security.md` |
   | Routes, data, Server Actions, caching | `ai-rules/nextjs.md` and the bundled docs in `node_modules/next/dist/docs/` |
   | UI, components | `ai-rules/react.md` |
   | Styling | `ai-rules/tailwind.md` |
   | Animation | `ai-rules/motion.md` |
   | Tests | `ai-rules/testing.md` |
   | Unsure whether an API exists or changed | `ai-rules/docs-lookup.md` (Context7) |

## Stack (versions verified 2026-11-04)

| Layer | Package | Major version |
| --- | --- | --- |
| Runtime | Node.js | 24 LTS or newer |
| Package manager | pnpm | latest |
| Framework | `next` (Turbopack, App Router, Cache Components) | 16 |
| UI | `react`, `react-dom` | 19 |
| Language | TypeScript | the version `create-next-app` installs |
| Styling | `tailwindcss` (via `@tailwindcss/turbopack`) | 4 |
| Animation | `motion` (formerly Framer Motion) | 14 |
| Validation | `zod` | 4 |
| Lint / format / test | ESLint (`eslint-config-next`) · Prettier · Vitest | latest |

Install packages through the CLI (`pnpm add <pkg>`). If an installed major version is newer than this table, read its migration guide before writing code.

### Approved supporting libraries

Use these without asking, when needed: `clsx`, `tailwind-merge`, `zod`, `server-only`, `vitest`, `@testing-library/react`, `@testing-library/user-event`, `jsdom`, `prettier`, `prettier-plugin-tailwindcss`, and `@types/*` packages. For anything else, ask first.

**Don't add:** a database, ORM or database driver (Mongoose, Prisma, Drizzle, `pg`, SQLite… see below), Zustand, Redux or other global state libraries (use Server Components, URL state and React state; ask if you truly need a store), styled-components, Emotion, Sass or other CSS-in-JS or preprocessors, UI kits like MUI or Chakra, Axios (use `fetch`), Jest (use Vitest), or `framer-motion` (use `motion`).

## "Without a database" means

- Data comes from **external APIs** (fetched on the server, cached with `'use cache'`), **static content** in `src/content/` (JSON, Markdown or MDX committed to the repo), or **third-party services** called from Server Actions or Route Handlers (email, payments, a headless CMS, forms).
- Don't write to the local filesystem at runtime. Serverless hosts discard those writes.
- If a feature truly needs persistence (user accounts, saving user content), **stop and tell the user**. The options are a hosted service (a CMS, Supabase, Firebase…) or switching to the `fullstack-with-database` template. Don't quietly add a database.

## Structure

```
.
├── AGENTS.md · PROJECT.md · BOOTSTRAP.md · README.md · ai-rules/
├── next.config.ts · eslint.config.mjs · tsconfig.json · .prettierrc.json
├── public/                     # static files served as-is
└── src/
    ├── proxy.ts                # optional: request interception (formerly middleware.ts)
    ├── app/                    # routes only: page, layout, loading, error, not-found, route.ts
    │   ├── layout.tsx · page.tsx · globals.css · error.tsx · not-found.tsx
    │   ├── (marketing)/…       # route groups organize routes without changing URLs
    │   └── api/<name>/route.ts # Route Handlers: webhooks, public JSON endpoints
    ├── components/
    │   ├── ui/                 # reusable primitives (Server Components unless interactive)
    │   ├── layout/             # header, footer, nav
    │   └── providers.tsx       # 'use client' providers (MotionConfig…)
    ├── features/<feature>/
    │   ├── components/
    │   ├── queries.ts          # cached server reads ('use cache')
    │   ├── actions.ts          # Server Actions ('use server')
    │   └── schemas.ts          # Zod schemas + inferred types
    ├── content/                # static content (JSON / MD / MDX)
    └── lib/                    # cn.ts, motion.ts, env.ts (server-only), utilities
```

- Keep `src/app/` thin. Pages compose components from `features/` and `components/`.
- Server Components are the default. Mark a component `'use client'` only when it needs interactivity, browser APIs, Motion hooks or `AnimatePresence`.

## Commands

| Command | What it does |
| --- | --- |
| `pnpm dev` | Dev server on http://localhost:3000 (Turbopack) |
| `pnpm build` | Production build. It also catches Cache Components errors (runtime data outside `<Suspense>`) |
| `pnpm start` | Serve the production build |
| `pnpm typecheck` | Generate route types, then run TypeScript |
| `pnpm lint` | ESLint |
| `pnpm test` | Vitest |
| `pnpm format` | Prettier |

## Non-negotiables

- Read the bundled Next.js docs before using any Next.js API you are not certain about.
- `await` the request APIs (`params`, `searchParams`, `cookies()`, `headers()`).
- Cache explicitly with `'use cache'`, `cacheLife` and `cacheTag`, and keep runtime data inside `<Suspense>`.
- Mutations go through Server Actions that validate with Zod and check authorization themselves.
- Secrets stay on the server (`src/lib/env.ts` with `server-only`). Never put them in `NEXT_PUBLIC_*` variables.
- Tailwind for all styling, Motion imported from `motion/react` (or `motion/react-client` in Server Components), and accessible UI that handles loading, empty and error states.
- Done means typecheck, lint, build and tests all pass, and you exercised the change (see `ai-rules/workflow.md`).
