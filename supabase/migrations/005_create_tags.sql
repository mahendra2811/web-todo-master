create table public.tags (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null check (char_length(name) between 1 and 50),
  color text default '#8b5cf6',
  created_at timestamptz default now() not null,
  unique(user_id, name)
);

-- Junction table: many-to-many between todos and tags
create table public.todo_tags (
  todo_id uuid references public.todos(id) on delete cascade,
  tag_id uuid references public.tags(id) on delete cascade,
  primary key (todo_id, tag_id)
);
