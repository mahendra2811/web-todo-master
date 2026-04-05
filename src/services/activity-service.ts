import { createClient } from '@/lib/supabase/client';

const getClient = () => createClient();

export const activityService = {
  async getRecentActivity(limit = 50) {
    const { data, error } = await getClient()
      .from('activity_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data;
  },

  async getPaginatedActivity(page: number, pageSize: number) {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const [{ count, error: countError }, { data, error }] = await Promise.all([
      getClient()
        .from('activity_logs')
        .select('*', { count: 'exact', head: true }),
      getClient()
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .range(from, to),
    ]);

    if (countError) throw countError;
    if (error) throw error;
    return { data: data || [], total: count || 0 };
  },

  async getActivityForEntity(entityId: string) {
    const { data, error } = await getClient()
      .from('activity_logs')
      .select('*')
      .eq('entity_id', entityId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },
};
