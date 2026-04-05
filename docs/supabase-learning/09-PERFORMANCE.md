# Database Performance & Indexes

## What is it?
> Indexes are data structures that speed up database queries by allowing PostgreSQL to find rows without scanning the entire table. Think of it like a book's index — instead of reading every page to find "RLS", you look up "RLS" in the index and jump to the right page.

## Why do we need it?
> As our Todo app grows (thousands of users, hundreds of thousands of todos), queries like "get all todos for list X sorted by position" need to be fast. Without indexes, PostgreSQL scans every row in the table. With proper indexes, it jumps directly to the relevant rows.

## How it works (under the hood)

### B-tree Indexes (Default)
PostgreSQL's default index type. Works like a balanced binary tree. Optimal for:
- Equality (`=`)
- Range queries (`<`, `>`, `BETWEEN`)
- Sorting (`ORDER BY`)

```sql
create index idx_todos_list_id on public.todos(list_id);
```

### When PostgreSQL Uses Indexes
PostgreSQL's query planner decides whether to use an index based on:
- Table size (small tables -> sequential scan is faster)
- Selectivity (how many rows match — fewer is better for indexes)
- Available indexes matching the query's WHERE/ORDER BY

### Our Indexes

**Single-column indexes for foreign keys and common filters:**
```sql
create index idx_lists_user_id on public.lists(user_id);
create index idx_todos_list_id on public.todos(list_id);
create index idx_todos_user_id on public.todos(user_id);
create index idx_todos_status on public.todos(status);
create index idx_todos_due_date on public.todos(due_date);
```

**Composite indexes for multi-column queries:**
```sql
create index idx_todos_position on public.todos(list_id, position);
```
Serves queries like: `SELECT * FROM todos WHERE list_id = ? ORDER BY position`

**Partial indexes (with WHERE clause):**
```sql
create index idx_todos_list_position on public.todos(list_id, position)
  where status != 'cancelled';
```
Only contains non-cancelled todos, making it smaller and faster.

### Checking Query Performance
```sql
explain analyze
select * from todos where list_id = 'some-uuid' order by position;
```
Shows whether an index is being used and actual execution time.

### Connection Pooling
Supabase uses PgBouncer for connection pooling. Connections are reused from a pool rather than opened per-request. Use the pooler connection string (port 6543) for serverless environments.

## Implementation in our project

**File:** `supabase/migrations/009_create_indexes.sql`

| Index | Serves query |
|-------|-------------|
| `idx_lists_user_id` | Get all lists for a user |
| `idx_todos_list_id` | Get all todos in a list |
| `idx_todos_user_id` | Get all todos for a user (dashboard stats) |
| `idx_todos_status` | Filter by status |
| `idx_todos_due_date` | Find overdue/upcoming todos |
| `idx_todos_position` | Sort todos within a list |
| `idx_subtasks_todo_id` | Get subtasks for a todo |
| `idx_activity_created_at` | Sort activity by date |
| `idx_activity_entity` | Get activity for a specific entity |

## Supabase Dashboard Steps

1. Run `009_create_indexes.sql` in **SQL Editor**
2. Go to **Database -> Indexes** to see all created indexes
3. Use SQL Editor to run `EXPLAIN ANALYZE` on common queries
4. Check **Reports -> Database** for query performance insights

## Common Mistakes & Gotchas

1. **Over-indexing** — Every index slows down writes because the index must be updated too
2. **Wrong column order in composite indexes** — `(list_id, position)` serves `WHERE list_id = ?` but NOT `WHERE position = ?`
3. **Not checking EXPLAIN output** — Always verify indexes are actually being used
4. **Forgetting indexes on foreign keys** — PostgreSQL doesn't auto-index FK columns

## Key Takeaways

- Index columns used in WHERE, JOIN, and ORDER BY clauses
- Composite indexes serve multi-column queries but column order matters
- Partial indexes exclude rows you rarely query (e.g., cancelled todos)
- Always verify with `EXPLAIN ANALYZE` that indexes are being used
- Foreign key columns should almost always be indexed

## Further Reading

- [PostgreSQL Indexes](https://www.postgresql.org/docs/current/indexes.html)
- [Supabase Performance Guide](https://supabase.com/docs/guides/database/query-optimization)
