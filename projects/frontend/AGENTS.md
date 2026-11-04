# AGENTS.md: Frontend App (React)

> Instructions for AI coding agents (Claude Code, Codex, Cursor, Copilot, Gemini CLI, Windsurf and others). Humans: see `README.md`.

**Stack:** React + Vite + Tailwind CSS + Motion, with Zustand only when shared state is needed. TypeScript · pnpm. A client-side app (SPA) with no backend of its own; it can call external APIs.

## Read first

1. `PROJECT.md`: what we are building. If it still contains `TODO` placeholders, ask the user for the brief before building features, or fill it in from their request and confirm it with them.
2. If `package.json` is missing, the project isn't scaffolded yet. Follow `BOOTSTRAP.md` before doing anything else.
3. `ai-rules/workflow.md`: how to work, and the definition of done. **Mandatory.**
4. The rule files for the area you're touching:

   | Task | Read |
   | --- | --- |
   | Any code | `ai-rules/typescript.md`, `ai-rules/security.md` |
   | Components, UI | `ai-rules/react.md` |
   | Styling | `ai-rules/tailwind.md` |
   | Animation | `ai-rules/motion.md` |
   | Pages, routing, data loading | `ai-rules/react-router.md` |
   | Shared client state | `ai-rules/zustand.md` |
   | Tests | `ai-rules/testing.md` |
   | Unsure whether an API exists or changed | `ai-rules/docs-lookup.md` (Context7) |

## Stack (versions verified 2026-11-04)

| Layer | Package | Major version |
| --- | --- | --- |
| Runtime (tooling) | Node.js | 24 LTS or newer |
| Package manager | pnpm | latest |
| Language | TypeScript | 7 |
| UI | `react`, `react-dom` | 19 |
| Build tool | `vite` | 8 |
| Styling | `tailwindcss` + `@tailwindcss/vite` | 4 |
| Animation | `motion` (formerly Framer Motion) | 14 |
| Routing | `react-router` | 8 |
| Client state (only if needed) | `zustand` | 5 |
| Lint / format / test | Oxlint · Prettier · Vitest | latest |

Install packages through the CLI (`pnpm add <pkg>`). If an installed major version is newer than this table, read its migration guide before writing code.

### Zustand: only when it's needed

Zustand is **not** installed at bootstrap. Add it (`pnpm add zustand`) the first time the app has client state shared by distant components: a cart, a session, saved preferences, a multi-step wizard. Until then, use local state, props and URL search params. When you add it, follow `ai-rules/zustand.md` and record the decision in `PROJECT.md`.

### Approved supporting libraries

Use these without asking, when needed: `zustand` (per the rule above), `clsx`, `tailwind-merge`, `zod` (to validate external API responses and forms), `vitest`, `@testing-library/react`, `@testing-library/user-event`, `jsdom`, `prettier`, `prettier-plugin-tailwindcss`, and `@types/*` packages. For anything else, ask first.

**Don't add:** Redux or MobX, styled-components, Emotion, Sass or other CSS-in-JS or preprocessors, UI kits like Bootstrap, MUI or Chakra, Axios (use `fetch`), Moment.js, Jest (use Vitest), `framer-motion` (use `motion`), or `react-router-dom` (gone in v8). Next.js or a backend server don't belong in this template either.

## Structure

```
.
├── AGENTS.md · PROJECT.md · BOOTSTRAP.md · README.md · ai-rules/
├── index.html · vite.config.ts · tsconfig*.json · .prettierrc.json
├── public/                  # static files served as-is (favicon, robots.txt)
└── src/
    ├── main.tsx             # createRoot + <RouterProvider>
    ├── router.tsx           # all route objects
    ├── index.css            # Tailwind entry + @theme design tokens
    ├── components/
    │   ├── ui/              # reusable primitives: button, input, card, dialog…
    │   └── layout/          # root-layout, header, footer, route-error
    ├── features/<feature>/  # components, api.ts, types.ts and an optional store for one domain
    ├── pages/               # one component per route; thin, composes features
    ├── stores/              # global Zustand stores (only once Zustand is added)
    ├── hooks/               # shared hooks
    ├── lib/                 # cn.ts, motion.ts, api-client.ts, utilities
    └── assets/              # images and icons imported from code
```

## Calling external APIs

- Every HTTP call goes through `src/lib/api-client.ts` (create it the first time it's needed). Components never call `fetch` directly.
- Validate third-party responses with Zod before using them. Their shape isn't under our control.
- Load route data in React Router `loader`s, not in `useEffect` (see `ai-rules/react-router.md`).
- API keys in `VITE_*` variables are **public**. Only use keys meant for browsers (publishable or restricted keys). If a secret key is required, stop and tell the user: that needs a backend (the `fullstack-with-database` or `fullstack-without-database` template).
- Declare every `VITE_*` variable in `src/env.d.ts` (the `ImportMetaEnv` interface) and in `.env.example`.

## Commands

| Command | What it does |
| --- | --- |
| `pnpm dev` | Dev server on http://localhost:5173 |
| `pnpm build` | Type check, then production build into `dist/` |
| `pnpm preview` | Serve the production build locally |
| `pnpm typecheck` | TypeScript only |
| `pnpm lint` | Oxlint |
| `pnpm test` | Vitest |
| `pnpm format` | Prettier |

## Non-negotiables

- TypeScript strict mode, no `any`, and external data validated with Zod.
- Tailwind for all styling, with design tokens in `@theme`. Motion imported from `motion/react`, with `MotionConfig reducedMotion="user"` at the root.
- Accessible, responsive (mobile-first) UI that handles loading, empty and error states.
- The smallest state tool that works. Zustand only for shared client state.
- Deployment needs an SPA fallback (every path rewritten to `index.html`).
- Done means typecheck, lint, build and tests all pass, and you exercised the change in the browser (see `ai-rules/workflow.md`).
