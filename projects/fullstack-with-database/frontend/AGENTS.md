# AGENTS.md: frontend/

The React single-page app, built with Vite. Read `../AGENTS.md` first; this file adds the frontend specifics.

Rules: `../ai-rules/react.md`, `../ai-rules/tailwind.md`, `../ai-rules/motion.md`, `../ai-rules/zustand.md`, `../ai-rules/react-router.md`.

## Structure

```
frontend/src/
├── main.tsx                 # createRoot + <RouterProvider>
├── router.tsx               # all route objects
├── index.css                # Tailwind entry + @theme design tokens
├── env.d.ts                 # types for import.meta.env
├── components/
│   ├── ui/                  # reusable primitives: button, input, card, dialog…
│   └── layout/              # root-layout, header, footer, route-error
├── features/<feature>/      # everything for one domain
│   ├── components/          # components used only by this feature
│   ├── api.ts               # backend calls for this feature (uses lib/api-client)
│   ├── <feature>-store.ts   # optional Zustand store for this feature
│   └── types.ts
├── pages/                   # one component per route; thin, composes features
├── stores/                  # global Zustand stores (session, UI preferences…)
├── hooks/                   # shared hooks
├── lib/                     # api-client.ts, cn.ts, motion.ts, small utilities
├── types/api.ts             # API contract types mirrored from the backend
└── assets/                  # images and icons imported from code
```

- A new domain (products, orders, auth…) gets a folder in `features/`. Don't scatter its files across the global folders.
- Components in `components/ui/` are generic, styled with Tailwind, accept `className` (merged with `cn()`), and contain no business logic.
- Pages wire things together: they read loader data, compose feature components, and handle layout.

## Data

- Every backend call goes through `src/lib/api-client.ts`. Never call `fetch` directly from components.
- Each feature exposes typed functions in `features/<feature>/api.ts`:

  ```ts
  import { api } from '@/lib/api-client'
  import type { Todo, CreateTodoInput } from '@/types/api'

  export const todosApi = {
    list: (page = 1) => api<Todo[]>(`/todos?page=${page}`),
    create: (input: CreateTodoInput) =>
      api<Todo>('/todos', { method: 'POST', body: JSON.stringify(input) }),
  }
  ```

- Route data is loaded in React Router `loader`s, and mutations go through `action`s or `useFetcher` (see `../ai-rules/react-router.md`).
- Handle `ApiError` from the client: show `error.message` to the user, and map `error.details` to form field errors on a `400`.

## Environment

- `.env.example` lists every `VITE_*` variable. They are public, so never put secrets in them.
- `VITE_API_URL`: leave it empty in development (the Vite proxy handles `/api`); in production set it to the deployed API URL.

## Scripts (run inside `frontend/`, or from the root with `pnpm --filter frontend <script>`)

`dev` · `build` · `preview` · `typecheck` · `lint` · `test`
