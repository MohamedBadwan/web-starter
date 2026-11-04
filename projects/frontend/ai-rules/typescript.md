<!-- Generated from web-starter/rules/typescript.md. Edit the source there, then run: node scripts/sync-rules.mjs -->

# TypeScript Rules

## Compiler settings

- `strict` stays on. TypeScript 7 enables it by default. Never turn strictness flags off.
- Keep the flags the scaffolds generate: `verbatimModuleSyntax`, `erasableSyntaxOnly`, `noUnusedLocals`, `noUnusedParameters`.

## Types

- No `any`. Use `unknown` and narrow it, or write the real type. No `@ts-ignore`. Use `@ts-expect-error` only with a comment explaining why.
- Type-only imports use `import type { X }` or the inline form `import { type X }`. `verbatimModuleSyntax` requires it.
- Write erasable syntax only: no `enum`, no `namespace`, no constructor parameter properties. Use `as const` instead:

  ```ts
  export const ROLES = ['admin', 'member'] as const
  export type Role = (typeof ROLES)[number]
  ```

- Derive types from one source of truth instead of duplicating them: `z.infer<typeof schema>`, `InferSchemaType<typeof mongooseSchema>`, `Awaited<ReturnType<typeof fn>>`.
- Validate all external data at the boundary with Zod: HTTP bodies, params and queries, environment variables, `localStorage`, third-party API responses. Inside the app, trust the types.
- Give exported functions in shared modules (`lib/`, services) explicit return types. Let inference work for local code and components.

## Modules

- Use named exports. Use a default export only where a framework requires it, such as Next.js `page.tsx` and `layout.tsx` or config files.
- In frontend and Next.js code, import from `src/` through the `@/` alias (`import { cn } from '@/lib/cn'`).
- In the Node backend, use relative imports **with the `.ts` extension** (`import { env } from './config/env.ts'`). Node runs the TypeScript files directly.

## Async

- Always `await` or return a promise. No floating promises.
- Use `async`/`await`, not `.then()` chains.

## Naming

| Thing | Convention | Example |
| --- | --- | --- |
| Files and folders | kebab-case | `user-card.tsx`, `use-debounce.ts` |
| React components | PascalCase | `UserCard` |
| Hooks | camelCase starting with `use` | `useDebounce` |
| Functions and variables | camelCase | `formatPrice` |
| Types and interfaces | PascalCase, no `I` prefix | `User`, `CreateUserInput` |
| True constants | SCREAMING_SNAKE_CASE | `MAX_UPLOAD_SIZE` |
| Zustand stores | `use<Name>Store` | `useCartStore` |
| Booleans | `is`/`has`/`can`/`should` prefix | `isOpen`, `hasError` |

## Style

- Small functions with one job. Prefer early returns to nested `if`s.
- No commented-out code. Don't leave debugging `console.log` calls behind.
- Comments explain *why*, not *what*.
- Prettier handles formatting. Don't hand-format against it.
