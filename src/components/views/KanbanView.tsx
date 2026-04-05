'use client';

import { useCallback } from 'react';
import { cn } from '@/lib/utils/cn';
import { TODO_STATUS, TODO_PRIORITY } from '@/lib/utils/constants';
import { formatDate, isOverdue } from '@/lib/utils/dates';
import type { Todo } from '@/types/todo';
import type { TodoStatus } from '@/lib/utils/constants';

interface KanbanViewProps {
  todos: Todo[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onSelect?: (todo: Todo) => void;
  onStatusChange: (id: string, status: TodoStatus) => void;
}

const COLUMNS: TodoStatus[] = ['pending', 'in_progress', 'completed'];

export function KanbanView({ todos, onToggle, onDelete, onSelect, onStatusChange }: KanbanViewProps) {
  const getColumnTodos = useCallback(
    (status: TodoStatus) => todos.filter((t) => t.status === status),
    [todos]
  );

  function handleDragStart(e: React.DragEvent, todoId: string) {
    e.dataTransfer.setData('text/plain', todoId);
    e.dataTransfer.effectAllowed = 'move';
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }

  function handleDrop(e: React.DragEvent, status: TodoStatus) {
    e.preventDefault();
    const todoId = e.dataTransfer.getData('text/plain');
    if (todoId) {
      onStatusChange(todoId, status);
    }
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:overflow-x-auto pb-4 min-h-[300px] sm:min-h-[400px]">
      {COLUMNS.map((status) => {
        const columnTodos = getColumnTodos(status);
        const statusInfo = TODO_STATUS[status];
        return (
          <div
            key={status}
            className="flex-shrink-0 w-full sm:w-64 lg:w-72 flex flex-col"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, status)}
          >
            <div className="flex items-center gap-2 mb-2 sm:mb-3 px-1">
              <span className={cn('text-xs font-semibold px-2 py-0.5 rounded', statusInfo.color)}>
                {statusInfo.label}
              </span>
              <span className="text-xs text-gray-400">{columnTodos.length}</span>
            </div>
            <div className="flex-1 space-y-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2 min-h-[120px] sm:min-h-[200px]">
              {columnTodos.map((todo) => {
                const priority = TODO_PRIORITY[todo.priority];
                const overdue = todo.due_date && todo.status !== 'completed' && isOverdue(todo.due_date);
                return (
                  <div
                    key={todo.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, todo.id)}
                    onClick={() => onSelect?.(todo)}
                    className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 cursor-grab active:cursor-grabbing hover:border-gray-300 dark:hover:border-gray-600 transition-colors group"
                  >
                    <p className={cn(
                      'text-sm font-medium mb-1',
                      todo.status === 'completed' && 'line-through text-gray-400'
                    )}>
                      {todo.is_pinned && <span className="mr-1">📌</span>}
                      {todo.title}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={cn('text-xs px-1.5 py-0.5 rounded', priority.color)}>
                        {priority.label}
                      </span>
                      {todo.due_date && (
                        <span className={cn('text-xs', overdue ? 'text-red-500 font-medium' : 'text-gray-400')}>
                          {formatDate(todo.due_date)}
                        </span>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); onDelete(todo.id); }}
                        className="ml-auto p-1 text-gray-300 hover:text-red-500 sm:opacity-0 sm:group-hover:opacity-100 transition-all"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    {/* Mobile: tap status change buttons */}
                    <div className="flex gap-1 mt-2 sm:hidden">
                      {COLUMNS.filter((s) => s !== status).map((s) => (
                        <button
                          key={s}
                          onClick={(e) => { e.stopPropagation(); onStatusChange(todo.id, s); }}
                          className={cn('text-xs px-2 py-1 rounded', TODO_STATUS[s].color)}
                        >
                          → {TODO_STATUS[s].label}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
              {columnTodos.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-6 sm:py-8">
                  {typeof window !== 'undefined' && 'ontouchstart' in window ? 'No items' : 'Drop here'}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
