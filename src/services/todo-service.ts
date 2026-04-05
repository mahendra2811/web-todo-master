import { createClient } from '@/lib/supabase/client';
import type { TodoInsert, TodoUpdate } from '@/types/todo';

export const todoService = {
  async getTodosByList(listId: string) {
    const { data, error } = await createClient()
      .from('todos')
      .select('*')
      .eq('list_id', listId)
      .order('is_pinned', { ascending: false })
      .order('position', { ascending: true });
    if (error) throw error;
    return data;
  },

  async getTodo(id: string) {
    const { data, error } = await createClient()
      .from('todos')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async createTodo(todo: Omit<TodoInsert, 'user_id'>, userId: string) {
    const { data, error } = await createClient()
      .from('todos')
      .insert({ ...todo, user_id: userId })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateTodo(id: string, updates: TodoUpdate) {
    const { data, error } = await createClient()
      .from('todos')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteTodo(id: string) {
    const { error } = await createClient().from('todos').delete().eq('id', id);
    if (error) throw error;
  },

  async toggleComplete(id: string, currentStatus: string) {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    return this.updateTodo(id, { status: newStatus });
  },

  async reorderTodos(items: { id: string; position: number }[]) {
    const client = createClient();
    for (let i = 0; i < items.length; i += 10) {
      const batch = items.slice(i, i + 10);
      const results = await Promise.all(
        batch.map(({ id, position }) => client.from('todos').update({ position }).eq('id', id))
      );
      const failed = results.find((r) => r.error);
      if (failed?.error) throw failed.error;
    }
  },

  async getUserStats(userId: string) {
    const { data: todos, error } = await createClient()
      .from('todos')
      .select('status, completed_at, due_date')
      .eq('user_id', userId);
    if (error) throw error;

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Single-pass aggregation instead of 6 separate .filter() calls
    return todos.reduce(
      (acc, t) => {
        acc.total++;
        if (t.status === 'completed') acc.completed++;
        if (t.status === 'pending') acc.pending++;
        if (t.status === 'in_progress') acc.inProgress++;
        if (t.completed_at && new Date(t.completed_at) >= todayStart) acc.completedToday++;
        if (t.due_date && new Date(t.due_date) < now && t.status !== 'completed' && t.status !== 'cancelled') acc.overdue++;
        return acc;
      },
      { total: 0, completed: 0, completedToday: 0, overdue: 0, pending: 0, inProgress: 0 }
    );
  },
};
