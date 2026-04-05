import { createClient } from '@/lib/supabase/client';

export const activityService = {
  async getPaginatedActivity(page: number, pageSize: number) {
    const client = createClient();
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const [{ count, error: countError }, { data, error }] = await Promise.all([
      client.from('activity_logs').select('*', { count: 'exact', head: true }),
      client.from('activity_logs').select('*').order('created_at', { ascending: false }).range(from, to),
    ]);

    if (countError) throw countError;
    if (error) throw error;
    return { data: data || [], total: count || 0 };
  },
};
