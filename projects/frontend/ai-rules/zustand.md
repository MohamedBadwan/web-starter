<!-- Generated from web-starter/rules/zustand.md. Edit the source there, then run: node scripts/sync-rules.mjs -->

# Zustand Rules (v5)

Zustand holds **client state shared by distant components**: UI state, preferences, a cart, a multi-step wizard. It is not a cache for server data, and it doesn't replace local state.

## When to use it

- ✅ State read or written by components far apart in the tree.
- ✅ State that must survive a reload (with `persist`).
- ❌ State used by one component, or by a parent and its child. Use `useState` and props.
- ❌ State that belongs in the URL (filters, tabs, pagination). Use search params.
- ❌ Copies of server data. Use router loaders or the project's data layer.

## Store shape

```ts
// src/stores/cart-store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type CartItem = { id: string; name: string; price: number; qty: number }

type CartState = {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'qty'>) => void
  removeItem: (id: string) => void
  clear: () => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          const existing = state.items.find((i) => i.id === item.id)
          if (existing) {
            return {
              items: state.items.map((i) => (i.id === item.id ? { ...i, qty: i.qty + 1 } : i)),
            }
          }
          return { items: [...state.items, { ...item, qty: 1 }] }
        }),
      removeItem: (id) => set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
      clear: () => set({ items: [] }),
    }),
    { name: 'cart', version: 1, partialize: (state) => ({ items: state.items }) },
  ),
)

// Derived values are selectors, defined next to the store
export const selectCartTotal = (state: CartState) =>
  state.items.reduce((sum, i) => sum + i.price * i.qty, 0)
```

- The TypeScript form is curried: `create<State>()(…)`.
- One store per domain. Global stores go in `src/stores/`; a store used by one feature goes in `src/features/<feature>/<feature>-store.ts`.
- Actions live in the store, next to the state they change. Components call actions; they don't call `setState` directly.
- Update immutably. `set` merges only the top level, so spread nested objects yourself.
- Don't store derived values. Compute them with selectors.

## Reading state

- Select the minimum: `const items = useCartStore((s) => s.items)`.
- Never write `const store = useCartStore()`. It re-renders on every change.
- To select several values, use `useShallow`:

  ```ts
  import { useShallow } from 'zustand/react/shallow'

  const { addItem, removeItem } = useCartStore(
    useShallow((s) => ({ addItem: s.addItem, removeItem: s.removeItem })),
  )
  ```

- A selector that builds a new object or array on every call must be wrapped in `useShallow`. Without it, v5 throws "Maximum update depth exceeded".
- Outside React, use `useCartStore.getState()` and `useCartStore.setState()`.

## Middleware

- `persist`: give it a unique `name`, use `partialize` to store only what's needed (never functions or secrets), and when the persisted shape changes, bump `version` and add a `migrate` function.
- `devtools`: use it while debugging in development. Combine as `devtools(persist(…))`.
- Large stores: split them into slices typed with `StateCreator` and combine them. With `verbatimModuleSyntax`, import the type as `import { create, type StateCreator } from 'zustand'`.

## Testing

Reset stores between tests:

```ts
const initial = useCartStore.getInitialState()
beforeEach(() => useCartStore.setState(initial, true))
```
