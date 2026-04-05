-- Notifications table for in-app notifications
create table public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text not null,
  title text not null,
  body text,
  entity_type text,
  entity_id uuid,
  is_read boolean default false,
  created_at timestamptz default now() not null
);

-- RLS
alter table public.notifications enable row level security;

create policy "Users can view own notifications"
  on public.notifications for select using (auth.uid() = user_id);

create policy "Users can update own notifications"
  on public.notifications for update using (auth.uid() = user_id);

-- Service role can insert (from edge functions)
create policy "Service can insert notifications"
  on public.notifications for insert with check (true);

-- Indexes
create index idx_notifications_user_id on public.notifications(user_id);
create index idx_notifications_unread on public.notifications(user_id) where is_read = false;
