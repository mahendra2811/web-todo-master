# Supabase Overview

## What is it?
> Supabase is an open-source Backend-as-a-Service (BaaS) that provides a PostgreSQL database, authentication, real-time subscriptions, edge functions, and file storage — all accessible via auto-generated REST and GraphQL APIs. It's often described as "the open-source Firebase alternative."

## Why do we need it?
> Our Todo app needs a backend for data storage, user auth, real-time sync, and file uploads. Instead of building a custom Express/NestJS API + PostgreSQL + Redis + Auth service, Supabase provides all of this out of the box. We write SQL for the schema and call the JavaScript client from the frontend — no backend code needed.

## How it works (under the hood)

### Architecture
Supabase is a collection of open-source tools wired together:
- **PostgreSQL** — The actual database (not a wrapper or document store)
- **PostgREST** — Turns your PostgreSQL schema into a RESTful API automatically
- **GoTrue** — Handles authentication (JWT-based)
- **Realtime** — WebSocket server that streams database changes
- **Kong** — API gateway that routes requests and handles auth
- **Supabase Storage** — S3-compatible file storage with RLS

### The Supabase Client
The `@supabase/supabase-js` client is a JavaScript wrapper around these services.

**Browser client** (`createBrowserClient`):
```typescript
import { createBrowserClient } from '@supabase/ssr';
const supabase = createBrowserClient(URL, ANON_KEY);
```
- Runs in the browser
- Stores auth tokens in cookies (via `@supabase/ssr`)
- Every request includes the JWT for RLS

**Server client** (`createServerClient`):
```typescript
import { createServerClient } from '@supabase/ssr';
const supabase = createServerClient(URL, ANON_KEY, { cookies: ... });
```
- Runs on the server (Next.js API routes, middleware, server components)
- Reads auth cookies from the request
- Used for SSR with authenticated data

### How Queries Work
The JS client translates method chains into HTTP requests to PostgREST:

```typescript
// This JavaScript:
const { data } = await supabase
  .from('todos')
  .select('id, title, priority')
  .eq('list_id', listId)
  .order('position')
  .limit(50);

// Becomes this HTTP request:
// GET /rest/v1/todos?select=id,title,priority&list_id=eq.{listId}&order=position&limit=50
// Authorization: Bearer <jwt>
```

PostgREST reads the JWT, sets `auth.uid()` for RLS, and runs the query.

### Query Builder API
Common methods:
- `.select('*')` — Choose columns (supports joins: `select('*, lists(*)')`)
- `.eq('col', val)` — WHERE col = val
- `.neq()`, `.gt()`, `.lt()`, `.gte()`, `.lte()` — Comparison operators
- `.in('col', [vals])` — WHERE col IN (...)
- `.order('col', { ascending: true })` — ORDER BY
- `.limit(n)` — LIMIT
- `.range(from, to)` — OFFSET/LIMIT for pagination
- `.single()` — Expect exactly one row (errors if 0 or 2+)
- `.insert()`, `.update()`, `.delete()` — Mutations

### Auto-Applied JWT for RLS
The client automatically includes the JWT in every request. PostgREST extracts the user ID and applies RLS policies. You never write `WHERE user_id = ?` in your queries — RLS handles it.

## Implementation in our project

**Client creation:** `src/lib/supabase/client.ts` (browser), `src/lib/supabase/server.ts` (server)

**Service layer pattern:**
```
Component -> Hook -> Service -> Supabase Client -> PostgREST -> PostgreSQL
```

Example from `src/services/todo-service.ts`:
```typescript
async getTodosByList(listId: string) {
  const { data, error } = await supabase
    .from('todos')
    .select('*')
    .eq('list_id', listId)
    .order('position', { ascending: true });
  if (error) throw error;
  return data;
}
```

## Supabase Dashboard Steps

1. Go to **API Docs** in the Supabase Dashboard
2. Click any table to see the auto-generated API documentation
3. Use the **SQL Editor** to run queries directly
4. Use the **Table Editor** for visual data management
5. Check **API Settings** for your project URL and keys

## Common Mistakes & Gotchas

1. **Using the `service_role` key in client code** — This key bypasses RLS. Only use it in edge functions or trusted server environments.
2. **Not handling errors from Supabase calls** — Every query returns `{ data, error }`. Always check `error`.
3. **Forgetting `.single()` when expecting one row** — Without it, you get an array. With it, you get one object (or an error if not found).
4. **Not using `@supabase/ssr` for Next.js** — The base `@supabase/supabase-js` stores tokens in localStorage, which doesn't work with SSR.
5. **Writing WHERE clauses that RLS already handles** — If RLS filters by `user_id`, you don't need `.eq('user_id', userId)` in your queries.

## Offline Patterns with Supabase

Supabase does NOT have built-in offline support (unlike Firebase). For our app, we implement:
1. **Zustand with persist middleware** — Cache lists and todos in localStorage
2. **Offline queue** — When offline, mutations are queued as `PendingAction[]`
3. **Online detection** — `navigator.onLine` + event listeners
4. **Queue replay** — When back online, process the queue in order

Trade-offs vs Firebase:
- More control over sync logic
- More code to write and maintain
- Can handle complex conflict resolution
- No automatic merge/conflict resolution

## Key Takeaways

- Supabase = PostgreSQL + PostgREST + GoTrue + Realtime + Storage, all wired together
- The JS client translates method chains into REST API calls
- Two client types: browser (`createBrowserClient`) and server (`createServerClient`)
- JWT is auto-included in every request; RLS uses it to filter data
- You write SQL for schema, TypeScript for the frontend — no backend API code needed

## Further Reading

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [PostgREST Documentation](https://postgrest.org/)
