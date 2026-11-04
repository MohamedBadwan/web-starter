# BOOTSTRAP.md: First-Time Setup

Follow these steps **once**, when `package.json` doesn't exist yet. Skip any step that's already done. When you finish, tick "Scaffolded" in `PROJECT.md`.

**Requirements:** Node.js 24+ and pnpm (`corepack enable pnpm`, or `npm i -g pnpm`). Check with `node -v` and `pnpm -v`.

Replace `<project-name>` with the project's name in kebab-case (from `PROJECT.md`).

---

## 1. Scaffold Next.js

`create-next-app` won't write into a non-empty folder, so scaffold into a temporary folder and move the files in. Keep **this** folder's `AGENTS.md` and `README.md`: it already contains the Next.js managed block.

```bash
pnpm create next-app@latest scaffold-tmp --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-pnpm --cache-components --agents-md --no-agent-feedback --no-react-compiler --disable-git --skip-install --yes
rm -f scaffold-tmp/AGENTS.md scaffold-tmp/CLAUDE.md scaffold-tmp/README.md
cp -R scaffold-tmp/. ./
rm -rf scaffold-tmp
```

> With npm: `npx create-next-app@latest scaffold-tmp -- <same flags, but --use-npm instead of --use-pnpm>`. npm needs the `--`.

Then:

- In `package.json`, set `"name": "<project-name>"`.
- In `.gitignore`, add `!.env.example` on the line after `.env*`, so the example file is committed.
- Delete the demo images in `public/`: `file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg`.
- Run `git init` if this isn't a git repository yet.

## 2. Install the stack

```bash
pnpm install
pnpm add motion zod clsx tailwind-merge server-only
pnpm add -D prettier prettier-plugin-tailwindcss vitest
```

Add these scripts to `package.json`, next to the generated ones:

```json
"typecheck": "next typegen && tsc --noEmit",
"test": "vitest run --passWithNoTests",
"format": "prettier --write .",
"format:check": "prettier --check ."
```

## 3. Configuration files

**`.prettierrc.json`**

```json
{
  "semi": false,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "plugins": ["prettier-plugin-tailwindcss"],
  "tailwindStylesheet": "./src/app/globals.css"
}
```

**`.prettierignore`**

```
pnpm-lock.yaml
.next
next-env.d.ts
```

**`vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: { environment: 'node' },
})
```

**`.env.example`**

```dotenv
# Server-only variables: never exposed to the browser. Declare each one in src/lib/env.ts.
# RESEND_API_KEY=

# Public variables: inlined into the client bundle. Never put secrets here.
# NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## 4. Starter code

Create or replace these files:

**`src/app/globals.css`**

```css
@import "tailwindcss";

@theme inline {
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}

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

**`src/lib/env.ts`**

```ts
import 'server-only'
import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  // Server-only variables go here, e.g. RESEND_API_KEY: z.string().min(1),
})

export const env = envSchema.parse(process.env)
```

**`src/components/providers.tsx`**

```tsx
'use client'

import { MotionConfig } from 'motion/react'
import type { ReactNode } from 'react'

export function Providers({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>
}
```

**`src/components/ui/fade-in.tsx`**

```tsx
'use client'

import { motion } from 'motion/react'
import type { ReactNode } from 'react'

type FadeInProps = { children: ReactNode; delay?: number; className?: string }

export function FadeIn({ children, delay = 0, className }: FadeInProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3, ease: 'easeOut', delay }}
    >
      {children}
    </motion.div>
  )
}
```

**`src/app/layout.tsx`**

```tsx
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Providers } from '@/components/providers'
import './globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export const metadata: Metadata = {
  title: { default: 'Project name', template: '%s · Project name' },
  description: 'One-line description of the project.',
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
```

**`src/app/page.tsx`**

```tsx
import * as motion from 'motion/react-client'
import { FadeIn } from '@/components/ui/fade-in'

export default function HomePage() {
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-16">
      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="text-4xl font-bold tracking-tight"
      >
        Project name
      </motion.h1>
      <FadeIn delay={0.1}>
        <p className="mt-3 max-w-prose text-zinc-600 dark:text-zinc-400">
          Replace this page with the first feature from PROJECT.md.
        </p>
      </FadeIn>
    </main>
  )
}
```

**`src/app/error.tsx`**

```tsx
'use client'

import { useEffect } from 'react'

export default function ErrorPage({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main role="alert" className="mx-auto max-w-md flex-1 px-4 py-24 text-center">
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">Please try again in a moment.</p>
      <button
        type="button"
        onClick={() => retry()}
        className="mt-6 rounded-lg bg-brand-500 px-4 py-2 text-white hover:bg-brand-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
      >
        Try again
      </button>
    </main>
  )
}
```

**`src/app/not-found.tsx`**

```tsx
import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="mx-auto max-w-md flex-1 px-4 py-24 text-center">
      <h1 className="text-3xl font-semibold">Page not found</h1>
      <Link href="/" className="mt-4 inline-block text-brand-600 underline-offset-4 hover:underline">
        Go home
      </Link>
    </main>
  )
}
```

## 5. Verify

```bash
pnpm format
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

Everything must pass. Then run `pnpm dev` and open http://localhost:3000. The first `next dev` run re-checks the managed block at the top of `AGENTS.md`; keep whatever it writes there.

## 6. Finish

- In `PROJECT.md`, tick **Scaffolded** under Status.
- If the user wants a commit: `git add -A && git commit -m "chore: scaffold project"`.
- Then start on the first feature from `PROJECT.md`.
