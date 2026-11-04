# Next.js Rules (v16, App Router, Cache Components)

Next.js 16 has breaking changes compared with most training data. **Read the bundled docs in `node_modules/next/dist/docs/` before writing Next.js code.** They match the installed version exactly.

## Project conventions

- App Router only, in `src/app/`. Never create a `pages/` directory.
- Turbopack is the default bundler. Don't add `--turbopack` flags or a custom `webpack` config.
- Lint with `eslint` directly. `next lint` was removed.
- Generate route types with `next typegen` (it also runs during `dev` and `build`). They provide the global helpers `PageProps<'/route'>`, `LayoutProps<'/route'>` and `RouteContext<'/route'>`.
- Request interception lives in `src/proxy.ts`, exporting a `proxy` function. `middleware.ts` is the deprecated name.

## Server and Client Components

- Components are Server Components by default. Fetch data in them, directly and with `await`.
- Add `'use client'` only to leaf components that need state, effects, browser APIs, event handlers, Motion hooks or `AnimatePresence`. Keep that boundary as low in the tree as possible.
- Props passed from Server to Client Components must be serializable: no functions, except Server Actions.
- Modules holding secrets or server-only logic start with `import 'server-only'`.

## Async request APIs (required in v16)

`params`, `searchParams`, `cookies()`, `headers()` and `draftMode()` are all async, so always `await` them:

```tsx
export default async function Page(props: PageProps<'/blog/[slug]'>) {
  const { slug } = await props.params
  const query = await props.searchParams
  // …
}
```

## Caching with Cache Components (enabled in this project)

`cacheComponents: true` is on. The model works like this:

- **Nothing is cached by default.** Cache explicitly with the `'use cache'` directive in an async function or component, plus `cacheLife()` and `cacheTag()` from `next/cache`:

  ```ts
  // src/features/posts/queries.ts
  import { cacheLife, cacheTag } from 'next/cache'

  export async function getPosts() {
    'use cache'
    cacheLife('hours')
    cacheTag('posts')
    const res = await fetch('https://api.example.com/posts')
    if (!res.ok) throw new Error('Failed to load posts')
    return (await res.json()) as Post[]
  }
  ```

- Anything that reads runtime data (`cookies()`, `headers()`, `searchParams`, uncached `fetch`) must render inside a `<Suspense>` boundary. Otherwise the build fails. Static parts stay in the prerendered shell and dynamic parts stream in.
- Per-user cached data that reads cookies uses `'use cache: private'`.
- Invalidation: in a Server Action, call `updateTag('posts')` so the user immediately sees their own change. In a Route Handler or webhook, call `revalidateTag('posts', 'max')`; the second argument is required in v16.
- Don't use the old route segment configs `export const dynamic`, `revalidate` or `fetchCache`. They don't apply with Cache Components.

## Mutations and APIs

- Mutations triggered from your own UI are **Server Actions** in `src/features/<feature>/actions.ts`, starting with `'use server'`. Each action:
  1. validates its input with Zod,
  2. checks authentication and authorization itself, because actions are public endpoints,
  3. returns a typed result (`{ ok: true } | { ok: false, errors }`) or calls `redirect()`,
  4. invalidates the affected cache tags.
- Client forms call actions with `useActionState`.
- **Route Handlers** (`src/app/api/<name>/route.ts`) are only for HTTP endpoints that something else calls: webhooks, third-party clients, public JSON APIs.

```ts
// src/features/contact/actions.ts
'use server'

import { z } from 'zod'

const contactSchema = z.object({ email: z.email(), message: z.string().trim().min(10).max(2000) })

export type ContactState = { ok: boolean; errors?: Record<string, string[] | undefined> }

export async function sendContact(_prev: ContactState, formData: FormData): Promise<ContactState> {
  const parsed = contactSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { ok: false, errors: z.flattenError(parsed.error).fieldErrors }
  // call the email service or external API here
  return { ok: true }
}
```

## Files and built-ins

- Each route segment can have `loading.tsx`, `error.tsx` and `not-found.tsx`. Add `error.tsx` at least at the root.
- `error.tsx` must be a Client Component. In v16 it receives `{ error, retry }`: `error` is typed `unknown` (narrow it with `instanceof Error` before reading `message` or `digest`), and the "Try again" button calls `retry()`, which re-fetches and re-renders. `reset()` still exists for the rare case of re-rendering without re-fetching.
- Organize routes without changing URLs using route groups (`(marketing)`, `(app)`), and keep private folders out of routing with a `_` prefix.
- Use `next/image` for images, `next/font` for fonts, and `next/link` for internal links.
- SEO: `export const metadata` or `generateMetadata` in layouts and pages, plus `sitemap.ts`, `robots.ts` and `opengraph-image.tsx` where useful.

## Environment variables

- Server-only variables have no prefix and are read only on the server, through `src/lib/env.ts` (Zod-validated, with `import 'server-only'`).
- `NEXT_PUBLIC_*` variables are inlined into the client bundle, so never put secrets in them.

## The AGENTS.md block managed by Next.js

`next dev` writes a block between `<!-- BEGIN:nextjs-agent-rules -->` and `<!-- END:nextjs-agent-rules -->` in `AGENTS.md`. Leave it in place and commit it.
