create type public.activity_action as enum (
  'todo_created', 'todo_updated', 'todo_completed', 'todo_deleted',
  'list_created', 'list_updated', 'list_deleted',
  'subtask_created', 'subtask_completed', 'subtask_deleted'
);

create table public.activity_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  action public.activity_action not null,
  entity_type text not null,
  entity_id uuid not null,
  metadata jsonb default '{}',
  created_at timestamptz default now() not null
);
