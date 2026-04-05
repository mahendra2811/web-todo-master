'use client';

import { useState, useEffect, useCallback } from 'react';
import { activityService } from '@/services/activity-service';
import { useAuthStore } from '@/stores/auth-store';
import type { ActivityLog } from '@/types/activity';

export function useActivityLog(limit = 50) {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useAuthStore((s) => s.user);

  const fetchActivity = useCallback(async () => {
    try {
      setLoading(true);
      const data = await activityService.getRecentActivity(limit);
      setActivities(data);
    } catch {
      // Activity log is non-critical, fail silently
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    if (user) fetchActivity();
  }, [user, fetchActivity]);

  return { activities, loading, refetch: fetchActivity };
}
