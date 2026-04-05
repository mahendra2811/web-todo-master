'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useUIStore } from '@/stores/ui-store';
import { useTodoStore } from '@/stores/todo-store';
import { todoService } from '@/services/todo-service';
import { useAuthStore } from '@/stores/auth-store';
import { toast } from 'sonner';
import { POSITION_GAP } from '@/lib/utils/constants';
import type { TodoPriority } from '@/lib/utils/constants';

export function QuickAdd() {
  const open = useUIStore((s) => s.quickAddOpen);
  const setOpen = useUIStore((s) => s.setQuickAddOpen);
  const lists = useTodoStore((s) => s.lists);
  const user = useAuthStore((s) => s.user);

  const [title, setTitle] = useState('');
  const [listId, setListId] = useState('');
  const [priority, setPriority] = useState<TodoPriority>('medium');
  const [loading, setLoading] = useState(false);

  function handleClose() {
    setOpen(false);
    setTitle('');
    setPriority('medium');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !user) return;

    const targetListId = listId || lists[0]?.id;
    if (!targetListId) {
      toast.error('Create a list first');
      return;
    }

    setLoading(true);
    try {
      const cachedTodos = useTodoStore.getState().todos[targetListId] || [];
      const position = cachedTodos.length * POSITION_GAP;
      await todoService.createTodo(
        { title: title.trim(), priority, list_id: targetListId, position },
        user.id
      );
      toast.success('Todo added');
      handleClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create todo');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={handleClose} title="Quick Add Todo">
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-transparent focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
          placeholder="What needs to be done?"
          autoFocus
        />
        <div className="flex items-center gap-3">
          <select
            value={listId || lists[0]?.id || ''}
            onChange={(e) => setListId(e.target.value)}
            className="flex-1 rounded-md border border-gray-200 dark:border-gray-600 px-2 py-1.5 text-xs bg-transparent outline-none"
          >
            {lists.map((l) => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as TodoPriority)}
            className="rounded-md border border-gray-200 dark:border-gray-600 px-2 py-1.5 text-xs bg-transparent outline-none"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
        <div className="flex justify-between items-center pt-2">
          <span className="text-xs text-gray-400">
            {navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'}+N to open
          </span>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" type="button" onClick={handleClose}>
              Cancel
            </Button>
            <Button size="sm" type="submit" loading={loading}>
              Add
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
