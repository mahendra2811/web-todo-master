'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useUIStore } from '@/stores/ui-store';
import { useTodoStore } from '@/stores/todo-store';
import { cn } from '@/lib/utils/cn';
import { TODO_PRIORITY } from '@/lib/utils/constants';
import type { Todo } from '@/types/todo';

export function SearchModal() {
  const open = useUIStore((s) => s.searchOpen);
  const setOpen = useUIStore((s) => s.setSearchOpen);
  const allTodos = useTodoStore((s) => s.todos);
  const lists = useTodoStore((s) => s.lists);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Flatten all todos
  const flatTodos = useMemo(() => {
    const result: (Todo & { listName: string })[] = [];
    for (const list of lists) {
      const todos = allTodos[list.id] || [];
      for (const todo of todos) {
        result.push({ ...todo, listName: list.name });
      }
    }
    return result;
  }, [allTodos, lists]);

  // Search results
  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();

    // Support operators: priority:high, status:completed, list:name
    let filtered = flatTodos;
    let textQuery = q;

    const priorityMatch = q.match(/priority:(\w+)/);
    if (priorityMatch) {
      filtered = filtered.filter((t) => t.priority === priorityMatch[1]);
      textQuery = textQuery.replace(priorityMatch[0], '').trim();
    }

    const statusMatch = q.match(/status:(\w+)/);
    if (statusMatch) {
      filtered = filtered.filter((t) => t.status === statusMatch[1]);
      textQuery = textQuery.replace(statusMatch[0], '').trim();
    }

    const listMatch = q.match(/list:(\S+)/);
    if (listMatch) {
      filtered = filtered.filter((t) =>
        t.listName.toLowerCase().includes(listMatch[1])
      );
      textQuery = textQuery.replace(listMatch[0], '').trim();
    }

    if (textQuery) {
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(textQuery) ||
          t.description?.toLowerCase().includes(textQuery)
      );
    }

    return filtered.slice(0, 20);
  }, [query, flatTodos]);

  // Also search lists
  const listResults = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    if (q.includes(':')) return []; // operator mode, skip list search
    return lists.filter((l) => l.name.toLowerCase().includes(q)).slice(0, 5);
  }, [query, lists]);

  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  function handleSelect(todo: Todo & { listName: string }) {
    router.push(`/dashboard/lists/${todo.list_id}`);
    setOpen(false);
  }

  function handleSelectList(listId: string) {
    router.push(`/dashboard/lists/${listId}`);
    setOpen(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    const totalResults = listResults.length + results.length;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, totalResults - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && totalResults > 0) {
      e.preventDefault();
      if (selectedIndex < listResults.length) {
        handleSelectList(listResults[selectedIndex].id);
      } else {
        const todo = results[selectedIndex - listResults.length];
        if (todo) handleSelect(todo);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-4 sm:pt-[15vh] bg-black/50 px-4 sm:px-0"
      onClick={(e) => {
        if (e.target === e.currentTarget) setOpen(false);
      }}
    >
      <div className="w-full max-w-lg rounded-xl bg-white dark:bg-gray-800 shadow-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
            placeholder="Search todos, lists... (try priority:high or status:completed)"
          />
          <kbd className="hidden sm:inline-block text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
            ESC
          </kbd>
        </div>

        {query.trim() && (
          <div className="max-h-80 overflow-y-auto p-2">
            {listResults.length === 0 && results.length === 0 && (
              <p className="px-3 py-4 text-sm text-gray-400 text-center">No results found</p>
            )}

            {listResults.length > 0 && (
              <div className="mb-2">
                <p className="px-3 py-1 text-xs font-semibold text-gray-400 uppercase">Lists</p>
                {listResults.map((list, i) => (
                  <button
                    key={list.id}
                    onClick={() => handleSelectList(list.id)}
                    className={cn(
                      'w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-left transition-colors',
                      selectedIndex === i ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-gray-50'
                    )}
                  >
                    <span className="h-3 w-3 rounded-full flex-shrink-0" style={{ backgroundColor: list.color }} />
                    <span>{list.name}</span>
                    <span className="ml-auto text-xs text-gray-400">{list.todo_count} todos</span>
                  </button>
                ))}
              </div>
            )}

            {results.length > 0 && (
              <div>
                <p className="px-3 py-1 text-xs font-semibold text-gray-400 uppercase">Todos</p>
                {results.map((todo, i) => {
                  const idx = i + listResults.length;
                  const priority = TODO_PRIORITY[todo.priority];
                  return (
                    <button
                      key={todo.id}
                      onClick={() => handleSelect(todo)}
                      className={cn(
                        'w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-left transition-colors',
                        selectedIndex === idx ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-gray-50'
                      )}
                    >
                      <span className={cn(
                        'h-2 w-2 rounded-full flex-shrink-0',
                        todo.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'
                      )} />
                      <span className={cn('truncate flex-1', todo.status === 'completed' && 'line-through text-gray-400')}>
                        {todo.title}
                      </span>
                      <span className={cn('text-xs px-1.5 py-0.5 rounded', priority.color)}>
                        {priority.label}
                      </span>
                      <span className="text-xs text-gray-400 truncate max-w-24">{todo.listName}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {!query.trim() && (
          <div className="p-4 text-center text-sm text-gray-400">
            <p>Type to search todos and lists</p>
            <p className="mt-1 text-xs">
              Operators: <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">priority:high</code>{' '}
              <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">status:completed</code>{' '}
              <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">list:work</code>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
