# Supabase Realtime

## What is it?
> Supabase Realtime is a WebSocket server that streams database changes to connected clients in real time. When a row is inserted, updated, or deleted, all subscribed clients receive the change instantly — no polling needed.

## Why do we need it?
> In our Todo app, if you have the app open in two browser tabs and complete a todo in one tab, the other tab should update immediately. Realtime enables this cross-tab/cross-device sync without manual polling or page refreshes.

## How it works (under the hood)

### The Pipeline
```
PostgreSQL INSERT/UPDATE/DELETE
  -> Write-Ahead Log (WAL)
    -> Supabase Realtime server (Elixir)
      -> WebSocket connection
        -> Browser client callback
```

PostgreSQL's WAL (Write-Ahead Log) records every change. Supabase's Realtime server listens to the WAL and broadcasts relevant changes to subscribed clients via WebSocket.

### Channel Types
Supabase Realtime supports three channel types:
1. **Database Changes** (postgres_changes) — Stream INSERT/UPDATE/DELETE events from tables
2. **Broadcast** — Send arbitrary messages to all connected clients (chat, cursors)
3. **Presence** — Track which users are currently online

We use **Database Changes** for syncing todos and lists.

### Subscription Setup
```typescript
const channel = supabase
  .channel('todos')
  .on('postgres_changes', {
    event: '*',         // INSERT, UPDATE, DELETE, or *
    schema: 'public',
    table: 'todos',
    filter: 'list_id=eq.abc-123'  // optional row-level filter
  }, (payload) => {
    // payload.eventType: 'INSERT' | 'UPDATE' | 'DELETE'
    // payload.new: the new row (INSERT/UPDATE)
    // payload.old: the old row (UPDATE/DELETE)
  })
  .subscribe();
```

### REPLICA IDENTITY FULL
By default, PostgreSQL only sends the primary key in the `old` record for UPDATE/DELETE events. To get the full old row:
```sql
ALTER TABLE todos REPLICA IDENTITY FULL;
```
Without this, `payload.old` only contains the `id` field, making it hard to know what changed.

### Filters
You can filter subscriptions to reduce noise:
- `list_id=eq.abc-123` — Only changes where list_id matches
- `user_id=eq.xyz` — Only changes for a specific user

### Handling Reconnection
WebSocket connections can drop. The Supabase client handles reconnection automatically. Your subscription callbacks will resume receiving events after reconnection.

## Implementation in our project

**Generic hook:** `src/hooks/use-realtime.ts`

```typescript
function useRealtime<T>({ table, filter, onInsert, onUpdate, onDelete })
```

This hook:
1. Creates a Supabase channel subscription
2. Routes INSERT/UPDATE/DELETE events to the appropriate callbacks
3. Tracks connection status (green dot in UI)
4. Cleans up on unmount

**Integration with todo/list hooks:**
The realtime callbacks update the Zustand store, which is the single source of truth. When a change comes from another tab, the store updates and React re-renders.

## Supabase Dashboard Steps

1. Go to **Database -> Replication**
2. Enable Realtime for: `todos`, `lists`, `subtasks`
3. (Optional) Run in SQL Editor to get full old records:
   ```sql
   ALTER TABLE todos REPLICA IDENTITY FULL;
   ALTER TABLE lists REPLICA IDENTITY FULL;
   ALTER TABLE subtasks REPLICA IDENTITY FULL;
   ```
4. Go to **Realtime -> Inspector** to monitor active connections

## Common Mistakes & Gotchas

1. **Not enabling Realtime for the table** — Subscriptions silently fail if Realtime isn't enabled in Dashboard -> Replication
2. **Duplicate events** — If a user's own mutation triggers a realtime event, you get the change twice (once from the mutation response, once from realtime). Deduplicate by checking if the data already matches.
3. **Missing `old` data** — Without `REPLICA IDENTITY FULL`, DELETE/UPDATE events only have the primary key in `old`
4. **Too many subscriptions** — Each subscription is a WebSocket channel. Don't create one per row — subscribe per table with filters.
5. **Not cleaning up** — Always call `supabase.removeChannel(channel)` on unmount to prevent memory leaks
6. **Realtime doesn't respect RLS** — Realtime broadcasts to all subscribers. Use filters to scope data, and validate on the client.

## Key Takeaways

- Realtime uses PostgreSQL WAL -> WebSocket to stream changes instantly
- Enable Realtime per-table in Dashboard -> Replication
- Use `REPLICA IDENTITY FULL` to get complete old records in UPDATE/DELETE events
- Always clean up subscriptions on component unmount
- Deduplicate events from your own mutations vs. realtime broadcasts
- Use the Zustand store as single source of truth; realtime events patch it

## Further Reading

- [Supabase Realtime Guide](https://supabase.com/docs/guides/realtime)
- [Supabase Realtime Postgres Changes](https://supabase.com/docs/guides/realtime/postgres-changes)
