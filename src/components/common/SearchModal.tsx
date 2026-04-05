'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
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
  const resultsRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 150);
    return () => clearTimeout(timer);
  }, [query]);

  const flatTodos = useMemo(() => {
    const listNameMap = new Map(lists.map((l) => [l.id, l.name]));
    const result: (Todo & { listName: string })[] = [];
    for (const list of lists) {
      const todos = allTodos[list.id] || [];
      for (const todo of todos) {
        result.push({ ...todo, listName: listNameMap.get(list.id) || '' });
      }
    }
    return result;
  }, [allTodos, lists]);

  const results = useMemo(() => {
    if (!debouncedQuery.trim()) return [];
    const q = debouncedQuery.toLowerCase();

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
  }, [debouncedQuery, flatTodos]);

  const listResults = useMemo(() => {
    if (!debouncedQuery.trim()) return [];
    const q = debouncedQuery.toLowerCase();
    if (q.includes(':')) return [];
    return lists.filter((l) => l.name.toLowerCase().includes(q)).slice(0, 5);
  }, [debouncedQuery, lists]);

  const totalResults = listResults.length + results.length;

  useEffect(() => {
    if (open) {
      setQuery('');
      setDebouncedQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Scroll selected item into view
  useEffect(() => {
    if (!resultsRef.current) return;
    const selected = resultsRef.current.querySelector('[data-selected="true"]');
    selected?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  const handleSelect = useCallback((todo: Todo & { listName: string }) => {
    router.push(`/dashboard/lists/${todo.list_id}`);
    setOpen(false);
  }, [router, setOpen]);

  const handleSelectList = useCallback((listId: string) => {
    router.push(`/dashboard/lists/${listId}`);
    setOpen(false);
  }, [router, setOpen]);

  function handleKeyDown(e: React.KeyboardEvent) {
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

  // Highlight matching text
  function highlightMatch(text: string) {
    const q = debouncedQuery.replace(/\w+:\w+/g, '').trim();
    if (!q) return text;
    const idx = text.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <span className="text-indigo-600 font-semibold">{text.slice(idx, idx + q.length)}</span>
        {text.slice(idx + q.length)}
      </>
    );
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-4 sm:pt-[12vh] px-4 sm:px-0"
      onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative w-full max-w-xl rounded-2xl bg-white shadow-2xl ring-1 ring-gray-200 overflow-hidden">
        {/* Decorative top gradient bar */}
        <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

        {/* Search input */}
        <div className="flex items-center gap-3 px-5 py-4">
          <div className="flex-shrink-0 h-9 w-9 rounded-xl bg-indigo-50 flex items-center justify-center">
            <svg className="h-5 w-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-base outline-none placeholder:text-gray-400 text-gray-900"
            placeholder="Search todos and lists..."
          />
          {query && (
            <button
              onClick={() => { setQuery(''); inputRef.current?.focus(); }}
              className="flex-shrink-0 h-7 w-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <svg className="h-3.5 w-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          <kbd className="hidden sm:flex items-center text-[11px] font-medium text-gray-400 bg-gray-100 px-2 py-1 rounded-lg ring-1 ring-gray-200">
            ESC
          </kbd>
        </div>

        <div className="h-px bg-gray-100" />

        {/* Results */}
        {query.trim() && (
          <div ref={resultsRef} className="max-h-[50vh] overflow-y-auto overscroll-contain p-2">
            {totalResults === 0 && (
              <div className="flex flex-col items-center py-10 text-gray-400">
                <svg className="h-10 w-10 mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                </svg>
                <p className="text-sm font-medium">No results found</p>
                <p className="text-xs mt-1">Try a different search term or filter</p>
              </div>
            )}

            {/* List results */}
            {listResults.length > 0 && (
              <div className="mb-1">
                <div className="flex items-center gap-2 px-3 py-2">
                  <svg className="h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
                  </svg>
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Lists</span>
                </div>
                {listResults.map((list, i) => (
                  <button
                    key={list.id}
                    onClick={() => handleSelectList(list.id)}
                    data-selected={selectedIndex === i}
                    className={cn(
                      'w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-left transition-all group',
                      selectedIndex === i
                        ? 'bg-indigo-50 ring-1 ring-indigo-100'
                        : 'hover:bg-gray-50'
                    )}
                  >
                    <span
                      className="h-3.5 w-3.5 rounded-md flex-shrink-0 ring-2 ring-white shadow-sm"
                      style={{ backgroundColor: list.color }}
                    />
                    <span className={cn(
                      'font-medium flex-1',
                      selectedIndex === i ? 'text-indigo-700' : 'text-gray-700'
                    )}>
                      {highlightMatch(list.name)}
                    </span>
                    <span className={cn(
                      'text-xs px-2 py-0.5 rounded-full',
                      selectedIndex === i
                        ? 'bg-indigo-100 text-indigo-600'
                        : 'bg-gray-100 text-gray-500'
                    )}>
                      {list.todo_count} todos
                    </span>
                    <svg className={cn(
                      'h-4 w-4 transition-transform',
                      selectedIndex === i ? 'text-indigo-400 translate-x-0' : 'text-transparent -translate-x-1'
                    )} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </button>
                ))}
              </div>
            )}

            {/* Todo results */}
            {results.length > 0 && (
              <div>
                {listResults.length > 0 && <div className="h-px bg-gray-100 my-1 mx-3" />}
                <div className="flex items-center gap-2 px-3 py-2">
                  <svg className="h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Todos</span>
                  <span className="text-[11px] text-gray-300 ml-auto">{results.length} result{results.length !== 1 ? 's' : ''}</span>
                </div>
                {results.map((todo, i) => {
                  const idx = i + listResults.length;
                  const priority = TODO_PRIORITY[todo.priority];
                  const isCompleted = todo.status === 'completed';
                  return (
                    <button
                      key={todo.id}
                      onClick={() => handleSelect(todo)}
                      data-selected={selectedIndex === idx}
                      className={cn(
                        'w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-left transition-all group',
                        selectedIndex === idx
                          ? 'bg-indigo-50 ring-1 ring-indigo-100'
                          : 'hover:bg-gray-50'
                      )}
                    >
                      {/* Status indicator */}
                      <span className={cn(
                        'flex-shrink-0 h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors',
                        isCompleted
                          ? 'border-green-500 bg-green-500'
                          : selectedIndex === idx
                            ? 'border-indigo-300'
                            : 'border-gray-300'
                      )}>
                        {isCompleted && (
                          <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </span>

                      {/* Title + list name */}
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          'truncate font-medium',
                          isCompleted ? 'line-through text-gray-400' : selectedIndex === idx ? 'text-indigo-700' : 'text-gray-700'
                        )}>
                          {highlightMatch(todo.title)}
                        </p>
                        <p className="text-xs text-gray-400 truncate mt-0.5">
                          {todo.listName}
                          {todo.description && ` \u00B7 ${todo.description.slice(0, 50)}`}
                        </p>
                      </div>

                      {/* Priority badge */}
                      <span className={cn('text-[11px] font-medium px-2 py-0.5 rounded-full flex-shrink-0', priority.color)}>
                        {priority.label}
                      </span>

                      {/* Arrow */}
                      <svg className={cn(
                        'h-4 w-4 flex-shrink-0 transition-transform',
                        selectedIndex === idx ? 'text-indigo-400 translate-x-0' : 'text-transparent -translate-x-1'
                      )} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Empty state — search tips */}
        {!query.trim() && (
          <div className="px-5 py-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                { operator: 'priority:', example: 'high', icon: 'M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z' },
                { operator: 'status:', example: 'completed', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
                { operator: 'list:', example: 'work', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
              ].map(({ operator, example, icon }) => (
                <button
                  key={operator}
                  onClick={() => { setQuery(`${operator}${example}`); inputRef.current?.focus(); }}
                  className="group flex items-center gap-2.5 rounded-xl px-3 py-3 text-left transition-all bg-gray-50 hover:bg-indigo-50 hover:ring-1 hover:ring-indigo-100"
                >
                  <svg className="h-4 w-4 text-gray-400 group-hover:text-indigo-500 flex-shrink-0 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
                  </svg>
                  <span className="text-xs">
                    <span className="font-mono text-indigo-500">{operator}</span>
                    <span className="text-gray-500">{example}</span>
                  </span>
                </button>
              ))}
            </div>
            <p className="text-center text-[11px] text-gray-400 mt-4">
              Use arrow keys to navigate, Enter to select
            </p>
          </div>
        )}

        {/* Footer */}
        {query.trim() && totalResults > 0 && (
          <>
            <div className="h-px bg-gray-100" />
            <div className="flex items-center justify-between px-4 py-2.5 text-[11px] text-gray-400">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="bg-gray-100 px-1.5 py-0.5 rounded font-mono text-gray-500 ring-1 ring-gray-200">&uarr;</kbd>
                  <kbd className="bg-gray-100 px-1.5 py-0.5 rounded font-mono text-gray-500 ring-1 ring-gray-200">&darr;</kbd>
                  navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="bg-gray-100 px-1.5 py-0.5 rounded font-mono text-gray-500 ring-1 ring-gray-200">&crarr;</kbd>
                  open
                </span>
              </div>
              <span>{totalResults} result{totalResults !== 1 ? 's' : ''}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
