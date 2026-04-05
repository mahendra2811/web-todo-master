import { createClient } from '@/lib/supabase/client';
import type { SubtaskInsert } from '@/types/todo';

function getClient() { return createClient(); }

export const subtaskService = {
  async getSubtasks(todoId: string) {
    const { data, error } = await getClient()
      .from('subtasks')
      .select('*')
      .eq('todo_id', todoId)
      .order('position', { ascending: true });
    if (error) throw error;
    return data;
  },

  async createSubtask(subtask: Omit<SubtaskInsert, 'user_id'>, userId: string) {
    const { data, error } = await getClient()
      .from('subtasks')
      .insert({ ...subtask, user_id: userId })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async toggleSubtask(id: string, isCompleted: boolean) {
    const { data, error } = await getClient()
      .from('subtasks')
      .update({ is_completed: !isCompleted })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteSubtask(id: string) {
    const { error } = await getClient().from('subtasks').delete().eq('id', id);
    if (error) throw error;
  },
};
