<!-- Generated from web-starter/rules/workflow.md. Edit the source there, then run: node scripts/sync-rules.mjs -->

# Workflow Rules

How to work on this project. These rules apply to every task, in every AI tool.

## Before writing code

1. Read `AGENTS.md` (the project's entry point) and `PROJECT.md` (what we are building).
2. Read the files in `ai-rules/` that match the task. For example, touching a store means reading `zustand.md`.
3. If the project is not scaffolded yet (no `package.json`), run the **Bootstrap** steps in `AGENTS.md` first.
4. Look at the existing code before adding new code. Follow the patterns already in the repo, and reuse existing components, hooks and helpers.

## Library APIs: never trust memory

Your training data is probably older than the versions installed here. Several libraries in this stack changed their APIs in recent major versions (React 19, Next.js 16, Tailwind CSS 4, Express 5, Mongoose 9, React Router 8, Zod 4).

- Before using an API you are not certain exists in the installed version, check the current docs. See `ai-rules/docs-lookup.md` (Context7).
- Check the installed version in `package.json` or `node_modules/<pkg>/package.json`, not the version you remember.
- If the official docs for the installed version disagree with these rules, the docs win. Tell the user, so the rule can be updated.

## Scope

- Do what was asked. Don't refactor unrelated code, rename files, or "improve" things nobody asked for. Mention them instead.
- Keep changes small and coherent: one feature or fix at a time.
- Don't add dependencies outside the approved list in `AGENTS.md` without asking first. Say what the package is for and why the approved stack isn't enough.
- Don't delete files, data or git history without explicit approval.
- When a requirement is ambiguous, ask one focused question. If the choice is cheap to change later, pick the conventional option, state the assumption, and continue.

## Package manager

- Use **pnpm** by default. If the project already has another lockfile (`package-lock.json`, `yarn.lock`, `bun.lock`), use that package manager instead. Never mix lockfiles.
- Install packages through the CLI (`pnpm add <pkg>`, `pnpm add -D <pkg>`) so you get the current version. Never hand-write version numbers into `package.json`.
- npm equivalents: `pnpm add` → `npm install`, `pnpm add -D` → `npm install -D`, `pnpm dlx` → `npx`. For `pnpm create <x> <dir> --flag`, npm needs `--` before the flags: `npm create <x>@latest <dir> -- --flag`. Without the `--`, npm silently drops the flags.

## Definition of done

A task is done only when all of these are true (the scripts are listed in `AGENTS.md`):

1. The type check passes with zero errors.
2. Lint passes with zero errors.
3. The build succeeds, where the project has a build.
4. Tests pass, and new logic has tests where that makes sense.
5. You exercised the change when possible: ran the dev server, called the endpoint, clicked through the UI.
6. `PROJECT.md` is updated if you made a product or architecture decision.

If something fails and you can't fix it, stop and report it with the error output. Never claim something works without running it. Never disable a lint rule, add `@ts-ignore`, or skip a test just to make the checks pass.

## Communication

- Before a large or risky change, give a short plan (which files you'll create or change) and wait for approval.
- When you finish, summarize what changed, how you verified it, and anything left undone.
- Write code, comments, commit messages and docs in English.

## Git

- Commit only when the user asks.
- Use Conventional Commits: `feat: …`, `fix: …`, `refactor: …`, `chore: …`, `docs: …`, `test: …`.
- Never commit `.env` files, secrets, `node_modules` or build output.
