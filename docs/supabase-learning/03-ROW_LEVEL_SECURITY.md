# Row Level Security (RLS)

## What is it?
> RLS is PostgreSQL's built-in mechanism for restricting which rows a user can access. Instead of writing access control in your API layer, you define policies directly on the database. Supabase makes this the primary security model — every table should have RLS enabled.

## Why do we need it?
> In our Todo app, User A must never see User B's lists or todos. Without RLS, anyone with the Supabase anon key could query any user's data directly via the REST API. RLS ensures that even if someone calls the API directly (bypassing our frontend), they only see their own data.

## How it works (under the hood)

### The Security Model
When Supabase receives an API request:
1. Client sends JWT token (from login) in the Authorization header
2. Supabase/PostgREST extracts `auth.uid()` from the JWT
3. PostgreSQL appends RLS policy conditions to every query
4. Only rows matching the policy are returned/modified

```
SELECT * FROM todos
-- PostgreSQL automatically adds:
WHERE user_id = auth.uid()  -- from the RLS policy
```

### Enabling RLS
```sql
alter table public.todos enable row level security;
```
**Critical:** Once RLS is enabled with no policies, ALL access is denied (even to authenticated users). You must create policies.

### Policy Syntax

**SELECT policy (who can read):**
```sql
create policy "Users can view own todos"
  on public.todos
  for select
  using (auth.uid() = user_id);
```
The `using` clause filters which rows the user can see.

**INSERT policy (who can create):**
```sql
create policy "Users can create own todos"
  on public.todos
  for insert
  with check (auth.uid() = user_id);
```
The `with check` clause validates the data being inserted. This ensures users can only insert rows where `user_id` matches their own ID.

**UPDATE policy:**
```sql
create policy "Users can update own todos"
  on public.todos
  for update
  using (auth.uid() = user_id);
```

**DELETE policy:**
```sql
create policy "Users can delete own todos"
  on public.todos
  for delete
  using (auth.uid() = user_id);
```

### `using` vs `with check`
- **`using`**: Filters which EXISTING rows the operation can see/affect (SELECT, UPDATE, DELETE)
- **`with check`**: Validates the NEW row data being written (INSERT, and the new values in UPDATE)

### `auth.uid()` — The Magic Function
`auth.uid()` is a PostgreSQL function provided by Supabase that returns the currently authenticated user's UUID, extracted from the JWT. It's the foundation of all our RLS policies.

### Junction Table Policies
For `todo_tags`, we can't simply check `user_id` because the table doesn't have one. Instead, we check ownership through a join:
```sql
create policy "Users can view own todo_tags"
  on public.todo_tags for select
  using (exists (
    select 1 from public.todos
    where id = todo_id and user_id = auth.uid()
  ));
```

### `security definer` vs `security invoker`
- **`security invoker`** (default): Function runs with the permissions of the calling user. RLS applies.
- **`security definer`**: Function runs with the permissions of the function creator (typically superuser). **Bypasses RLS.**

We use `security definer` on triggers like `log_todo_activity()` because the trigger needs to insert into `activity_logs` during a DELETE operation — at that point, the "new" row doesn't exist yet, and the RLS check would fail.

## Implementation in our project

**File:** `supabase/migrations/007_create_rls_policies.sql`

All 7 tables have RLS enabled. Each has CRUD policies scoped to `auth.uid() = user_id` (or equivalent join for junction tables).

## Supabase Dashboard Steps

1. Go to **Authentication -> Policies** in the Supabase Dashboard
2. Verify RLS is enabled (green shield icon) on every table
3. Click each table to see its policies
4. Test policies in SQL Editor:
   ```sql
   set request.jwt.claims = '{"sub": "user-uuid-here"}';
   select * from todos;
   ```

## Common Mistakes & Gotchas

1. **Forgetting to enable RLS** — Table is completely open to anyone with the anon key
2. **Enabling RLS with no policies** — Table is completely locked, even for authenticated users
3. **Not testing with different users** — Create 2 test accounts and verify isolation
4. **Using `security definer` carelessly** — It bypasses RLS. Only use on triggers that need cross-table access
5. **Forgetting `with check` on INSERT** — Without it, users can insert rows with any `user_id`
6. **Complex policies slow queries** — The `exists` subquery in `todo_tags` adds overhead. Keep policies simple where possible

## Key Takeaways

- RLS is your primary security layer in Supabase — not your API code
- `auth.uid()` extracts the user ID from the JWT automatically
- Every table must have RLS enabled + explicit policies for each operation
- `using` filters existing rows; `with check` validates new data
- `security definer` functions bypass RLS — use sparingly and carefully
- Test with multiple users to verify data isolation

## Further Reading

- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS Docs](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
