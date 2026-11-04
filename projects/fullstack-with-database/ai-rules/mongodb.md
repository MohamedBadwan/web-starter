<!-- Generated from web-starter/rules/mongodb.md. Edit the source there, then run: node scripts/sync-rules.mjs -->

# MongoDB + Mongoose Rules (Mongoose 9)

## Connection

- Connect once at startup in `src/db/connect.ts`, before the server starts listening. Disconnect on shutdown.
- Set `mongoose.set('strictQuery', true)` and `mongoose.set('sanitizeFilter', true)` before connecting. `sanitizeFilter` strips `$` operators injected through user input.
- The connection string comes from `env.MONGODB_URI`. Use a separate database per environment (`myapp`, `myapp_test`).
- Local development: `docker run -d --name mongo -p 27017:27017 -v mongo-data:/data/db mongo:8`, or a free MongoDB Atlas cluster.

## Models

One model per file, in `src/modules/<feature>/<feature>.model.ts`. Infer the TypeScript types from the schema instead of writing a separate interface:

```ts
import { model, Schema, type HydratedDocument, type InferSchemaType } from 'mongoose'

const todoSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    done: { type: Boolean, default: false },
    owner: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  },
  { timestamps: true },
)

todoSchema.index({ owner: 1, createdAt: -1 })

export type Todo = InferSchemaType<typeof todoSchema>
export type TodoDocument = HydratedDocument<Todo>
export const TodoModel = model('Todo', todoSchema)
```

- Always use `{ timestamps: true }`.
- Declare indexes in the schema to match the real queries (filter fields first, then sort fields). Make uniqueness a `unique: true` index. Validation alone is not enough because of race conditions.
- Mark sensitive fields `select: false` (for example `passwordHash`) so they never leak into responses.
- To get virtuals typed, define them in the schema options (`virtuals: { … }`). `InferSchemaType` doesn't include virtuals.

## Mongoose 9 changes (don't use the old patterns)

- Middleware takes **no `next` callback**. Use `async` functions:

  ```ts
  todoSchema.pre('save', async function () {
    // `this` is the document
  })
  ```

- No callbacks anywhere. Every query and document method returns a promise, so use `await`.
- Queries are type-checked against the schema: a wrong field type in a filter or in `create()` is a TypeScript error. Fix the data, don't cast it away.
- `doc.id` is typed as `string`.
- Update pipelines (an array passed to `updateOne`) throw by default.
- The `UUID` schema type returns `bson.UUID` instances, not strings.

## Queries

- Use `.lean()` for read-only queries that go straight to the response. It returns plain objects and is faster.
- Select only the fields you need with `.select()` for large documents.
- Updates use `findByIdAndUpdate(id, input, { returnDocument: 'after', runValidators: true })`. Without `runValidators`, schema validation doesn't run on updates.
- Validate IDs with `objectIdSchema` (Zod) in the controller, so a bad ID returns `400`, not a `CastError`.
- Paginate every list: `skip`/`limit` for small collections, a range on an indexed field (`_id` or `createdAt`) for large ones.
- Avoid N+1 queries. Use `populate()` with a `select`, or `$lookup` in an aggregation, rather than querying in a loop.
- When several writes must succeed or fail together, use a transaction (`mongoose.connection.transaction(async (session) => { … })`). Transactions need a replica set; Atlas has one by default.

## Data shape

- Keep documents bounded. Embed data that is read together and owned by the parent (addresses, line items). Reference data that is shared or grows without limit (comments, users).
- API responses expose `_id` as a string. Frontend types mirror the backend models.
- Never return raw Mongoose documents that contain secrets. Use `select: false` or map to a response type.

## Indexes in production

- In production, disable `autoIndex` (`mongoose.connect(uri, { autoIndex: env.NODE_ENV !== 'production' })`). Create indexes deliberately, for example with a script that runs `await Model.syncIndexes()` during deployment.
