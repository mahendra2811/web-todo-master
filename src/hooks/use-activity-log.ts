'use client';

import { useState, useEffect, useCallback } from 'react';
import { activityService } from '@/services/activity-service';
import { useAuthStore } from '@/stores/auth-store';
import type { ActivityLog } from '@/types/activity';

const PAGE_SIZE = 15;

export function useActivityLog() {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const user = useAuthStore((s) => s.user);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const fetchActivity = useCallback(async (targetPage: number) => {
    setLoading(true);
    try {
      const { data, total } = await activityService.getPaginatedActivity(targetPage, PAGE_SIZE);
      setActivities(data);
      setTotal(total);
    } catch {
      // Activity log is non-critical, fail silently
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) fetchActivity(page);
  }, [user, page, fetchActivity]);

  const goToPage = useCallback((p: number) => {
    if (p >= 1 && p <= totalPages) {
      setPage(p);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [totalPages]);

  return { activities, loading, page, totalPages, total, goToPage, refetch: () => fetchActivity(page) };
}
