'use client';

import { useEffect, useCallback, useRef } from 'react';
import { listService } from '@/services/list-service';
import { useAuthStore } from '@/stores/auth-store';
import { useTodoStore } from '@/stores/todo-store';
import { toast } from 'sonner';
import type { CreateListInput, UpdateListInput } from '@/lib/validators/list';
import { POSITION_GAP } from '@/lib/utils/constants';

export function useLists() {
  const user = useAuthStore((s) => s.user);
  const lists = useTodoStore((s) => s.lists);
  const loading = useTodoStore((s) => s.listsLoading);
  const setLists = useTodoStore((s) => s.setLists);
  const addList = useTodoStore((s) => s.addList);
  const storeUpdateList = useTodoStore((s) => s.updateList);
  const removeList = useTodoStore((s) => s.removeList);
  const setListsLoading = useTodoStore((s) => s.setListsLoading);
  const fetched = useRef(false);

  const hasCache = lists.length > 0;

  const fetchLists = useCallback(async () => {
    try {
      if (!hasCache) setListsLoading(true);
      const data = await listService.getListsWithCounts();
      setLists(data);
    } catch {
      toast.error('Failed to fetch lists');
    }
  }, [setLists, setListsLoading, hasCache]);

  useEffect(() => {
    if (user && !fetched.current) {
      fetched.current = true;
      fetchLists();
    }
  }, [user, fetchLists]);

  const createList = useCallback(
    async (input: CreateListInput) => {
      if (!user) return;
      try {
        const position = lists.length * POSITION_GAP;
        const newList = await listService.createList(
          { ...input, position },
          user.id
        );
        addList({ ...newList, todo_count: 0, completed_count: 0 });
        toast.success('List created');
        return newList;
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to create list');
        throw err;
      }
    },
    [user, lists.length, addList]
  );

  const updateList = useCallback(
    async (id: string, input: UpdateListInput) => {
      const prev = lists.find((l) => l.id === id);
      storeUpdateList(id, input);
      try {
        await listService.updateList(id, input);
        toast.success('List updated');
      } catch (err) {
        if (prev) storeUpdateList(id, prev);
        toast.error(err instanceof Error ? err.message : 'Failed to update list');
        throw err;
      }
    },
    [lists, storeUpdateList]
  );

  const deleteList = useCallback(
    async (id: string) => {
      const prev = [...lists];
      removeList(id);
      try {
        await listService.deleteList(id);
        toast.success('List deleted');
      } catch (err) {
        setLists(prev);
        toast.error(err instanceof Error ? err.message : 'Failed to delete list');
        throw err;
      }
    },
    [lists, removeList, setLists]
  );

  const effectiveLoading = loading && !hasCache;

  return { lists, loading: effectiveLoading, createList, updateList, deleteList, refetch: fetchLists };
}
