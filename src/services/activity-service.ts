import { createClient } from '@/lib/supabase/client';

function getClient() { return createClient(); }

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
