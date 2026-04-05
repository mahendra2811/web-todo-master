import { createClient } from '@/lib/supabase/client';
import type { ExportData, ImportMode } from '@/types/export';
import { filterImportData } from '@/lib/utils/export-validation';

interface ImportOptions {
  includeCompleted: boolean;
  includeArchived: boolean;
  mode: ImportMode;
}

export async function executeImport(
  importData: ExportData,
  userId: string,
  options: ImportOptions
) {
  const supabase = createClient();
  const filteredData = filterImportData(importData, {
    includeCompleted: options.includeCompleted,
    includeArchived: options.includeArchived,
  });

  if (options.mode === 'replace') {
    const { error } = await supabase.from('lists').delete().eq('user_id', userId);
    if (error) throw error;
  }

  const listIdMap = new Map<string, string>();
  const todoIdMap = new Map<string, string>();
  const tagIdMap = new Map<string, string>();

  // Import lists
  for (const list of filteredData.lists) {
    const rec = list as Record<string, unknown>;
    const oldId = rec.id as string;
    const { data, error } = await supabase
      .from('lists')
      .insert({
        name: rec.name as string,
        description: (rec.description as string) || null,
        color: (rec.color as string) || '#6366f1',
        icon: (rec.icon as string) || 'list',
        position: (rec.position as number) || 0,
        is_archived: (rec.is_archived as boolean) || false,
        user_id: userId,
      })
      .select('id')
      .single();
    if (error) throw error;
    listIdMap.set(oldId, data.id);
  }

  // Import tags
  for (const tag of filteredData.tags) {
    const rec = tag as Record<string, unknown>;
    const oldId = rec.id as string;
    const { data, error } = await supabase
      .from('tags')
      .insert({ name: rec.name as string, color: (rec.color as string) || '#8b5cf6', user_id: userId })
      .select('id')
      .single();
    if (error) {
      if (error.code === '23505') continue; // skip duplicates
      throw error;
    }
    tagIdMap.set(oldId, data.id);
  }

  // Import todos
  for (const todo of filteredData.todos) {
    const rec = todo as Record<string, unknown>;
    const oldId = rec.id as string;
    const newListId = listIdMap.get(rec.list_id as string);
    if (!newListId) continue;
    const { data, error } = await supabase
      .from('todos')
      .insert({
        title: rec.title as string,
        description: (rec.description as string) || null,
        priority: (rec.priority as string) || 'medium',
        status: (rec.status as string) || 'pending',
        due_date: (rec.due_date as string) || null,
        completed_at: (rec.completed_at as string) || null,
        position: (rec.position as number) || 0,
        is_pinned: (rec.is_pinned as boolean) || false,
        list_id: newListId,
        user_id: userId,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any)
      .select('id')
      .single();
    if (error) throw error;
    todoIdMap.set(oldId, data.id);
  }

  // Import subtasks
  for (const subtask of filteredData.subtasks) {
    const rec = subtask as Record<string, unknown>;
    const newTodoId = todoIdMap.get(rec.todo_id as string);
    if (!newTodoId) continue;
    await supabase.from('subtasks').insert({
      title: rec.title as string,
      is_completed: (rec.is_completed as boolean) || false,
      position: (rec.position as number) || 0,
      todo_id: newTodoId,
      user_id: userId,
    });
  }

  // Import todo-tag associations
  for (const tt of filteredData.todoTags) {
    const rec = tt as Record<string, unknown>;
    const newTodoId = todoIdMap.get(rec.todo_id as string);
    const newTagId = tagIdMap.get(rec.tag_id as string);
    if (!newTodoId || !newTagId) continue;
    await supabase.from('todo_tags').insert({ todo_id: newTodoId, tag_id: newTagId });
  }

  return filteredData;
}
