# Motion Rules (formerly Framer Motion)

Framer Motion is now **Motion**. Install the `motion` package and import from `motion/react`:

```bash
pnpm add motion
```

```tsx
import { AnimatePresence, motion } from 'motion/react'
```

- Never install `framer-motion` or import from `'framer-motion'` in new code. If you find it, change the imports to `'motion/react'`; the API is the same.

## Usage

- Animate with the `initial`, `animate`, `exit`, `whileHover`, `whileTap` and `whileInView` props, plus `transition`.
- Animate `transform` (`x`, `y`, `scale`, `rotate`) and `opacity`. Don't animate `width`, `height`, `top`, `left` or `margin`. For layout changes, use the `layout` prop.
- Exit animations need `<AnimatePresence>` around the conditional element, and every direct child needs a unique `key`.
- Share animation definitions as `variants` in `src/lib/motion.ts`, using `staggerChildren` for lists. Don't copy-paste animation objects.
- Scroll reveal: `whileInView` with `viewport={{ once: true }}`.
- Scroll-linked effects: `useScroll` with `useTransform`.

```tsx
// src/lib/motion.ts
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

## Accessibility

- Wrap the app in `<MotionConfig reducedMotion="user">`. Transform and layout animations then turn off for users who prefer reduced motion.
- For custom effects (parallax, autoplay, large movement), check `useReducedMotion()` and provide a static fallback.

## Taste

- Motion should communicate something: a state change, hierarchy, feedback. Don't animate everything.
- Micro-interactions take 150–300 ms. Page and section transitions take 300–500 ms. Nothing important waits on an animation.
- Use springs for direct manipulation (drag, hover, tap) and eased tweens for opacity and color.
- Stay consistent: define a few shared transitions and reuse them.

## Performance

- On bundle-sensitive pages, use `LazyMotion` with `domAnimation` and the `m` component from `motion/react-m`. Add `strict` to catch accidental `motion` usage.
- For simple hover and color changes, use CSS transitions (Tailwind `transition-*`) instead of Motion.
- Avoid animating many elements at once.

## Next.js (App Router)

- Motion components need the client. Put them in a `'use client'` component that imports from `motion/react`. For simple, prop-only animations inside a Server Component, use `import * as motion from 'motion/react-client'`.
- Hooks (`useScroll`, `useReducedMotion`, …) and `AnimatePresence` work only in Client Components.
