# AGENTS.md: backend/

The REST API: Express 5 and Mongoose 9 on Node.js 24, written in TypeScript and run directly by Node (no build step). Read `../AGENTS.md` first; this file adds the backend specifics.

Rules: `../ai-rules/express.md`, `../ai-rules/mongodb.md`, `../ai-rules/security.md`.

## Structure

```
backend/
├── package.json · tsconfig.json · vitest.config.ts · .env.example
├── src/
│   ├── server.ts            # entry point: connect DB → listen → graceful shutdown
│   ├── app.ts               # createApp(): middleware, routers, error handler (no listen, so it's testable)
│   ├── config/env.ts        # Zod-validated env; the only file that reads process.env
│   ├── db/connect.ts        # mongoose connect/disconnect
│   ├── lib/
│   │   ├── http-error.ts    # HttpError(status, message, details?)
│   │   └── validation.ts    # shared Zod pieces (objectIdSchema, pagination)
│   ├── middleware/          # error-handler.ts, auth.ts (when needed), rate limiters
│   └── modules/<feature>/   # routes · controller · service · schemas · model
└── test/                    # Vitest + supertest
```

## Adding a feature (for example "products")

1. `src/modules/products/product.model.ts`: the Mongoose schema, indexes and inferred types.
2. `product.schemas.ts`: Zod schemas for the params, query and body of each endpoint.
3. `product.service.ts`: business logic and queries. Throw `HttpError` for expected failures.
4. `product.controller.ts`: parse the input with the Zod schemas, call the service, respond with `{ data }`.
5. `product.routes.ts`: the `Router()` mapping paths to controller methods.
6. Register it in `src/app.ts`: `app.use('/api/products', productRouter)`, before `notFound`.
7. Tests in `test/products.test.ts` covering the happy path, a validation error and not-found.
8. Mirror the new types in `frontend/src/types/api.ts`.

Follow the complete example module in `../ai-rules/express.md`.

## Local database

- Start MongoDB with `docker run -d --name mongo -p 27017:27017 -v mongo-data:/data/db mongo:8`, or use a MongoDB Atlas connection string.
- Copy `.env.example` to `.env` and set `MONGODB_URI`.
- Tests that touch the database must use a database whose name ends in `_test`. Never point them at the development database.

## Scripts (run inside `backend/`, or from the root with `pnpm --filter backend <script>`)

| Script | Command |
| --- | --- |
| `dev` | `node --watch --env-file-if-exists=.env src/server.ts` |
| `start` | `node --env-file-if-exists=.env src/server.ts` |
| `typecheck` | `tsc --noEmit` |
| `lint` | `oxlint src test` |
| `test` | `vitest run` |
