'use client';

import { cn } from '@/lib/utils/cn';
import { Badge } from '@/components/ui/Badge';
import { TODO_PRIORITY } from '@/lib/utils/constants';
import { formatDate, isOverdue } from '@/lib/utils/dates';
import type { Todo } from '@/types/todo';

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onSelect?: (todo: Todo) => void;
}

export function TodoItem({ todo, onToggle, onDelete, onSelect }: TodoItemProps) {
  const isComplete = todo.status === 'completed';
  const overdue = todo.due_date && !isComplete && isOverdue(todo.due_date);
  const priority = TODO_PRIORITY[todo.priority];

  return (
    <div
      className={cn(
        'group flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-3 sm:p-3 transition-colors hover:border-gray-300 active:bg-gray-50',
        isComplete && 'opacity-60'
      )}
    >
      <button
        onClick={() => onToggle(todo.id)}
        className={cn(
          'mt-0.5 flex h-6 w-6 sm:h-5 sm:w-5 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors',
          isComplete
            ? 'border-green-500 bg-green-500 text-white'
            : 'border-gray-300 hover:border-indigo-500'
        )}
      >
        {isComplete && (
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      <div
        className="flex-1 min-w-0 cursor-pointer"
        onClick={() => onSelect?.(todo)}
      >
        <p
          className={cn(
            'text-sm font-medium text-gray-900',
            isComplete && 'line-through text-gray-500'
          )}
        >
          {todo.is_pinned && <span className="mr-1">📌</span>}
          {todo.title}
        </p>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <Badge className={priority.color}>{priority.label}</Badge>
          {todo.due_date && (
            <span
              className={cn(
                'text-xs',
                overdue ? 'text-red-500 font-medium' : 'text-gray-400'
              )}
            >
              {formatDate(todo.due_date)}
            </span>
          )}
        </div>
      </div>

      <button
        onClick={() => onDelete(todo.id)}
        className="flex-shrink-0 p-1 text-gray-300 hover:text-red-500 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  );
}
