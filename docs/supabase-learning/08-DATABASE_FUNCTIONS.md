# Database Functions & Triggers

## What is it?
> PostgreSQL functions (stored procedures) are reusable SQL/PL/pgSQL code that runs inside the database. Triggers are hooks that automatically execute a function when a table event occurs (INSERT, UPDATE, DELETE). Together, they let you automate business logic at the database level.

## Why do we need it?
> In our Todo app, we use triggers to: auto-create a profile when a user signs up (no API call needed), auto-update `updated_at` timestamps on every edit, auto-set `completed_at` when a todo's status changes to "completed", and auto-log activity entries whenever todos or lists change.

## How it works (under the hood)

### PostgreSQL Functions
```sql
create or replace function public.my_function()
returns trigger as $$
begin
  -- PL/pgSQL code here
  return new;
end;
$$ language plpgsql;
```

Key parts:
- `returns trigger` — This function will be called by a trigger
- `$$` — Dollar-quoting (avoids escaping single quotes in the function body)
- `new` — The row being inserted/updated (available in INSERT/UPDATE triggers)
- `old` — The row before the change (available in UPDATE/DELETE triggers)
- `tg_op` — The operation type: 'INSERT', 'UPDATE', or 'DELETE'

### Trigger Types

**BEFORE triggers** — Run before the row is written. Can modify `new`:
```sql
create trigger set_updated_at
  before update on public.todos
  for each row execute function public.update_updated_at();
```

**AFTER triggers** — Run after the row is written. Cannot modify the row, but can do side effects:
```sql
create trigger on_todo_change
  after insert or update or delete on public.todos
  for each row execute function public.log_todo_activity();
```

### Our Functions

#### 1. `handle_new_user()` — Auto-create profile on signup
```sql
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;
```
- Triggers on `auth.users` INSERT (Supabase internal table)
- `security definer` because it needs to write to `profiles` without the user having explicit INSERT access
- `coalesce()` provides a fallback: use full_name from metadata, or derive from email

#### 2. `update_updated_at()` — Auto-timestamp
```sql
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;
```
- BEFORE UPDATE trigger — modifies `new` before it's saved
- Applied to `profiles`, `lists`, `todos`, `subtasks`

#### 3. `handle_todo_completion()` — Auto-set completed_at
- Only sets `completed_at` when transitioning TO completed status
- Clears it when moving away from completed (allows re-opening todos)

#### 4. `log_todo_activity()` / `log_list_activity()` — Audit logging
- Checks `tg_op` to determine the operation type
- Inserts into `activity_logs` with relevant metadata
- Uses `security definer` because the trigger runs in the context of the table operation

## Implementation in our project

**File:** `supabase/migrations/008_create_functions_triggers.sql`

**Trigger -> Table mapping:**
| Trigger | Table | Type | Function |
|---------|-------|------|----------|
| `on_auth_user_created` | `auth.users` | AFTER INSERT | `handle_new_user()` |
| `set_updated_at` | profiles, lists, todos, subtasks | BEFORE UPDATE | `update_updated_at()` |
| `on_todo_status_change` | `todos` | BEFORE UPDATE | `handle_todo_completion()` |
| `on_todo_change` | `todos` | AFTER INSERT/UPDATE/DELETE | `log_todo_activity()` |
| `on_list_change` | `lists` | AFTER INSERT/UPDATE/DELETE | `log_list_activity()` |

## Supabase Dashboard Steps

1. Run `008_create_functions_triggers.sql` in **SQL Editor**
2. Go to **Database -> Functions** to see all created functions
3. Go to **Database -> Triggers** to see all triggers and which tables they're attached to
4. Test: Create a new user via Auth -> the `profiles` table should auto-populate

## Common Mistakes & Gotchas

1. **Forgetting `return new`** — In BEFORE triggers, if you don't return `new`, the operation is cancelled
2. **Using BEFORE when you need AFTER** — BEFORE can modify the row; AFTER cannot but is better for side effects
3. **Infinite loops** — If a trigger on table A inserts into table A, it triggers itself recursively
4. **`security definer` on the wrong function** — Only use it when the function needs to bypass RLS
5. **`new` is null in DELETE triggers** — Use `old` to access the deleted row's data

## Key Takeaways

- Triggers automate database-level logic that shouldn't depend on the frontend
- BEFORE triggers can modify data before save; AFTER triggers are for side effects
- `new` = the row being written, `old` = the previous version of the row
- `security definer` makes functions run with elevated privileges (bypasses RLS)
- The auto-profile-creation pattern is essential for Supabase — it bridges `auth.users` and your public tables

## Further Reading

- [PostgreSQL Trigger Functions](https://www.postgresql.org/docs/current/plpgsql-trigger.html)
- [Supabase Database Functions](https://supabase.com/docs/guides/database/functions)
