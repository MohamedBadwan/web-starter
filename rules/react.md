# React Rules (React 19)

## Components

- Function components only. One exported component per file; small private helpers in the same file are fine.
- Type props with `type XProps = { … }` and destructure them in the signature.
- `ref` is a regular prop in React 19. Don't use `forwardRef`.
- Render a context directly: `<ThemeContext value={theme}>`, not `<ThemeContext.Provider>`.
- Keep components under about 150 lines. When one grows, extract subcomponents or a custom hook.
- Prefer composition (`children`, small pieces) to components with a dozen boolean props.
- List items need stable `key`s from the data (IDs). Never use array indexes as keys for dynamic lists.

## State: use the smallest tool that works

1. A value computed during render (no state at all).
2. Local `useState` or `useReducer`.
3. URL state (search params) for anything that should survive a refresh or be shareable: filters, tabs, pagination.
4. State lifted to the nearest common parent.
5. A global client store (Zustand), only for state shared by distant parts of the tree. See `zustand.md`.

Server data is not client state. Load it with the project's data layer (router loaders, Server Components). Don't copy it into a global store by hand.

## Effects

- `useEffect` is for synchronizing with external systems: subscriptions, DOM APIs, timers, non-React widgets.
- Don't use it to derive state, to respond to user events, or for values you could compute during render.
- Every effect that subscribes to something must clean up.
- Don't fetch data in `useEffect` when the project has a better data layer.

## Performance

- Don't add `useMemo`, `useCallback` or `memo` by default. Use them when you measured a problem, or when you need a stable reference (an effect dependency, a prop to a memoized child).
- Lazy-load heavy routes and components (`React.lazy` or router `lazy`).
- Images: set `width` and `height` (or an aspect ratio), use modern formats, and lazy-load images below the fold.

## Forms

- Use `<form action={fn}>` with React 19 Actions. `useActionState` gives you the result, pending state and errors; `useFormStatus` gives pending state to a nested submit button; `useOptimistic` gives optimistic UI.
- Always validate on the server. Client-side validation is only for UX.
- Every input has a `<label>`, visible or `sr-only`.

## Accessibility (required)

- Semantic HTML first: `button` for actions, `a` or `Link` for navigation, plus `nav`, `main`, `header`, `footer`, and headings in order.
- Everything works with the keyboard, and focus is visible (`focus-visible:` styles).
- Images have a meaningful `alt`, or `alt=""` when they are decorative. Icon-only buttons have an `aria-label`.
- Color contrast meets WCAG AA. Never convey meaning with color alone.
- Respect `prefers-reduced-motion`. See `motion.md`.

## UI states

- Every screen that loads data handles four states: loading (skeleton or spinner), empty, error (with a retry where it makes sense), and success.
- Every action shows a pending state and success or error feedback.

## Errors

- Put error boundaries at route level (the router's `ErrorBoundary` or Next.js `error.tsx`), so one broken widget doesn't blank the whole page.
- Show the user a friendly message. Log the technical details to the console or to monitoring.
