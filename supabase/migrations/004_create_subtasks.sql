create table public.subtasks (
  id uuid default gen_random_uuid() primary key,
  todo_id uuid references public.todos(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null check (char_length(title) between 1 and 200),
  is_completed boolean default false,
  position integer default 0,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);
