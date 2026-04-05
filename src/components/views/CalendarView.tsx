'use client';

import { useState, useMemo } from 'react';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  parseISO,
} from 'date-fns';
import { cn } from '@/lib/utils/cn';
import { TODO_PRIORITY } from '@/lib/utils/constants';
import type { Todo } from '@/types/todo';

interface CalendarViewProps {
  todos: Todo[];
  onSelect?: (todo: Todo) => void;
  onDateDrop?: (todoId: string, date: string) => void;
}

export function CalendarView({ todos, onSelect, onDateDrop }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 0 });
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const todosByDate = useMemo(() => {
    const map = new Map<string, Todo[]>();
    for (const todo of todos) {
      if (!todo.due_date) continue;
      const dateKey = format(parseISO(todo.due_date), 'yyyy-MM-dd');
      const existing = map.get(dateKey) || [];
      existing.push(todo);
      map.set(dateKey, existing);
    }
    return map;
  }, [todos]);

  const unscheduled = useMemo(
    () => todos.filter((t) => !t.due_date && t.status !== 'completed'),
    [todos]
  );

  function handleDragStart(e: React.DragEvent, todoId: string) {
    e.dataTransfer.setData('text/plain', todoId);
    e.dataTransfer.effectAllowed = 'move';
  }

  function handleDrop(e: React.DragEvent, date: Date) {
    e.preventDefault();
    const todoId = e.dataTransfer.getData('text/plain');
    if (todoId && onDateDrop) {
      onDateDrop(todoId, date.toISOString());
    }
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }

  return (
    <div className="flex flex-col md:flex-row gap-4">
      {/* Calendar Grid */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-2 rounded hover:bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h3 className="text-sm font-semibold">
            {format(currentMonth, 'MMMM yyyy')}
          </h3>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-2 rounded hover:bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-px mb-1">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <div key={i} className="text-xs font-medium text-gray-400 text-center py-1">
              <span className="sm:hidden">{d}</span>
              <span className="hidden sm:inline">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i]}</span>
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-px bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
          {days.map((day) => {
            const dateKey = format(day, 'yyyy-MM-dd');
            const dayTodos = todosByDate.get(dateKey) || [];
            const inMonth = isSameMonth(day, currentMonth);
            const today = isToday(day);

            return (
              <div
                key={dateKey}
                className={cn(
                  'min-h-[52px] sm:min-h-[80px] bg-white p-0.5 sm:p-1',
                  !inMonth && 'opacity-40'
                )}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, day)}
              >
                <div className={cn(
                  'text-xs font-medium mb-0.5 h-5 w-5 flex items-center justify-center rounded-full mx-auto sm:mx-0',
                  today && 'bg-indigo-500 text-white',
                  !today && 'text-gray-600'
                )}>
                  {format(day, 'd')}
                </div>
                <div className="space-y-0.5">
                  {dayTodos.slice(0, 2).map((todo) => {
                    const priority = TODO_PRIORITY[todo.priority];
                    return (
                      <button
                        key={todo.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, todo.id)}
                        onClick={() => onSelect?.(todo)}
                        className={cn(
                          'w-full text-left rounded px-0.5 sm:px-1 py-0.5',
                          priority.color,
                          todo.status === 'completed' && 'line-through opacity-50'
                        )}
                      >
                        <span className="text-[10px] sm:text-xs truncate block">{todo.title}</span>
                      </button>
                    );
                  })}
                  {dayTodos.length > 2 && (
                    <span className="text-[10px] sm:text-xs text-gray-400 px-0.5">+{dayTodos.length - 2}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Unscheduled sidebar — hidden on mobile, shown below on tablet+ */}
      {unscheduled.length > 0 && (
        <div className="w-full md:w-48 flex-shrink-0">
          <h4 className="text-xs font-semibold text-gray-400 uppercase mb-2">Unscheduled</h4>
          <div className="flex md:flex-col gap-1 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0">
            {unscheduled.slice(0, 15).map((todo) => (
              <div
                key={todo.id}
                draggable
                onDragStart={(e) => handleDragStart(e, todo.id)}
                onClick={() => onSelect?.(todo)}
                className="text-xs bg-gray-50 rounded px-2 py-1.5 cursor-grab active:cursor-grabbing truncate border border-gray-200 flex-shrink-0 min-w-[120px] md:min-w-0"
              >
                {todo.title}
              </div>
            ))}
            {unscheduled.length > 15 && (
              <span className="text-xs text-gray-400 flex-shrink-0">+{unscheduled.length - 15} more</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
