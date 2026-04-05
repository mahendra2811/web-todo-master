'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { subtaskService } from '@/services/subtask-service';
import { useAuthStore } from '@/stores/auth-store';
import { toast } from 'sonner';
import type { Subtask } from '@/types/todo';

export function useSubtasks(todoId: string) {
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useAuthStore((s) => s.user);
  const subtasksRef = useRef(subtasks);
  subtasksRef.current = subtasks;

  const fetchSubtasks = useCallback(async () => {
    if (!todoId) return;
    try {
      setLoading(true);
      const data = await subtaskService.getSubtasks(todoId);
      setSubtasks(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to fetch subtasks');
    } finally {
      setLoading(false);
    }
  }, [todoId]);

  useEffect(() => {
    if (user && todoId) fetchSubtasks();
  }, [user, todoId, fetchSubtasks]);

  const createSubtask = useCallback(
    async (title: string) => {
      if (!user) return;
      try {
        const position = subtasksRef.current.length * 1000;
        const newSubtask = await subtaskService.createSubtask(
          { todo_id: todoId, title, position },
          user.id
        );
        setSubtasks((prev) => [...prev, newSubtask]);
        return newSubtask;
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to create subtask');
        throw err;
      }
    },
    [user, todoId]
  );

  const toggleSubtask = useCallback(
    async (id: string) => {
      const subtask = subtasksRef.current.find((s) => s.id === id);
      if (!subtask) return;
      const snapshot = subtasksRef.current;
      setSubtasks((s) =>
        s.map((item) =>
          item.id === id ? { ...item, is_completed: !item.is_completed } : item
        )
      );
      try {
        await subtaskService.toggleSubtask(id, subtask.is_completed);
      } catch (err) {
        setSubtasks(snapshot);
        toast.error('Failed to update subtask');
      }
    },
    []
  );

  const deleteSubtask = useCallback(
    async (id: string) => {
      const snapshot = subtasksRef.current;
      setSubtasks((s) => s.filter((item) => item.id !== id));
      try {
        await subtaskService.deleteSubtask(id);
      } catch (err) {
        setSubtasks(snapshot);
        toast.error('Failed to delete subtask');
      }
    },
    []
  );

  return { subtasks, loading, createSubtask, toggleSubtask, deleteSubtask };
}
