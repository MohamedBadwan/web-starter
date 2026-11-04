# React Router Rules (v8, data mode)

- Install only `react-router`. The `react-router-dom` package no longer exists in v8.
- Import everything from `react-router`, except `RouterProvider`, which comes from `react-router/dom`.
- Use **data mode**: define routes as objects with `createBrowserRouter` and render them with `<RouterProvider>`. Don't use the old `<BrowserRouter><Routes>` style.

## Router setup

```tsx
// src/router.tsx
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
        path: 'products/:id',
        lazy: async () => {
          const { ProductPage, productLoader } = await import('@/pages/product-page')
          return { Component: ProductPage, loader: productLoader }
        },
      },
      {
        path: '*',
        lazy: async () => ({ Component: (await import('@/pages/not-found-page')).NotFoundPage }),
      },
    ],
  },
])
```

```tsx
// src/main.tsx
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

## Data

- Data a route needs to render is loaded in the route's `loader` and read with `useLoaderData()`. Don't fetch it in `useEffect`.
- Mutations go through route `action`s, submitted with `<Form>` or `useFetcher()`. Use `useFetcher()` when the mutation shouldn't navigate.
- Loaders and actions call functions from `src/features/<feature>/api.ts`, never `fetch` inline.
- Show global pending UI with `useNavigation()`. Show per-form pending state with `fetcher.state`.
- Throw `data('Not found', { status: 404 })` from a loader for expected errors. Use `redirect('/login')` for redirects from loaders and actions.

## Navigation and URL state

- Internal links use `<Link to>` or `<NavLink>`, never `<a href>`.
- In event handlers, navigate with `useNavigate()`. In loaders and actions, use `redirect()`.
- Filters, sorting, tabs and pagination live in `useSearchParams()`, so they survive a refresh and can be shared.

## Errors and code splitting

- The root route has an `ErrorBoundary` built with `useRouteError()` and `isRouteErrorResponse()`. Risky routes can have their own.
- Code-split pages with `lazy`, as in the setup above.

## Deployment

A client-side SPA needs the host to rewrite every path to `index.html`: `_redirects` on Netlify, `rewrites` in `vercel.json` on Vercel, `try_files` on nginx.
