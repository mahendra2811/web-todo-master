'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

type TableName = 'todos' | 'lists' | 'subtasks';

interface UseRealtimeOptions<T> {
  table: TableName;
  filter?: string;
  onInsert?: (record: T) => void;
  onUpdate?: (record: T) => void;
  onDelete?: (old: T) => void;
}

export function useRealtime<T extends Record<string, unknown>>({
  table,
  filter,
  onInsert,
  onUpdate,
  onDelete,
}: UseRealtimeOptions<T>) {
  const [isConnected, setIsConnected] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);

  const handleChange = useCallback(
    (payload: RealtimePostgresChangesPayload<T>) => {
      switch (payload.eventType) {
        case 'INSERT':
          onInsert?.(payload.new as T);
          break;
        case 'UPDATE':
          onUpdate?.(payload.new as T);
          break;
        case 'DELETE':
          onDelete?.(payload.old as T);
          break;
      }
    },
    [onInsert, onUpdate, onDelete]
  );

  useEffect(() => {
    const supabase = createClient();
    const channelName = filter ? `${table}:${filter}` : table;

    const filterConfig = filter
      ? { event: '*' as const, schema: 'public', table, filter }
      : { event: '*' as const, schema: 'public', table };

    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', filterConfig, handleChange)
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, filter, handleChange]);

  return { isConnected };
}
