# AGENTS.md: web-starter

This repository is a collection of **AI-ready project templates**. It doesn't contain an app. Each folder in `projects/` is a self-contained template that tells an AI coding agent exactly how to scaffold and build one kind of web project, with current library versions and consistent rules.

## If the user wants to start a new project

1. **Pick the template.** If the request doesn't make it clear, ask one question.

   | The user wants… | Template | Stack |
   | --- | --- | --- |
   | An app that stores its own data: accounts, CRUD, dashboards over its own records | `projects/fullstack-with-database` | React, Vite, Tailwind CSS, Zustand, Motion · Node.js, Express, MongoDB |
   | A site or app whose server side only renders pages, handles forms, or calls external APIs: landing page, marketing site, blog, portfolio, app over third-party APIs | `projects/fullstack-without-database` | Next.js, Tailwind CSS, Motion |
   | A client-only app (SPA): landing page, portfolio, interactive tool, game, front end for public APIs | `projects/frontend` | React, Vite, Tailwind CSS, Motion, plus Zustand if needed |

2. **Copy the template** into the new project's folder, including hidden folders such as `.github/`:

   ```bash
   node scripts/new-project.mjs <template> <target-dir>
   ```

3. **Work in the new folder from then on.** Read its `AGENTS.md`, fill in `PROJECT.md` with the user, and follow `BOOTSTRAP.md`.

Never scaffold an app inside this repository.

## If the user wants to change the rules or templates

- `rules/*.md` are the **source of truth** for the topic rules. Never edit the copies in `projects/*/ai-rules/` directly.
- After editing a rule, run `node scripts/sync-rules.mjs` to update every template. CI fails if the copies are out of date (`node scripts/sync-rules.mjs --check`).
- Which rules each template receives is configured in `TEMPLATES` in `scripts/sync-rules.mjs`.
- Each template has its own instructions in its `AGENTS.md` (plus `frontend/AGENTS.md` and `backend/AGENTS.md` in the fullstack template), its `BOOTSTRAP.md` and its `PROJECT.md`.
- Before changing anything version-sensitive, check the current docs (see `rules/docs-lookup.md`), and update the "versions verified" date in the template's stack table.
- Test a bootstrap change by actually running that `BOOTSTRAP.md` in a scratch folder. Typecheck, lint, tests and build must all pass.
- Keep the writing style: English, short direct sentences, imperative rules, and code examples that compile.

## Layout

```
.
├── rules/        # source of truth: one file per topic
├── projects/     # self-contained templates (each with its own copy of the rules in ai-rules/)
└── scripts/      # sync-rules.mjs (copy rules into templates) · new-project.mjs (start a project)
```
