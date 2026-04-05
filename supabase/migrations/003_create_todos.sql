-- Priority enum
create type public.todo_priority as enum ('low', 'medium', 'high', 'urgent');

-- Status enum
create type public.todo_status as enum ('pending', 'in_progress', 'completed', 'cancelled');

create table public.todos (
  id uuid default gen_random_uuid() primary key,
  list_id uuid references public.lists(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null check (char_length(title) between 1 and 300),
  description text,
  priority public.todo_priority default 'medium' not null,
  status public.todo_status default 'pending' not null,
  due_date timestamptz,
  completed_at timestamptz,
  position integer default 0,
  is_pinned boolean default false,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);
