# Security Rules

## Secrets and configuration

- Secrets live in git-ignored `.env` files. Commit a `.env.example` that lists every variable with a safe placeholder.
- Never hardcode secrets, never log them, never send them to the client.
- Frontend environment variables are **public**. Anything prefixed `VITE_` or `NEXT_PUBLIC_` ends up in the browser bundle, so never put secrets there.
- Read `process.env` in one place (`config/env.ts` or `lib/env.ts`), validated with Zod at startup.

## Input and output

- Validate every input on the server with Zod: body, params, query, headers, cookies. Reject invalid input with `400`.
- Never build database queries from raw user input. Validate first. With MongoDB, keep `sanitizeFilter` on, and never pass `req.body` or `req.query` objects straight into a filter (a `{ "$ne": null }` injection would match every record).
- Don't render user-provided HTML. Avoid `dangerouslySetInnerHTML`. If it's unavoidable, sanitize with DOMPurify.
- Error responses never include stack traces or internal details in production.

## Authentication and authorization

Ask the user before implementing auth. When you do:

- Hash passwords with `argon2` or `bcrypt`. Never store them in plain or reversible form.
- Keep sessions or tokens in `httpOnly`, `secure`, `sameSite` cookies, not `localStorage`.
- Use short-lived access tokens and rotate refresh tokens.
- Check authorization on the server where the data is accessed: in the service, Route Handler or Server Action. Never only in the UI.
- Never trust user IDs or roles sent by the client. Derive them from the session.
- Rate-limit login, signup, password reset and other abuse-prone endpoints.

## HTTP

- CORS: allowed origins come from env and are listed explicitly. Never combine `origin: '*'` with credentials.
- Send security headers: `helmet` on Express, `headers()` in `next.config.ts` for Next.js when needed.
- Limit request body size.

## Files and dependencies

- Uploads: validate type and size, never trust the original filename, store them in object storage or outside the web root.
- Keep dependencies current (`pnpm outdated`, `pnpm audit`). Don't add unmaintained packages.
