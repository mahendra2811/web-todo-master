-- Performance indexes
create index idx_lists_user_id on public.lists(user_id);
create index idx_todos_list_id on public.todos(list_id);
create index idx_todos_user_id on public.todos(user_id);
create index idx_todos_status on public.todos(status);
create index idx_todos_priority on public.todos(priority);
create index idx_todos_due_date on public.todos(due_date);
create index idx_todos_position on public.todos(list_id, position);
create index idx_subtasks_todo_id on public.subtasks(todo_id);
create index idx_tags_user_id on public.tags(user_id);
create index idx_activity_user_id on public.activity_logs(user_id);
create index idx_activity_created_at on public.activity_logs(created_at desc);
create index idx_activity_entity on public.activity_logs(entity_type, entity_id);

-- Composite index for common query pattern: user's todos sorted by position
create index idx_todos_list_position on public.todos(list_id, position) where status != 'cancelled';
