'use client';

import { useState } from 'react';
import { useSubtasks } from '@/hooks/use-subtasks';
import { cn } from '@/lib/utils/cn';

interface SubtaskListProps {
  todoId: string;
}

export function SubtaskList({ todoId }: SubtaskListProps) {
  const { subtasks, loading, createSubtask, toggleSubtask, deleteSubtask } = useSubtasks(todoId);
  const [newTitle, setNewTitle] = useState('');

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    await createSubtask(newTitle.trim());
    setNewTitle('');
  }

  if (loading) return <p className="text-sm text-gray-400">Loading...</p>;

  return (
    <div className="space-y-1">
      {subtasks.map((subtask) => (
        <div key={subtask.id} className="group flex items-center gap-3 py-1">
          <button
            onClick={() => toggleSubtask(subtask.id)}
            className={cn(
              'flex h-6 w-6 flex-shrink-0 items-center justify-center rounded border transition-colors',
              subtask.is_completed
                ? 'border-green-500 bg-green-500 text-white'
                : 'border-gray-300 hover:border-indigo-500'
            )}
          >
            {subtask.is_completed && (
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
          <span
            className={cn(
              'flex-1 text-sm',
              subtask.is_completed ? 'text-gray-400 line-through' : 'text-gray-700'
            )}
          >
            {subtask.title}
          </span>
          <button
            onClick={() => deleteSubtask(subtask.id)}
            className="p-1 text-gray-300 hover:text-red-500 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
      <form onSubmit={handleAdd} className="flex items-center gap-3 py-1">
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          className="flex-1 text-base sm:text-sm text-gray-700 outline-none placeholder:text-gray-400 min-h-[44px] sm:min-h-0"
          placeholder="Add subtask..."
        />
      </form>
    </div>
  );
}
