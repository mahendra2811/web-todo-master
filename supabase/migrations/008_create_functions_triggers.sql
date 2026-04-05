-- Auto-update updated_at timestamp
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Apply to all tables with updated_at
create trigger set_updated_at before update on public.profiles
  for each row execute function public.update_updated_at();
create trigger set_updated_at before update on public.lists
  for each row execute function public.update_updated_at();
create trigger set_updated_at before update on public.todos
  for each row execute function public.update_updated_at();
create trigger set_updated_at before update on public.subtasks
  for each row execute function public.update_updated_at();

-- Auto-set completed_at when status changes to 'completed'
create or replace function public.handle_todo_completion()
returns trigger as $$
begin
  if new.status = 'completed' and old.status != 'completed' then
    new.completed_at = now();
  elsif new.status != 'completed' then
    new.completed_at = null;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger on_todo_status_change
  before update on public.todos
  for each row execute function public.handle_todo_completion();

-- Activity log trigger for todos
create or replace function public.log_todo_activity()
returns trigger as $$
begin
  if tg_op = 'INSERT' then
    insert into public.activity_logs (user_id, action, entity_type, entity_id, metadata)
    values (new.user_id, 'todo_created', 'todo', new.id,
      jsonb_build_object('title', new.title, 'list_id', new.list_id));
  elsif tg_op = 'UPDATE' then
    if new.status = 'completed' and old.status != 'completed' then
      insert into public.activity_logs (user_id, action, entity_type, entity_id, metadata)
      values (new.user_id, 'todo_completed', 'todo', new.id,
        jsonb_build_object('title', new.title));
    else
      insert into public.activity_logs (user_id, action, entity_type, entity_id, metadata)
      values (new.user_id, 'todo_updated', 'todo', new.id,
        jsonb_build_object('title', new.title, 'changes', jsonb_build_object(
          'old_status', old.status, 'new_status', new.status,
          'old_priority', old.priority, 'new_priority', new.priority
        )));
    end if;
  elsif tg_op = 'DELETE' then
    insert into public.activity_logs (user_id, action, entity_type, entity_id, metadata)
    values (old.user_id, 'todo_deleted', 'todo', old.id,
      jsonb_build_object('title', old.title));
  end if;
  return coalesce(new, old);
end;
$$ language plpgsql security definer;

create trigger on_todo_change
  after insert or update or delete on public.todos
  for each row execute function public.log_todo_activity();

-- Activity log trigger for lists
create or replace function public.log_list_activity()
returns trigger as $$
begin
  if tg_op = 'INSERT' then
    insert into public.activity_logs (user_id, action, entity_type, entity_id, metadata)
    values (new.user_id, 'list_created', 'list', new.id,
      jsonb_build_object('name', new.name));
  elsif tg_op = 'UPDATE' then
    insert into public.activity_logs (user_id, action, entity_type, entity_id, metadata)
    values (new.user_id, 'list_updated', 'list', new.id,
      jsonb_build_object('name', new.name));
  elsif tg_op = 'DELETE' then
    insert into public.activity_logs (user_id, action, entity_type, entity_id, metadata)
    values (old.user_id, 'list_deleted', 'list', old.id,
      jsonb_build_object('name', old.name));
  end if;
  return coalesce(new, old);
end;
$$ language plpgsql security definer;

create trigger on_list_change
  after insert or update or delete on public.lists
  for each row execute function public.log_list_activity();
