'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { todoService } from '@/services/todo-service';
import { useAuthStore } from '@/stores/auth-store';
import { useTodoStore } from '@/stores/todo-store';
import { toast } from 'sonner';
import type { Todo } from '@/types/todo';
import type { CreateTodoInput, UpdateTodoInput } from '@/lib/validators/todo';
import { POSITION_GAP } from '@/lib/utils/constants';

export function useTodos(listId: string) {
  const [todos, setTodos] = useState<Todo[]>(
    () => useTodoStore.getState().todos[listId] || []
  );
  const [loading, setLoading] = useState(
    () => !(useTodoStore.getState().todos[listId]?.length)
  );
  const [error, setError] = useState<string | null>(null);
  const user = useAuthStore((s) => s.user);
  const storeSetTodos = useTodoStore((s) => s.setTodos);
  const todosRef = useRef(todos);
  todosRef.current = todos;

  const fetchTodos = useCallback(async () => {
    if (!listId) return;
    try {
      if (!todosRef.current.length) setLoading(true);
      const data = await todoService.getTodosByList(listId);
      setTodos(data);
      storeSetTodos(listId, data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch todos');
    } finally {
      setLoading(false);
    }
  }, [listId, storeSetTodos]);

  useEffect(() => {
    if (user && listId) fetchTodos();
  }, [user, listId, fetchTodos]);

  // Sync store whenever local todos change
  useEffect(() => {
    if (listId && todos.length > 0) {
      storeSetTodos(listId, todos);
    }
  }, [listId, todos, storeSetTodos]);

  const createTodo = useCallback(
    async (input: Omit<CreateTodoInput, 'list_id'>) => {
      if (!user) return;
      try {
        const position = todosRef.current.length * POSITION_GAP;
        const newTodo = await todoService.createTodo(
          { ...input, list_id: listId, position },
          user.id
        );
        setTodos((prev) => [...prev, newTodo]);
        toast.success('Todo created');
        return newTodo;
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to create todo');
        throw err;
      }
    },
    [user, listId]
  );

  const updateTodo = useCallback(
    async (id: string, input: UpdateTodoInput) => {
      const snapshot = todosRef.current;
      setTodos((t) => t.map((item) => (item.id === id ? { ...item, ...input } : item)));
      try {
        await todoService.updateTodo(id, input);
      } catch (err) {
        setTodos(snapshot);
        toast.error(err instanceof Error ? err.message : 'Failed to update todo');
        throw err;
      }
    },
    []
  );

  const deleteTodo = useCallback(
    async (id: string) => {
      const snapshot = todosRef.current;
      setTodos((t) => t.filter((item) => item.id !== id));
      try {
        await todoService.deleteTodo(id);
        toast.success('Todo deleted');
      } catch (err) {
        setTodos(snapshot);
        toast.error(err instanceof Error ? err.message : 'Failed to delete todo');
        throw err;
      }
    },
    []
  );

  const toggleComplete = useCallback(
    async (id: string) => {
      const todo = todosRef.current.find((t) => t.id === id);
      if (!todo) return;
      const newStatus = todo.status === 'completed' ? 'pending' : 'completed';
      const snapshot = todosRef.current;
      setTodos((t) =>
        t.map((item) =>
          item.id === id ? { ...item, status: newStatus } : item
        )
      );
      try {
        await todoService.toggleComplete(id, todo.status);
      } catch (err) {
        setTodos(snapshot);
        toast.error('Failed to update todo');
        throw err;
      }
    },
    []
  );

  const reorder = useCallback(
    async (reorderedTodos: Todo[]) => {
      const snapshot = todosRef.current;
      const updates = reorderedTodos.map((t, i) => ({
        id: t.id,
        position: i * POSITION_GAP,
      }));
      setTodos(reorderedTodos.map((t, i) => ({ ...t, position: i * POSITION_GAP })));
      try {
        await todoService.reorderTodos(updates);
      } catch (err) {
        setTodos(snapshot);
        toast.error('Failed to reorder todos');
        throw err;
      }
    },
    []
  );

  return {
    todos,
    loading,
    error,
    createTodo,
    updateTodo,
    deleteTodo,
    toggleComplete,
    reorder,
    refetch: fetchTodos,
  };
}
