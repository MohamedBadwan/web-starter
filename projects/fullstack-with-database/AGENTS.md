# AGENTS.md: Fullstack App with Database

> Instructions for AI coding agents (Claude Code, Codex, Cursor, Copilot, Gemini CLI, Windsurf and others). Humans: see `README.md`.

**Stack:** React + Vite + Tailwind CSS + Zustand + Motion (frontend) · Node.js + Express + MongoDB/Mongoose (backend) · TypeScript everywhere · pnpm workspaces.

## Read first

1. `PROJECT.md`: what we are building. If it still contains `TODO` placeholders, ask the user for the brief before building features, or fill it in from their request and confirm it with them.
2. If `frontend/package.json` or `backend/package.json` is missing, the project isn't scaffolded yet. Follow `BOOTSTRAP.md` before doing anything else.
3. `ai-rules/workflow.md`: how to work, and the definition of done. **Mandatory.**
4. The rule files for the area you're touching:

   | Task | Read |
   | --- | --- |
   | Any code | `ai-rules/typescript.md`, `ai-rules/security.md` |
   | UI, components, styling | `frontend/AGENTS.md`, `ai-rules/react.md`, `ai-rules/tailwind.md`, `ai-rules/motion.md` |
   | Shared client state | `ai-rules/zustand.md` |
   | Pages, routing, data loading | `ai-rules/react-router.md` |
   | API endpoints | `backend/AGENTS.md`, `ai-rules/express.md` |
   | Models and queries | `ai-rules/mongodb.md` |
   | Tests | `ai-rules/testing.md` |
   | Unsure whether an API exists or changed | `ai-rules/docs-lookup.md` (Context7) |

## Stack (versions verified 2026-11-04)

| Layer | Package | Major version |
| --- | --- | --- |
| Runtime | Node.js | 24 LTS or newer |
| Package manager | pnpm | latest |
| Language | TypeScript | 7 |
| UI | `react`, `react-dom` | 19 |
| Build tool | `vite` | 8 |
| Styling | `tailwindcss` + `@tailwindcss/vite` | 4 |
| Animation | `motion` (formerly Framer Motion) | 14 |
| Client state | `zustand` | 5 |
| Routing | `react-router` | 8 |
| HTTP server | `express` | 5 |
| Database | MongoDB + `mongoose` | MongoDB 8 · Mongoose 9 |
| Validation | `zod` | 4 |
| Lint / format / test | Oxlint · Prettier · Vitest | latest |

Install packages through the CLI (`pnpm add <pkg>`) so you get the latest version. If an installed major version is newer than this table, read its migration guide before writing code (see `ai-rules/docs-lookup.md`).

### Approved supporting libraries

Use these without asking, when needed: `clsx`, `tailwind-merge`, `zod`, `cors`, `helmet`, `express-rate-limit`, `vitest`, `supertest`, `@testing-library/react`, `@testing-library/user-event`, `jsdom`, `prettier`, `prettier-plugin-tailwindcss`, and `@types/*` packages. For anything else, ask first.

**Don't add:** Redux or MobX (use Zustand), styled-components, Emotion, Sass or any other CSS-in-JS or preprocessor (use Tailwind), Bootstrap, MUI or Chakra, Axios (use `fetch`), Moment.js, Jest (use Vitest), `framer-motion` (use `motion`), `react-router-dom` (gone in v8), `nodemon`, `ts-node` or `tsx` (Node runs TypeScript natively), `dotenv` (use `node --env-file`), `body-parser` (built into Express).

## Structure

```
.
├── AGENTS.md · PROJECT.md · BOOTSTRAP.md · README.md
├── ai-rules/               # detailed rules per topic
├── package.json            # workspace root: scripts only
├── pnpm-workspace.yaml     # packages: frontend, backend
├── frontend/               # React SPA (Vite). Details in frontend/AGENTS.md
└── backend/                # Express REST API. Details in backend/AGENTS.md
```

## Commands (run from the root)

| Command | What it does |
| --- | --- |
| `pnpm install` | Install everything |
| `pnpm dev` | Frontend on http://localhost:5173 and API on http://localhost:4000, in parallel |
| `pnpm typecheck` | TypeScript in both packages |
| `pnpm lint` | Oxlint in both packages |
| `pnpm test` | Vitest in both packages |
| `pnpm build` | Production build of the frontend |
| `pnpm format` | Format everything with Prettier |
| `pnpm --filter frontend add <pkg>` | Add a dependency to one package (`--filter backend` for the API) |

## How the frontend and backend talk

- A REST API under `/api/*`, JSON in and JSON out.
- Success responses are `{ "data": … }`, plus `"meta"` for paginated lists. Errors are `{ "error": { "message": string, "details"?: unknown } }`.
- In development, the Vite dev server proxies `/api` to `http://localhost:4000`. The frontend always calls relative URLs (`/api/todos`), so there are no CORS issues in development.
- In production, set `VITE_API_URL` (for example `https://api.example.com/api`) at build time. `frontend/src/lib/api-client.ts` uses it, falling back to `/api`.
- The backend's Zod schemas and Mongoose models are the source of truth for the API contract. Mirror the request and response types in `frontend/src/types/api.ts`, and change both sides in the same task.

## Non-negotiables

- TypeScript strict mode, no `any`, and Zod validation at every boundary.
- Frontend: Tailwind for all styling, Motion imported from `motion/react`, Zustand only for shared client state, and accessible UI that handles loading, empty and error states.
- Backend: thin controllers, logic in services, `async` handlers (Express 5 forwards their errors), one central error handler, and Mongoose models with inferred types.
- Never commit secrets. Each package's `.env.example` documents every variable.
- Done means typecheck, lint, build and tests all pass, and you exercised the change (see `ai-rules/workflow.md`).
