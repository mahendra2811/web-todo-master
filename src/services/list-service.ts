import { createClient } from '@/lib/supabase/client';
import type { ListInsert, ListUpdate } from '@/types/list';

const getClient = () => createClient();

export const listService = {
  async getLists() {
    const { data, error } = await getClient()
      .from('lists')
      .select('*')
      .order('position', { ascending: true });
    if (error) throw error;
    return data;
  },

  async getList(id: string) {
    const { data, error } = await getClient()
      .from('lists')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async getListsWithCounts() {
    const client = getClient();
    const { data: lists, error: listError } = await client
      .from('lists')
      .select('*')
      .order('position', { ascending: true });
    if (listError) throw listError;

    const { data: todos, error: todoError } = await client
      .from('todos')
      .select('id, list_id, status');
    if (todoError) throw todoError;

    return lists.map((list) => {
      const listTodos = todos.filter((t) => t.list_id === list.id);
      return {
        ...list,
        todo_count: listTodos.length,
        completed_count: listTodos.filter((t) => t.status === 'completed').length,
      };
    });
  },

  async createList(list: Omit<ListInsert, 'user_id'>, userId: string) {
    const { data, error } = await getClient()
      .from('lists')
      .insert({ ...list, user_id: userId })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateList(id: string, updates: ListUpdate) {
    const { data, error } = await getClient()
      .from('lists')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteList(id: string) {
    const { error } = await getClient().from('lists').delete().eq('id', id);
    if (error) throw error;
  },

  async reorderLists(items: { id: string; position: number }[]) {
    const client = getClient();
    const batchSize = 10;
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const results = await Promise.all(
        batch.map(({ id, position }) =>
          client.from('lists').update({ position }).eq('id', id)
        )
      );
      const failed = results.find((r) => r.error);
      if (failed?.error) throw failed.error;
    }
  },
};
