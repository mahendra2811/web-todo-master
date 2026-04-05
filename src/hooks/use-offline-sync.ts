'use client';

import { useEffect, useCallback } from 'react';
import { useTodoStore } from '@/stores/todo-store';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

export function useOfflineSync() {
  const { offlineQueue, removeFromQueue, isOnline, setOnline } = useTodoStore();

  useEffect(() => {
    function handleOnline() {
      setOnline(true);
      toast.success('Back online');
    }
    function handleOffline() {
      setOnline(false);
      toast.warning('You are offline. Changes will sync when reconnected.');
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setOnline]);

  const processQueue = useCallback(async () => {
    if (!isOnline || offlineQueue.length === 0) return;

    const supabase = createClient();

    for (const action of offlineQueue) {
      try {
        // Use explicit table calls since dynamic table names lose type safety
        if (action.type === 'create') {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (supabase.from(action.table) as any).insert(action.data);
        } else if (action.type === 'update') {
          const { id, ...updates } = action.data;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (supabase.from(action.table) as any).update(updates).eq('id', id as string);
        } else if (action.type === 'delete') {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (supabase.from(action.table) as any).delete().eq('id', action.data.id as string);
        }
        removeFromQueue(action.id);
      } catch {
        break;
      }
    }
  }, [isOnline, offlineQueue, removeFromQueue]);

  useEffect(() => {
    if (isOnline && offlineQueue.length > 0) {
      processQueue();
    }
  }, [isOnline, offlineQueue.length, processQueue]);

  return { isOnline, queueLength: offlineQueue.length };
}
