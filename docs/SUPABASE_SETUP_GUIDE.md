# Supabase Setup Guide

> Step-by-step instructions for setting up the Supabase backend for SupaTodo.

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **New Project**
3. Choose your organization (or create one)
4. Enter project details:
   - **Name:** `supatodo` (or whatever you prefer)
   - **Database Password:** Generate a strong password and save it
   - **Region:** Choose the closest to your users
5. Click **Create new project** and wait for it to provision (~2 minutes)

## 2. Get API Credentials

1. Go to **Settings -> API** in the Supabase Dashboard
2. Copy the **Project URL** (looks like `https://xxxxx.supabase.co`)
3. Copy the **anon/public** key (starts with `eyJ...`)
4. Create `.env.local` in your project root:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   ```

**Important:** Never expose the `service_role` key in client-side code. It bypasses RLS.

## 3. Run Migrations

Run each migration file **in order** in the SQL Editor:

1. Go to **SQL Editor** in the Supabase Dashboard
2. Click **New query**
3. Paste the contents of `supabase/migrations/001_create_profiles.sql` and click **Run**
4. Repeat for each file in order:
   - `001_create_profiles.sql` — Profiles table + auto-create trigger
   - `002_create_lists.sql` — Lists table
   - `003_create_todos.sql` — Todos table + enums
   - `004_create_subtasks.sql` — Subtasks table
   - `005_create_tags.sql` — Tags + todo_tags junction table
   - `006_create_activity_logs.sql` — Activity logs table
   - `007_create_rls_policies.sql` — Row Level Security policies for ALL tables
   - `008_create_functions_triggers.sql` — Auto-timestamps, completion handler, activity logging
   - `009_create_indexes.sql` — Performance indexes

### Verify Tables
1. Go to **Table Editor**
2. You should see 7 tables: `profiles`, `lists`, `todos`, `subtasks`, `tags`, `todo_tags`, `activity_logs`
3. Click each table to verify columns are correct

### Verify RLS
1. Go to **Authentication -> Policies**
2. Every table should show a green shield icon (RLS enabled)
3. Click each table to see its policies

### Verify Triggers
1. Go to **Database -> Triggers**
2. You should see triggers for: `auth.users` (profile creation), `profiles`, `lists`, `todos`, `subtasks` (updated_at), `todos` (completion + activity), `lists` (activity)

## 4. Enable Realtime

1. Go to **Database -> Replication**
2. Under "Supabase Realtime", find and enable these tables:
   - `todos` — Toggle ON
   - `lists` — Toggle ON
   - `subtasks` — Toggle ON
3. This allows the frontend to subscribe to real-time changes on these tables

**Note:** Don't enable Realtime on `activity_logs` — it's write-heavy and we don't need live updates for it.

 -- Enable Realtime for todos, lists, and subtasks
  alter publication supabase_realtime add table public.todos;
  alter publication supabase_realtime add table public.lists;
  alter publication supabase_realtime add table public.subtasks;

  -- Enable REPLICA IDENTITY FULL for complete old records in UPDATE/DELETE events
  alter table public.todos replica identity full;
  alter table public.lists replica identity full;
  alter table public.subtasks replica identity full;


## 5. Configure Authentication

1. Go to **Authentication -> Providers**
2. **Email** should be enabled by default
3. Optionally configure:
   - **Confirm email:** Toggle ON for production, OFF for development
   - **Site URL:** Set to `http://localhost:3000` for development
4. Go to **Authentication -> URL Configuration**
5. Add `http://localhost:3000/auth/callback` to **Redirect URLs**

## 6. Create Storage Bucket (Phase 7)

1. Go to **Storage**
2. Click **New bucket**
3. Name: `avatars`
4. Toggle **Public bucket** OFF (we'll use signed URLs)
5. Click **Create bucket**
6. Go to **Policies** for the `avatars` bucket
7. Add policies:
   - SELECT: `auth.uid()::text = (storage.foldername(name))[1]` — Users can read their own avatar
   - INSERT: `auth.uid()::text = (storage.foldername(name))[1]` — Users can upload their own avatar
   - UPDATE: `auth.uid()::text = (storage.foldername(name))[1]` — Users can replace their avatar
   - DELETE: `auth.uid()::text = (storage.foldername(name))[1]` — Users can delete their avatar

## 7. Test the Setup

1. Go to **Authentication -> Users**
2. Click **Add user -> Create new user**
3. Enter a test email and password
4. Go to **Table Editor -> profiles** — verify a row was auto-created by the trigger
5. If the profile row exists, your triggers are working correctly
