<!-- Generated from web-starter/rules/tailwind.md. Edit the source there, then run: node scripts/sync-rules.mjs -->

# Tailwind CSS Rules (v4)

Tailwind v4 is configured **in CSS**, not in JavaScript.

## Setup facts

- The main stylesheet starts with `@import "tailwindcss";`. The old `@tailwind base; @tailwind components; @tailwind utilities;` directives are gone.
- There is no `tailwind.config.js`. Don't create one. Theme customization goes in `@theme` in the CSS file.
- Vite projects use the `@tailwindcss/vite` plugin. No PostCSS config and no autoprefixer.
- Next.js projects use whatever `create-next-app` generated (currently the `@tailwindcss/turbopack` loader in `next.config.ts`). Don't replace it.
- Class detection is automatic. If classes live outside the scanned folders, add `@source "../path";`.

## Design tokens

Define the design system once in the main CSS file, then use only those tokens:

```css
@import "tailwindcss";

@theme {
  --color-brand-50: oklch(0.97 0.02 260);
  --color-brand-500: oklch(0.62 0.19 260);
  --color-brand-600: oklch(0.55 0.2 260);
  --font-sans: "Inter Variable", ui-sans-serif, system-ui, sans-serif;
  --radius-card: 1rem;
}
```

`--color-brand-500` creates `bg-brand-500`, `text-brand-500`, `border-brand-500` and so on. `--radius-card` creates `rounded-card`.

- Use theme tokens, not arbitrary values. `p-[13px]` or `text-[#3b82f6]` means a token is missing, so add one. Arbitrary values are fine for real one-offs, such as a specific grid template.
- Reference CSS variables with the v4 shorthand `bg-(--my-var)`, not `bg-[--my-var]`.
- Use `@theme inline { … }` when a token points to another variable, for example a font loaded by `next/font`.

## Writing classes

- Put conditional classes through the `cn()` helper (`clsx` + `tailwind-merge`) in `@/lib/cn`:

  ```tsx
  <button className={cn('rounded-lg px-4 py-2', isActive && 'bg-brand-500 text-white', className)} />
  ```

- **Never build class names dynamically**, like `` `bg-${color}-500` ``. Tailwind only detects complete strings. Map each variant to a full class string:

  ```ts
  const variantClasses = {
    primary: 'bg-brand-500 text-white hover:bg-brand-600',
    ghost: 'bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800',
  } as const
  ```

- Mobile-first: base classes target small screens, then `sm:`, `md:`, `lg:` and `xl:` scale up. For components that adapt to their container, use container queries (`@container` on the parent, `@md:` on children).
- Dark mode: every surface and text color gets a `dark:` counterpart. By default `dark:` follows the OS setting (`prefers-color-scheme`). If the user wants a manual theme toggle, switch to the class strategy by adding `@custom-variant dark (&:where(.dark, .dark *));` to the main CSS file, then toggle the `dark` class on `<html>`.
- `prettier-plugin-tailwindcss` sorts classes automatically. Don't fight it.
- Extract repeated markup into a **component**, not into `@apply`. Use `@apply` only to style markup you don't control, such as third-party HTML or rendered markdown.
- Define custom utilities with `@utility name { … }`, not `@layer utilities`.
- In a CSS module, or any stylesheet that is not the main one, add `@reference "<path to main css>";` before using `@apply` or theme variables.

## v3 names you must not use

| v3 | v4 |
| --- | --- |
| `shadow-sm` / `shadow` | `shadow-xs` / `shadow-sm` |
| `rounded-sm` / `rounded` | `rounded-xs` / `rounded-sm` |
| `blur-sm` / `blur` | `blur-xs` / `blur-sm` |
| `outline-none` | `outline-hidden` |
| `ring` (3px) | `ring-3`; plain `ring` is now 1px |
| `bg-opacity-50`, `text-opacity-80` | `bg-black/50`, `text-white/80` |
| `flex-grow`, `flex-shrink` | `grow`, `shrink` |
| `overflow-ellipsis` | `text-ellipsis` |
| `!font-bold` (important prefix) | `font-bold!` (important suffix) |
| `@tailwind base` etc. | `@import "tailwindcss"` |

The default border color is now `currentColor`, so always give borders a color: `border border-zinc-200 dark:border-zinc-800`.

## Visual quality checklist

- Use the spacing scale consistently (`gap-4`, `p-6`, `mt-8`).
- Cap the line length of reading text (`max-w-prose` or `max-w-2xl`).
- Use `min-h-dvh` instead of `h-screen` for full-height layouts, so they work on mobile.
- Interactive elements have visible `hover:`, `focus-visible:`, `active:` and `disabled:` states, and touch targets of at least 44px.
- Keep a small, consistent set of radii, shadows and font sizes across the app.
