-- Enable RLS on ALL tables
alter table public.profiles enable row level security;
alter table public.lists enable row level security;
alter table public.todos enable row level security;
alter table public.subtasks enable row level security;
alter table public.tags enable row level security;
alter table public.todo_tags enable row level security;
alter table public.activity_logs enable row level security;

-- PROFILES
create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- LISTS
create policy "Users can view own lists"
  on public.lists for select using (auth.uid() = user_id);
create policy "Users can create own lists"
  on public.lists for insert with check (auth.uid() = user_id);
create policy "Users can update own lists"
  on public.lists for update using (auth.uid() = user_id);
create policy "Users can delete own lists"
  on public.lists for delete using (auth.uid() = user_id);

-- TODOS
create policy "Users can view own todos"
  on public.todos for select using (auth.uid() = user_id);
create policy "Users can create own todos"
  on public.todos for insert with check (auth.uid() = user_id);
create policy "Users can update own todos"
  on public.todos for update using (auth.uid() = user_id);
create policy "Users can delete own todos"
  on public.todos for delete using (auth.uid() = user_id);

-- SUBTASKS
create policy "Users can view own subtasks"
  on public.subtasks for select using (auth.uid() = user_id);
create policy "Users can create own subtasks"
  on public.subtasks for insert with check (auth.uid() = user_id);
create policy "Users can update own subtasks"
  on public.subtasks for update using (auth.uid() = user_id);
create policy "Users can delete own subtasks"
  on public.subtasks for delete using (auth.uid() = user_id);

-- TAGS
create policy "Users can view own tags"
  on public.tags for select using (auth.uid() = user_id);
create policy "Users can create own tags"
  on public.tags for insert with check (auth.uid() = user_id);
create policy "Users can update own tags"
  on public.tags for update using (auth.uid() = user_id);
create policy "Users can delete own tags"
  on public.tags for delete using (auth.uid() = user_id);

-- TODO_TAGS
create policy "Users can view own todo_tags"
  on public.todo_tags for select
  using (exists (select 1 from public.todos where id = todo_id and user_id = auth.uid()));
create policy "Users can create own todo_tags"
  on public.todo_tags for insert
  with check (exists (select 1 from public.todos where id = todo_id and user_id = auth.uid()));
create policy "Users can delete own todo_tags"
  on public.todo_tags for delete
  using (exists (select 1 from public.todos where id = todo_id and user_id = auth.uid()));

-- ACTIVITY LOGS
create policy "Users can view own activity"
  on public.activity_logs for select using (auth.uid() = user_id);
create policy "Users can insert own activity"
  on public.activity_logs for insert with check (auth.uid() = user_id);
