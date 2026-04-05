import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Todo } from '@/types/todo';
import type { ListWithCounts } from '@/types/list';

interface PendingAction {
  id: string;
  type: 'create' | 'update' | 'delete';
  table: 'todos' | 'lists' | 'subtasks';
  data: Record<string, unknown>;
  timestamp: number;
}

interface TodoState {
  lists: ListWithCounts[];
  todos: Record<string, Todo[]>;
  offlineQueue: PendingAction[];
  isOnline: boolean;
  listsLoading: boolean;
  setLists: (lists: ListWithCounts[]) => void;
  addList: (list: ListWithCounts) => void;
  updateList: (id: string, updates: Partial<ListWithCounts>) => void;
  removeList: (id: string) => void;
  setListsLoading: (loading: boolean) => void;
  setTodos: (listId: string, todos: Todo[]) => void;
  addToQueue: (action: PendingAction) => void;
  removeFromQueue: (id: string) => void;
  setOnline: (online: boolean) => void;
}

export const useTodoStore = create<TodoState>()(
  persist(
    (set) => ({
      lists: [],
      todos: {},
      offlineQueue: [],
      isOnline: true,
      listsLoading: true,
      setLists: (lists) => set({ lists, listsLoading: false }),
      addList: (list) =>
        set((state) => ({ lists: [...state.lists, list] })),
      updateList: (id, updates) =>
        set((state) => ({
          lists: state.lists.map((l) => (l.id === id ? { ...l, ...updates } : l)),
        })),
      removeList: (id) =>
        set((state) => ({
          lists: state.lists.filter((l) => l.id !== id),
        })),
      setListsLoading: (listsLoading) => set({ listsLoading }),
      setTodos: (listId, todos) =>
        set((state) => ({
          todos: { ...state.todos, [listId]: todos },
        })),
      addToQueue: (action) =>
        set((state) => ({
          offlineQueue: [...state.offlineQueue, action],
        })),
      removeFromQueue: (id) =>
        set((state) => ({
          offlineQueue: state.offlineQueue.filter((a) => a.id !== id),
        })),
      setOnline: (isOnline) => set({ isOnline }),
    }),
    {
      name: 'supatodo-store',
      partialize: (state) => ({
        lists: state.lists,
        todos: state.todos,
        offlineQueue: state.offlineQueue,
      }),
    }
  )
);
