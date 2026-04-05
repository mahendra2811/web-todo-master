# Database Design with Supabase (PostgreSQL)

## What is it?
> Supabase wraps a full PostgreSQL database, giving you a relational DB with tables, types, constraints, and relationships — accessible via auto-generated REST APIs. You design your schema in SQL, and Supabase creates API endpoints for each table automatically.

## Why do we need it?
> Our Todo app needs structured data: users own lists, lists contain todos, todos have subtasks and tags. A relational DB lets us enforce these relationships, ensure data integrity with constraints, and query efficiently with indexes. Without proper schema design, we'd have data inconsistencies and poor performance at scale.

## How it works (under the hood)

### Tables & Columns
Supabase uses standard PostgreSQL. Each table maps to a REST endpoint via PostgREST.

**Our tables:**
- `profiles` — Extends Supabase's internal `auth.users` table with app-specific fields
- `lists` — User's todo lists with ordering support
- `todos` — Individual todo items with priority, status, due dates
- `subtasks` — Checklist items within a todo
- `tags` — User-defined labels
- `todo_tags` — Junction table for many-to-many relationship between todos and tags
- `activity_logs` — Audit trail of all actions

### UUID Primary Keys
Every table uses `uuid` as the primary key type via `gen_random_uuid()`:
```sql
id uuid default gen_random_uuid() primary key
```
**Why UUID over auto-increment?**
- Safe to generate client-side (no DB round-trip needed)
- No information leakage (sequential IDs reveal record count)
- Safe for distributed systems
- Matches Supabase Auth's user ID format

### Timestamps with Timezone
We use `timestamptz` (timestamp with time zone) everywhere:
```sql
created_at timestamptz default now() not null
updated_at timestamptz default now() not null
```
**Why `timestamptz`?** PostgreSQL stores the value in UTC internally and converts to the client's timezone on read. This prevents timezone bugs when users are in different timezones.

### Enum Types
Custom PostgreSQL enums for constrained values:
```sql
create type public.todo_priority as enum ('low', 'medium', 'high', 'urgent');
create type public.todo_status as enum ('pending', 'in_progress', 'completed', 'cancelled');
```
**Why enums?**
- Database-level validation (can't insert invalid values)
- Better performance than string comparison
- Self-documenting schema

### Foreign Key Relationships

**One-to-Many (1:M):**
```sql
-- A user has many lists
user_id uuid references public.profiles(id) on delete cascade not null
```
`on delete cascade` means: when a user is deleted, all their lists are automatically deleted too.

**Many-to-Many (M:M) via Junction Table:**
```sql
-- A todo can have many tags, and a tag can be on many todos
create table public.todo_tags (
  todo_id uuid references public.todos(id) on delete cascade,
  tag_id uuid references public.tags(id) on delete cascade,
  primary key (todo_id, tag_id)  -- composite primary key prevents duplicates
);
```

### Check Constraints
Input validation at the database level:
```sql
name text not null check (char_length(name) between 1 and 100)
```
Even if frontend validation is bypassed, the DB rejects invalid data.

### Unique Constraints
```sql
unique(user_id, name)  -- on tags table: no duplicate tag names per user
```

## Implementation in our project

**Migration files:** `supabase/migrations/001_create_profiles.sql` through `009_create_indexes.sql`

**TypeScript types:** `src/types/database.ts` — manually written type definitions matching the schema. These types are used throughout the app for type safety.

**Relationship chain:**
```
profiles -> lists -> todos -> subtasks
                       |
                    todo_tags <- tags
profiles -> activity_logs
```

## Supabase Dashboard Steps

1. Go to **SQL Editor** in the Supabase Dashboard
2. Run each migration file in order (001 through 009)
3. Go to **Table Editor** to verify all 7 tables are created
4. Click on each table to verify columns, types, and defaults
5. Go to **Database -> Tables** to see foreign key relationships
6. Verify enum types in **Database -> Types**

## Common Mistakes & Gotchas

1. **Running migrations out of order** — Tables reference each other. `lists` references `profiles`, `todos` references `lists`. Always run in numerical order.
2. **Forgetting `on delete cascade`** — Without it, deleting a user fails if they have lists. Cascade ensures clean deletion.
3. **Using `text` for enums** — Strings allow typos. PostgreSQL enums catch invalid values at insert time.
4. **Not setting `not null`** — Nullable columns where you always expect a value leads to null-check bugs everywhere.
5. **Using `timestamp` instead of `timestamptz`** — Without timezone info, dates become ambiguous across timezones.

## Key Takeaways

- Supabase = PostgreSQL. Everything you know about relational DB design applies.
- `gen_random_uuid()` gives you collision-resistant IDs without auto-increment.
- `on delete cascade` keeps referential integrity clean when parent records are deleted.
- Junction tables (`todo_tags`) model many-to-many relationships.
- Check constraints and enums provide database-level validation beyond what the frontend enforces.

## Further Reading

- [Supabase Database Docs](https://supabase.com/docs/guides/database)
- [PostgreSQL Data Types](https://www.postgresql.org/docs/current/datatype.html)
- [PostgreSQL Constraints](https://www.postgresql.org/docs/current/ddl-constraints.html)
