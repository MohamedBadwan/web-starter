<!-- Generated from web-starter/rules/express.md. Edit the source there, then run: node scripts/sync-rules.mjs -->

# Express Rules (v5, TypeScript on Node 24)

## Runtime

- Node 24+ runs TypeScript files directly by stripping the types. There's no build step and no `ts-node`, `tsx` or `nodemon`:
  - development: `node --watch --env-file-if-exists=.env src/server.ts`
  - production: `node --env-file-if-exists=.env src/server.ts`
  - type checking: `tsc --noEmit`
- Because of type stripping:
  - relative imports include the `.ts` extension (`import { env } from './config/env.ts'`);
  - erasable syntax only: no `enum`, `namespace` or constructor parameter properties (`erasableSyntaxOnly` enforces this);
  - type-only imports use `import type`.
- Don't install `dotenv` (use `--env-file`) or `body-parser` (built into Express).

## Express 5 facts

- **Async handlers are first-class.** A rejected promise or thrown error in an `async` handler or middleware goes to the error handler automatically. Don't wrap handlers in `try/catch` just to call `next(err)`, and don't install `express-async-handler`.
- `req.body` is `undefined` unless body parsing is set up: `app.use(express.json({ limit: '1mb' }))`.
- `req.query` is a read-only getter. Parse it into a new variable; never assign to it.
- New path syntax: wildcards must be named (`/*splat`, or `/{*splat}` to also match the root), optional segments use braces (`/users{/:id}`), and regex characters in path strings are not supported.
- Use `res.status(201).json(…)`, not the removed `res.json(obj, status)` or `res.send(status)` forms.

## Architecture

Code is organized by feature module. Each layer has one job:

```
src/modules/<feature>/
├── <feature>.routes.ts      # Router: HTTP method + path → controller
├── <feature>.controller.ts  # HTTP only: parse the request with Zod, call the service, send the response
├── <feature>.service.ts     # Business logic and database access; knows nothing about req/res
├── <feature>.schemas.ts     # Zod input schemas and the types inferred from them
└── <feature>.model.ts       # Mongoose schema and model (see mongodb.md)
```

- Controllers stay thin. No business logic or database calls in routes or controllers.
- Services throw `HttpError` for expected failures (`404 Not found`, `409 Conflict`). The central error handler turns those, Zod errors, and anything unexpected into JSON.
- `app.ts` exports `createApp()`, which builds the app without listening. `server.ts` connects to the database, calls `listen`, and handles graceful shutdown. That split lets tests use `supertest(createApp())`.
- Only `src/config/env.ts` reads `process.env`. Everything else imports `env`.

## API conventions

- All routes live under `/api`, with plural resource nouns: `/api/todos`, `/api/todos/:id`.
- Methods: `GET` reads, `POST` creates (`201`), `PATCH` partially updates (`200`), `DELETE` removes (`204`, no body).
- Success responses are `{ "data": … }`, plus `"meta": { total, page, limit }` for lists.
- Error responses are `{ "error": { "message": string, "details"?: unknown } }`.
- Status codes: `400` invalid input, `401` not authenticated, `403` not allowed, `404` not found, `409` conflict, `422` valid input that breaks a business rule, `500` unexpected.
- Lists are always paginated (`?page=1&limit=20`, max 100). Never return an unbounded collection.
- `GET /api/health` returns `{ "data": { "status": "ok" } }`.

## Example module

```ts
// src/modules/todos/todo.schemas.ts
import { z } from 'zod'
import { objectIdSchema } from '../../lib/validation.ts'

export const todoIdParamsSchema = z.object({ id: objectIdSchema })
export const listTodosQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})
export const createTodoSchema = z.object({ title: z.string().trim().min(1).max(200) })
export const updateTodoSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  done: z.boolean().optional(),
})

export type ListTodosQuery = z.infer<typeof listTodosQuerySchema>
export type CreateTodoInput = z.infer<typeof createTodoSchema>
export type UpdateTodoInput = z.infer<typeof updateTodoSchema>
```

```ts
// src/modules/todos/todo.service.ts
import { HttpError } from '../../lib/http-error.ts'
import { TodoModel } from './todo.model.ts'
import type { CreateTodoInput, ListTodosQuery, UpdateTodoInput } from './todo.schemas.ts'

export const todoService = {
  async list({ page, limit }: ListTodosQuery) {
    const [items, total] = await Promise.all([
      TodoModel.find().sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      TodoModel.countDocuments(),
    ])
    return { items, total }
  },

  create(input: CreateTodoInput) {
    return TodoModel.create(input)
  },

  async update(id: string, input: UpdateTodoInput) {
    const todo = await TodoModel.findByIdAndUpdate(id, input, {
      returnDocument: 'after',
      runValidators: true,
    }).lean()
    if (!todo) throw new HttpError(404, 'Todo not found')
    return todo
  },

  async remove(id: string) {
    const todo = await TodoModel.findByIdAndDelete(id).lean()
    if (!todo) throw new HttpError(404, 'Todo not found')
  },
}
```

```ts
// src/modules/todos/todo.controller.ts
import type { Request, Response } from 'express'
import {
  createTodoSchema,
  listTodosQuerySchema,
  todoIdParamsSchema,
  updateTodoSchema,
} from './todo.schemas.ts'
import { todoService } from './todo.service.ts'

export const todoController = {
  async list(req: Request, res: Response) {
    const query = listTodosQuerySchema.parse(req.query)
    const { items, total } = await todoService.list(query)
    res.json({ data: items, meta: { total, page: query.page, limit: query.limit } })
  },

  async create(req: Request, res: Response) {
    const input = createTodoSchema.parse(req.body)
    res.status(201).json({ data: await todoService.create(input) })
  },

  async update(req: Request, res: Response) {
    const { id } = todoIdParamsSchema.parse(req.params)
    const input = updateTodoSchema.parse(req.body)
    res.json({ data: await todoService.update(id, input) })
  },

  async remove(req: Request, res: Response) {
    const { id } = todoIdParamsSchema.parse(req.params)
    await todoService.remove(id)
    res.status(204).end()
  },
}
```

```ts
// src/modules/todos/todo.routes.ts
import { Router } from 'express'
import { todoController } from './todo.controller.ts'

export const todoRouter = Router()

todoRouter.get('/', todoController.list)
todoRouter.post('/', todoController.create)
todoRouter.patch('/:id', todoController.update)
todoRouter.delete('/:id', todoController.remove)
```

Register the router in `createApp()` with `app.use('/api/todos', todoRouter)`, before the `notFound` and `errorHandler` middleware.

## Security baseline

- `helmet()`, `cors({ origin: <list from env>, credentials: true })`, `express.json({ limit: '1mb' })`, `app.disable('x-powered-by')`.
- Add `express-rate-limit` on auth and other abuse-prone routes.
- The error handler logs unexpected errors and returns a generic message, never the stack.
- See `security.md` for everything else.
