import { createClient } from '@/lib/supabase/client';
import type { TodoInsert, TodoUpdate } from '@/types/todo';

function getClient() { return createClient(); }

export const todoService = {
  async getTodosByList(listId: string) {
    const { data, error } = await getClient()
      .from('todos')
      .select('*')
      .eq('list_id', listId)
      .order('is_pinned', { ascending: false })
      .order('position', { ascending: true });
    if (error) throw error;
    return data;
  },

  async getTodo(id: string) {
    const { data, error } = await getClient()
      .from('todos')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async createTodo(todo: Omit<TodoInsert, 'user_id'>, userId: string) {
    const { data, error } = await getClient()
      .from('todos')
      .insert({ ...todo, user_id: userId })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateTodo(id: string, updates: TodoUpdate) {
    const { data, error } = await getClient()
      .from('todos')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteTodo(id: string) {
    const { error } = await getClient().from('todos').delete().eq('id', id);
    if (error) throw error;
  },

  async toggleComplete(id: string, currentStatus: string) {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    return this.updateTodo(id, { status: newStatus });
  },

  async reorderTodos(items: { id: string; position: number }[]) {
    const promises = items.map(({ id, position }) =>
      getClient().from('todos').update({ position }).eq('id', id)
    );
    const results = await Promise.all(promises);
    const failed = results.find((r) => r.error);
    if (failed?.error) throw failed.error;
  },

  async getUserStats(userId: string) {
    const { data: todos, error } = await getClient()
      .from('todos')
      .select('status, completed_at, due_date')
      .eq('user_id', userId);
    if (error) throw error;

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return {
      total: todos.length,
      completed: todos.filter((t) => t.status === 'completed').length,
      completedToday: todos.filter(
        (t) => t.completed_at && new Date(t.completed_at) >= todayStart
      ).length,
      overdue: todos.filter(
        (t) => t.due_date && new Date(t.due_date) < now && t.status !== 'completed' && t.status !== 'cancelled'
      ).length,
      pending: todos.filter((t) => t.status === 'pending').length,
      inProgress: todos.filter((t) => t.status === 'in_progress').length,
    };
  },
};
