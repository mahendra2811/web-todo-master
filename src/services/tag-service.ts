import { createClient } from '@/lib/supabase/client';
import type { TagInsert } from '@/types/todo';

export const tagService = {
  async getTags() {
    const { data, error } = await createClient()
      .from('tags')
      .select('*')
      .order('name', { ascending: true });
    if (error) throw error;
    return data;
  },

  async createTag(tag: Omit<TagInsert, 'user_id'>, userId: string) {
    const { data, error } = await createClient()
      .from('tags')
      .insert({ ...tag, user_id: userId })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteTag(id: string) {
    const { error } = await createClient().from('tags').delete().eq('id', id);
    if (error) throw error;
  },

  async addTagToTodo(todoId: string, tagId: string) {
    const { error } = await createClient()
      .from('todo_tags')
      .insert({ todo_id: todoId, tag_id: tagId });
    if (error) throw error;
  },

  async removeTagFromTodo(todoId: string, tagId: string) {
    const { error } = await createClient()
      .from('todo_tags')
      .delete()
      .eq('todo_id', todoId)
      .eq('tag_id', tagId);
    if (error) throw error;
  },

  // Single query with join instead of 2 sequential queries
  async getTagsForTodo(todoId: string) {
    const { data, error } = await createClient()
      .from('todo_tags')
      .select('tags(*)')
      .eq('todo_id', todoId);
    if (error) throw error;
    return data.map((row) => (row as Record<string, unknown>).tags).filter(Boolean);
  },
};
