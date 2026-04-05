create table public.lists (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null check (char_length(name) between 1 and 100),
  description text,
  color text default '#6366f1',
  icon text default 'list',
  position integer default 0,
  is_archived boolean default false,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);
