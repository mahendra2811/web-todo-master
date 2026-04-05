'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { createTodoSchema } from '@/lib/validators/todo';
import { toast } from 'sonner';
import type { TodoPriority } from '@/lib/utils/constants';

interface TodoFormProps {
  listId: string;
  onSubmit: (input: { title: string; description?: string; priority: TodoPriority; due_date?: string | null }) => Promise<unknown>;
  onCancel?: () => void;
}

export function TodoForm({ listId, onSubmit, onCancel }: TodoFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TodoPriority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const input = {
      title,
      description: description || undefined,
      priority,
      due_date: dueDate ? new Date(dueDate).toISOString() : undefined,
      list_id: listId,
    };
    const result = createTodoSchema.safeParse(input);
    if (!result.success) {
      toast.error(result.error.issues[0].message);
      return;
    }
    setLoading(true);
    try {
      await onSubmit({ title, description: description || undefined, priority, due_date: dueDate ? new Date(dueDate).toISOString() : null });
      setTitle('');
      setDescription('');
      setPriority('medium');
      setDueDate('');
      setExpanded(false);
    } catch {
      // Error handled by hook
    } finally {
      setLoading(false);
    }
  }

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="w-full rounded-lg border-2 border-dashed border-gray-200 px-4 py-3 text-sm text-gray-400 hover:border-indigo-300 hover:text-indigo-500 active:bg-gray-50 transition-colors min-h-[44px]"
      >
        + Add a todo
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-gray-200 bg-white p-3 sm:p-4 space-y-3">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full text-base sm:text-sm font-medium text-gray-900 outline-none placeholder:text-gray-400"
        placeholder="What needs to be done?"
        autoFocus
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full text-base sm:text-sm text-gray-600 outline-none placeholder:text-gray-400 resize-none"
        placeholder="Add a description..."
        rows={2}
      />
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as TodoPriority)}
          className="rounded-md border border-gray-200 px-3 py-2 sm:px-2 sm:py-1 text-sm sm:text-xs text-gray-600 outline-none min-h-[44px] sm:min-h-0"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="rounded-md border border-gray-200 px-3 py-2 sm:px-2 sm:py-1 text-sm sm:text-xs text-gray-600 outline-none min-h-[44px] sm:min-h-0"
        />
      </div>
      <div className="flex justify-end gap-2 pt-1">
        <Button
          variant="ghost"
          size="sm"
          type="button"
          onClick={() => {
            setExpanded(false);
            onCancel?.();
          }}
        >
          Cancel
        </Button>
        <Button size="sm" type="submit" loading={loading}>
          Add
        </Button>
      </div>
    </form>
  );
}
