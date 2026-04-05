import { createClient } from '@/lib/supabase/client';
import type { ListInsert, ListUpdate } from '@/types/list';

export const listService = {
  async getLists() {
    const { data, error } = await createClient()
      .from('lists')
      .select('*')
      .order('position', { ascending: true });
    if (error) throw error;
    return data;
  },

  async getList(id: string) {
    const { data, error } = await createClient()
      .from('lists')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async getListsWithCounts() {
    const client = createClient();
    const [{ data: lists, error: listError }, { data: todos, error: todoError }] = await Promise.all([
      client.from('lists').select('*').order('position', { ascending: true }),
      client.from('todos').select('id, list_id, status'),
    ]);
    if (listError) throw listError;
    if (todoError) throw todoError;

    // O(n) aggregation with Map instead of O(n*m) repeated filter
    const counts = new Map<string, { total: number; completed: number }>();
    for (const t of todos) {
      const entry = counts.get(t.list_id) || { total: 0, completed: 0 };
      entry.total++;
      if (t.status === 'completed') entry.completed++;
      counts.set(t.list_id, entry);
    }

    return lists.map((list) => {
      const c = counts.get(list.id);
      return { ...list, todo_count: c?.total ?? 0, completed_count: c?.completed ?? 0 };
    });
  },

  async createList(list: Omit<ListInsert, 'user_id'>, userId: string) {
    const { data, error } = await createClient()
      .from('lists')
      .insert({ ...list, user_id: userId })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateList(id: string, updates: ListUpdate) {
    const { data, error } = await createClient()
      .from('lists')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteList(id: string) {
    const { error } = await createClient().from('lists').delete().eq('id', id);
    if (error) throw error;
  },

  async reorderLists(items: { id: string; position: number }[]) {
    const client = createClient();
    // Batch updates in groups of 10 for performance
    for (let i = 0; i < items.length; i += 10) {
      const batch = items.slice(i, i + 10);
      const results = await Promise.all(
        batch.map(({ id, position }) => client.from('lists').update({ position }).eq('id', id))
      );
      const failed = results.find((r) => r.error);
      if (failed?.error) throw failed.error;
    }
  },
};
