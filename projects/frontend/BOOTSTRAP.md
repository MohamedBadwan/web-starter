# BOOTSTRAP.md: First-Time Setup

Follow these steps **once**, when `package.json` doesn't exist yet. Skip any step that's already done. When you finish, tick "Scaffolded" in `PROJECT.md`.

**Requirements:** Node.js 24+ and pnpm (`corepack enable pnpm`, or `npm i -g pnpm`). Check with `node -v` and `pnpm -v`.

Replace `<project-name>` with the project's name in kebab-case (from `PROJECT.md`).

---

## 1. Scaffold Vite

`create-vite` won't write into a non-empty folder, so scaffold into a temporary folder and move the files in. Keep **this** folder's `README.md`.

```bash
pnpm create vite@latest scaffold-tmp --template react-ts --no-interactive
rm -f scaffold-tmp/README.md
cp -R scaffold-tmp/. ./
rm -rf scaffold-tmp
```

> With npm: `npm create vite@latest scaffold-tmp -- --template react-ts --no-interactive` (npm needs the `--`).

Then:

- In `package.json`, set `"name": "<project-name>"` and add these scripts next to the generated ones:

  ```json
  "typecheck": "tsc -b",
  "test": "vitest run --passWithNoTests",
  "format": "prettier --write .",
  "format:check": "prettier --check ."
  ```

- Add `.env` and `*.tsbuildinfo` to `.gitignore`.
- Remove the demo files: `src/App.tsx`, `src/App.css`, everything in `src/assets/`, and `public/icons.svg`.
- Set `<title>` in `index.html` to the project name.
- Run `git init` if this isn't a git repository yet.

## 2. Install the stack

```bash
pnpm install
pnpm add react-router motion clsx tailwind-merge tailwindcss @tailwindcss/vite
pnpm add -D vitest prettier prettier-plugin-tailwindcss
```

Zustand is **not** installed yet; add it only when the app needs shared client state (see `AGENTS.md`).

## 3. Configuration

In `tsconfig.app.json`, add the path alias inside `compilerOptions`:

```json
"paths": { "@/*": ["./src/*"] }
```

Create or replace these files:

**`vite.config.ts`**

```ts
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { tsconfigPaths: true },
})
```

**`.prettierrc.json`**

```json
{
  "semi": false,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "plugins": ["prettier-plugin-tailwindcss"],
  "tailwindStylesheet": "./src/index.css"
}
```

**`.prettierignore`**

```
pnpm-lock.yaml
dist
coverage
```

## 4. Starter code

**`src/index.css`**

```css
@import "tailwindcss";

@theme {
  --color-brand-50: oklch(0.97 0.02 260);
  --color-brand-500: oklch(0.62 0.19 260);
  --color-brand-600: oklch(0.55 0.2 260);
}
```

**`src/lib/cn.ts`**

```ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

**`src/lib/motion.ts`**

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

**`src/components/layout/root-layout.tsx`**

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

**`src/components/layout/route-error.tsx`**

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

**`src/pages/home-page.tsx`**

```tsx
import { motion } from 'motion/react'
import { fadeInUp } from '@/lib/motion'

export function HomePage() {
  return (
    <motion.section initial="hidden" animate="visible" variants={fadeInUp}>
      <h1 className="text-4xl font-bold tracking-tight">Project name</h1>
      <p className="mt-3 max-w-prose text-zinc-600 dark:text-zinc-400">
        Replace this page with the first feature from PROJECT.md.
      </p>
    </motion.section>
  )
}
```

**`src/pages/not-found-page.tsx`**

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

**`src/router.tsx`**

```tsx
import { createBrowserRouter } from 'react-router'
import { RootLayout } from '@/components/layout/root-layout'
import { RouteError } from '@/components/layout/route-error'
import { HomePage } from '@/pages/home-page'

export const router = createBrowserRouter([
  {
    path: '/',
    Component: RootLayout,
    ErrorBoundary: RouteError,
    children: [
      { index: true, Component: HomePage },
      {
        path: '*',
        lazy: async () => ({ Component: (await import('@/pages/not-found-page')).NotFoundPage }),
      },
    ],
  },
])
```

**`src/main.tsx`**

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

## 5. Verify

```bash
pnpm format
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

Everything must pass. Then run `pnpm dev`, open http://localhost:5173, and check that the home page and an unknown URL (the not-found page) both render.

## 6. Finish

- In `PROJECT.md`, tick **Scaffolded** under Status.
- If the user wants a commit: `git add -A && git commit -m "chore: scaffold project"`.
- Then start on the first feature from `PROJECT.md`.
