# BOOTSTRAP.md: First-Time Setup

Follow these steps **once**, when `frontend/package.json` or `backend/package.json` doesn't exist yet. Skip any step that's already done. When you finish, tick "Scaffolded" in `PROJECT.md`.

**Requirements:** Node.js 24+ and pnpm (`corepack enable pnpm`, or `npm i -g pnpm`). Check with `node -v` and `pnpm -v`.

Replace `<project-name>` with the project's name in kebab-case (from `PROJECT.md`).

---

## 1. Workspace root

Create `pnpm-workspace.yaml`:

```yaml
packages:
  - frontend
  - backend
```

Create `package.json`:

```json
{
  "name": "<project-name>",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "pnpm -r --parallel run dev",
    "build": "pnpm -r run build",
    "typecheck": "pnpm -r run typecheck",
    "lint": "pnpm -r run lint",
    "test": "pnpm -r run test",
    "format": "prettier --write .",
    "format:check": "prettier --check ."
  }
}
```

Create `.gitignore`:

```gitignore
node_modules
dist
coverage
*.log
.DS_Store
.env
.env.*
!.env.example
*.tsbuildinfo
```

Run `git init` if this isn't a git repository yet.

---

## 2. Frontend

Scaffold Vite into a temporary folder (the CLI won't write into a non-empty folder), then move the files into `frontend/`:

```bash
pnpm create vite@latest scaffold-tmp --template react-ts --no-interactive
rm -f scaffold-tmp/README.md
cp -R scaffold-tmp/. frontend/
rm -rf scaffold-tmp
```

> With npm: `npm create vite@latest scaffold-tmp -- --template react-ts --no-interactive` (npm needs the `--`).

In `frontend/package.json`, set `"name": "frontend"` and add these scripts next to the generated ones:

```json
"typecheck": "tsc -b",
"test": "vitest run --passWithNoTests"
```

Install the stack (inside `frontend/`):

```bash
cd frontend
pnpm add react-router zustand motion clsx tailwind-merge tailwindcss @tailwindcss/vite
pnpm add -D vitest
cd ..
```

Remove the demo files: `frontend/src/App.tsx`, `frontend/src/App.css`, everything in `frontend/src/assets/`, and `frontend/public/icons.svg`. Set `<title>` in `frontend/index.html` to the project name.

In `frontend/tsconfig.app.json`, add the path alias inside `compilerOptions`:

```json
"paths": { "@/*": ["./src/*"] }
```

Create or replace these files:

**`frontend/vite.config.ts`**

```ts
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { tsconfigPaths: true },
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://localhost:4000', changeOrigin: true },
    },
  },
})
```

**`frontend/src/index.css`**

```css
@import "tailwindcss";

@theme {
  --color-brand-50: oklch(0.97 0.02 260);
  --color-brand-500: oklch(0.62 0.19 260);
  --color-brand-600: oklch(0.55 0.2 260);
}
```

**`frontend/src/env.d.ts`**

```ts
interface ImportMetaEnv {
  readonly VITE_API_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

**`frontend/src/lib/cn.ts`**

```ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

**`frontend/src/lib/api-client.ts`**

```ts
const BASE_URL = import.meta.env.VITE_API_URL || '/api'

export class ApiError extends Error {
  readonly status: number
  readonly details?: unknown

  constructor(status: number, message: string, details?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

type ErrorBody = { error?: { message?: string; details?: unknown } }

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers)
  if (init.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json')

  const res = await fetch(`${BASE_URL}${path}`, { ...init, headers, credentials: 'include' })
  if (res.status === 204) return undefined as T

  const body: unknown = await res.json().catch(() => null)
  if (!res.ok) {
    const error = (body as ErrorBody | null)?.error
    throw new ApiError(res.status, error?.message ?? res.statusText, error?.details)
  }
  return (body as { data: T }).data
}
```

**`frontend/src/lib/motion.ts`**

```ts
import type { Transition, Variants } from 'motion/react'

export const springSnappy: Transition = { type: 'spring', stiffness: 400, damping: 30 }

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
}

export const staggerList: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
}
```

**`frontend/src/types/api.ts`**

```ts
// Mirrors the backend contract. Update together with backend schemas/models.
export type HealthStatus = { status: 'ok' }
```

**`frontend/src/components/layout/root-layout.tsx`**

```tsx
import { MotionConfig } from 'motion/react'
import { Outlet } from 'react-router'

export function RootLayout() {
  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-dvh bg-white text-zinc-900 antialiased dark:bg-zinc-950 dark:text-zinc-100">
        <main className="mx-auto max-w-5xl px-4 py-12">
          <Outlet />
        </main>
      </div>
    </MotionConfig>
  )
}
```

**`frontend/src/components/layout/route-error.tsx`**

```tsx
import { isRouteErrorResponse, Link, useRouteError } from 'react-router'

export function RouteError() {
  const error = useRouteError()
  const title = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : 'Something went wrong'

  return (
    <div role="alert" className="mx-auto max-w-md px-4 py-24 text-center">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        Please try again, or go back to the home page.
      </p>
      <Link
        to="/"
        className="mt-6 inline-block rounded-lg bg-brand-500 px-4 py-2 text-white hover:bg-brand-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
      >
        Go home
      </Link>
    </div>
  )
}
```

**`frontend/src/features/health/api.ts`**

```ts
import { api } from '@/lib/api-client'
import type { HealthStatus } from '@/types/api'

export const healthApi = {
  get: () => api<HealthStatus>('/health'),
}

export async function homeLoader() {
  const health = await healthApi.get().catch(() => null)
  return { apiStatus: health?.status ?? 'unreachable' }
}
```

**`frontend/src/pages/home-page.tsx`**

```tsx
import { motion } from 'motion/react'
import { useLoaderData } from 'react-router'
import type { homeLoader } from '@/features/health/api'
import { fadeInUp } from '@/lib/motion'

export function HomePage() {
  const { apiStatus } = useLoaderData<typeof homeLoader>()

  return (
    <motion.section initial="hidden" animate="visible" variants={fadeInUp}>
      <h1 className="text-4xl font-bold tracking-tight">Project name</h1>
      <p className="mt-3 text-zinc-600 dark:text-zinc-400">
        API status: <span className="font-medium text-zinc-900 dark:text-zinc-100">{apiStatus}</span>
      </p>
    </motion.section>
  )
}
```

**`frontend/src/pages/not-found-page.tsx`**

```tsx
import { Link } from 'react-router'

export function NotFoundPage() {
  return (
    <section className="py-24 text-center">
      <h1 className="text-3xl font-semibold">Page not found</h1>
      <Link to="/" className="mt-4 inline-block text-brand-600 underline-offset-4 hover:underline">
        Go home
      </Link>
    </section>
  )
}
```

**`frontend/src/router.tsx`**

```tsx
import { createBrowserRouter } from 'react-router'
import { RootLayout } from '@/components/layout/root-layout'
import { RouteError } from '@/components/layout/route-error'
import { homeLoader } from '@/features/health/api'
import { HomePage } from '@/pages/home-page'

export const router = createBrowserRouter([
  {
    path: '/',
    Component: RootLayout,
    ErrorBoundary: RouteError,
    children: [
      { index: true, Component: HomePage, loader: homeLoader },
      {
        path: '*',
        lazy: async () => ({ Component: (await import('@/pages/not-found-page')).NotFoundPage }),
      },
    ],
  },
])
```

**`frontend/src/main.tsx`**

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router/dom'
import { router } from '@/router'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
```

**`frontend/.env.example`**

```dotenv
# Empty in development: the Vite proxy forwards /api to the backend.
# In production: the public URL of the API, e.g. https://api.example.com/api
VITE_API_URL=
```

---

## 3. Backend

Create `backend/package.json`:

```json
{
  "name": "backend",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "engines": { "node": ">=24" },
  "scripts": {
    "dev": "node --watch --env-file-if-exists=.env src/server.ts",
    "start": "node --env-file-if-exists=.env src/server.ts",
    "typecheck": "tsc --noEmit",
    "lint": "oxlint src test",
    "test": "vitest run"
  }
}
```

Install the stack (inside `backend/`). Pin `@types/node` to the Node.js major version you run:

```bash
cd backend
pnpm add express mongoose zod cors helmet
pnpm add -D typescript @types/node@24 @types/express @types/cors oxlint vitest supertest @types/supertest
cd ..
```

Create these files:

**`backend/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "es2024",
    "lib": ["es2024"],
    "module": "nodenext",
    "moduleResolution": "nodenext",
    "types": ["node"],
    "strict": true,
    "noEmit": true,
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "erasableSyntaxOnly": true,
    "isolatedModules": true,
    "skipLibCheck": true,
    "noUncheckedIndexedAccess": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  },
  "include": ["src", "test"]
}
```

**`backend/vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    env: {
      NODE_ENV: 'test',
      MONGODB_URI: 'mongodb://127.0.0.1:27017/app_test',
    },
  },
})
```

**`backend/.env.example`**

```dotenv
NODE_ENV=development
PORT=4000
MONGODB_URI=mongodb://127.0.0.1:27017/<project-name>
# Comma-separated list of allowed browser origins
CORS_ORIGIN=http://localhost:5173
```

Then copy it: `cp backend/.env.example backend/.env`.

**`backend/src/config/env.ts`**

```ts
import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  MONGODB_URI: z.url(),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('Invalid environment variables:', z.flattenError(parsed.error).fieldErrors)
  process.exit(1)
}

export const env = parsed.data
export const isProduction = env.NODE_ENV === 'production'
```

**`backend/src/lib/http-error.ts`**

```ts
export class HttpError extends Error {
  readonly status: number
  readonly details?: unknown

  constructor(status: number, message: string, details?: unknown) {
    super(message)
    this.name = 'HttpError'
    this.status = status
    this.details = details
  }
}
```

**`backend/src/lib/validation.ts`**

```ts
import { z } from 'zod'

export const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id')

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})
```

**`backend/src/middleware/error-handler.ts`**

```ts
import type { ErrorRequestHandler, RequestHandler } from 'express'
import mongoose from 'mongoose'
import { z } from 'zod'
import { isProduction } from '../config/env.ts'
import { HttpError } from '../lib/http-error.ts'

export const notFound: RequestHandler = (req, _res, next) => {
  next(new HttpError(404, `Route not found: ${req.method} ${req.originalUrl}`))
}

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: { message: err.message, details: err.details } })
    return
  }
  if (err instanceof z.ZodError) {
    res.status(400).json({
      error: { message: 'Validation failed', details: z.flattenError(err).fieldErrors },
    })
    return
  }
  if (err instanceof mongoose.Error.CastError) {
    res.status(400).json({ error: { message: `Invalid ${err.path}` } })
    return
  }
  if (err instanceof mongoose.Error.ValidationError) {
    res.status(400).json({ error: { message: 'Validation failed', details: err.errors } })
    return
  }

  console.error(err)
  res.status(500).json({
    error: { message: isProduction ? 'Internal server error' : String(err) },
  })
}
```

**`backend/src/db/connect.ts`**

```ts
import mongoose from 'mongoose'
import { env, isProduction } from '../config/env.ts'

export async function connectDatabase() {
  mongoose.set('strictQuery', true)
  mongoose.set('sanitizeFilter', true)
  await mongoose.connect(env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
    autoIndex: !isProduction,
  })
  console.log(`MongoDB connected: ${mongoose.connection.name}`)
}

export async function disconnectDatabase() {
  await mongoose.disconnect()
}
```

**`backend/src/app.ts`**

```ts
import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import { env } from './config/env.ts'
import { errorHandler, notFound } from './middleware/error-handler.ts'

export function createApp() {
  const app = express()

  app.disable('x-powered-by')
  app.use(helmet())
  app.use(cors({ origin: env.CORS_ORIGIN.split(',').map((o) => o.trim()), credentials: true }))
  app.use(express.json({ limit: '1mb' }))

  app.get('/api/health', (_req, res) => {
    res.json({ data: { status: 'ok' } })
  })

  // Feature routers go here, e.g. app.use('/api/todos', todoRouter)

  app.use(notFound)
  app.use(errorHandler)
  return app
}
```

**`backend/src/server.ts`**

```ts
import { createApp } from './app.ts'
import { env } from './config/env.ts'
import { connectDatabase, disconnectDatabase } from './db/connect.ts'

await connectDatabase()

const server = createApp().listen(env.PORT, () => {
  console.log(`API listening on http://localhost:${env.PORT}`)
})

function shutdown(signal: string) {
  console.log(`${signal} received, shutting down…`)
  server.close(async () => {
    await disconnectDatabase()
    process.exit(0)
  })
}

process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))
```

**`backend/test/health.test.ts`**

```ts
import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { createApp } from '../src/app.ts'

describe('GET /api/health', () => {
  it('returns ok', async () => {
    const res = await request(createApp()).get('/api/health')
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ data: { status: 'ok' } })
  })

  it('returns a JSON 404 for unknown routes', async () => {
    const res = await request(createApp()).get('/api/does-not-exist')
    expect(res.status).toBe(404)
    expect(res.body.error.message).toMatch(/not found/i)
  })
})
```

---

## 4. Formatting (workspace root)

```bash
pnpm add -Dw prettier prettier-plugin-tailwindcss
```

**`.prettierrc.json`**

```json
{
  "semi": false,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "plugins": ["prettier-plugin-tailwindcss"],
  "tailwindStylesheet": "./frontend/src/index.css"
}
```

**`.prettierignore`**

```
pnpm-lock.yaml
dist
coverage
```

---

## 5. Install and verify

```bash
pnpm install
pnpm format
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

Everything must pass. Then start MongoDB (see `backend/AGENTS.md`), run `pnpm dev`, and check:

- http://localhost:4000/api/health returns `{"data":{"status":"ok"}}`
- http://localhost:5173 shows the home page with "API status: ok"

## 6. Finish

- In `PROJECT.md`, tick **Scaffolded** under Status.
- If the user wants a commit: `git add -A && git commit -m "chore: scaffold project"`.
- Then start on the first feature from `PROJECT.md`.
