import { createClient } from '@/lib/supabase/client';
import type { TagInsert } from '@/types/todo';

function getClient() { return createClient(); }

export const tagService = {
  async getTags() {
    const { data, error } = await getClient()
      .from('tags')
      .select('*')
      .order('name', { ascending: true });
    if (error) throw error;
    return data;
  },

  async createTag(tag: Omit<TagInsert, 'user_id'>, userId: string) {
    const { data, error } = await getClient()
      .from('tags')
      .insert({ ...tag, user_id: userId })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteTag(id: string) {
    const { error } = await getClient().from('tags').delete().eq('id', id);
    if (error) throw error;
  },

  async addTagToTodo(todoId: string, tagId: string) {
    const { error } = await getClient()
      .from('todo_tags')
      .insert({ todo_id: todoId, tag_id: tagId });
    if (error) throw error;
  },

  async removeTagFromTodo(todoId: string, tagId: string) {
    const { error } = await getClient()
      .from('todo_tags')
      .delete()
      .eq('todo_id', todoId)
      .eq('tag_id', tagId);
    if (error) throw error;
  },

  async getTagsForTodo(todoId: string) {
    const { data, error } = await getClient()
      .from('todo_tags')
      .select('tag_id')
      .eq('todo_id', todoId);
    if (error) throw error;
    if (data.length === 0) return [];
    const tagIds = data.map((row) => row.tag_id);
    const { data: tags, error: tagError } = await getClient()
      .from('tags')
      .select('*')
      .in('id', tagIds);
    if (tagError) throw tagError;
    return tags;
  },
};
