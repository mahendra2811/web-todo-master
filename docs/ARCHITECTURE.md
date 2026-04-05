# SupaTodo — System Architecture

## Overview

SupaTodo is a production-grade multi-user Todo SaaS application built with:
- **Frontend:** Next.js 15 (App Router) + TypeScript + Tailwind CSS
- **Backend:** Supabase (PostgreSQL + Auth + Realtime + Edge Functions + Storage)
- **State Management:** Zustand with offline persistence
- **Drag & Drop:** @dnd-kit

## Data Flow

```
User Action
  → React Component (UI layer)
    → Custom Hook (state + loading/error)
      → Service Layer (Supabase queries)
        → Supabase Client (PostgREST API)
          → PostgreSQL (with RLS policies)
```

## Key Architecture Decisions

1. **Services layer** — Components never call Supabase directly. All DB access goes through service files that return typed data.
2. **RLS everywhere** — Every table has Row Level Security. The `user_id` column + `auth.uid()` ensures complete data isolation between users.
3. **Optimistic updates** — UI updates immediately on user action. If the DB call fails, the UI rolls back and shows a toast.
4. **Realtime sync** — Supabase Realtime keeps data in sync across tabs/devices via WebSocket subscriptions.
5. **Offline queue** — Mutations made offline are queued in localStorage and replayed when connection returns.

## Database Schema

```
profiles (1) ──→ (M) lists (1) ──→ (M) todos (1) ──→ (M) subtasks
                                    │
                                    └──→ (M) todo_tags (M) ←── tags
                                    
profiles (1) ──→ (M) activity_logs
```

## Auth Flow

```
Login/Signup → Supabase Auth → JWT issued → Cookie stored
  → Middleware reads cookie on each request → Refreshes token
  → Supabase client auto-attaches JWT → RLS uses auth.uid()
```
