'use client';

import { useState } from 'react';
import { useParams, useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useTodos } from '@/hooks/use-todos';
import { useLists } from '@/hooks/use-lists';
import { TodoItem } from '@/components/todos/TodoItem';
import { TodoForm } from '@/components/todos/TodoForm';
import { TodoDetail } from '@/components/todos/TodoDetail';
import { EmptyState } from '@/components/common/EmptyState';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import type { Todo } from '@/types/todo';
import type { TodoStatus, TodoPriority } from '@/lib/utils/constants';

export default function ListDetailPage() {
  const { listId } = useParams<{ listId: string }>();
  const searchParams = useSearchParams();
  const { todos, loading, createTodo, updateTodo, deleteTodo, toggleComplete } = useTodos(listId);
  const { lists } = useLists();
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);

  const list = lists.find((l) => l.id === listId);

  // Filtering from URL params
  const statusFilter = searchParams.get('status') as TodoStatus | null;
  const priorityFilter = searchParams.get('priority') as TodoPriority | null;
  const sortBy = searchParams.get('sort') || 'position';

  let filteredTodos = [...todos];
  if (statusFilter) filteredTodos = filteredTodos.filter((t) => t.status === statusFilter);
  if (priorityFilter) filteredTodos = filteredTodos.filter((t) => t.priority === priorityFilter);

  if (sortBy === 'due_date') {
    filteredTodos.sort((a, b) => {
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    });
  } else if (sortBy === 'priority') {
    const order = { urgent: 0, high: 1, medium: 2, low: 3 };
    filteredTodos.sort((a, b) => order[a.priority] - order[b.priority]);
  } else if (sortBy === 'created') {
    filteredTodos.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <div className="flex items-center gap-3">
          {list && (
            <span
              className="h-4 w-4 rounded-full flex-shrink-0"
              style={{ backgroundColor: list.color }}
            />
          )}
          <h1 className="text-xl font-bold text-gray-900">
            {list?.name || 'List'}
          </h1>
        </div>
        {list?.description && (
          <p className="mt-1 text-sm text-gray-500">{list.description}</p>
        )}
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-2 mb-4 flex-wrap text-xs">
        <FilterLink label="All" param="status" value={null} current={statusFilter} />
        <FilterLink label="Pending" param="status" value="pending" current={statusFilter} />
        <FilterLink label="In Progress" param="status" value="in_progress" current={statusFilter} />
        <FilterLink label="Completed" param="status" value="completed" current={statusFilter} />
        <span className="text-gray-300">|</span>
        <FilterLink label="Position" param="sort" value="position" current={sortBy} />
        <FilterLink label="Due Date" param="sort" value="due_date" current={sortBy} />
        <FilterLink label="Priority" param="sort" value="priority" current={sortBy} />
      </div>

      <div className="space-y-2 mb-4">
        {filteredTodos.length === 0 ? (
          <EmptyState title="No todos" description="Add your first todo below." />
        ) : (
          filteredTodos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={toggleComplete}
              onDelete={deleteTodo}
              onSelect={setSelectedTodo}
            />
          ))
        )}
      </div>

      <TodoForm listId={listId} onSubmit={createTodo} />

      <TodoDetail
        todo={selectedTodo}
        open={!!selectedTodo}
        onClose={() => setSelectedTodo(null)}
        onUpdate={updateTodo}
      />
    </div>
  );
}

function FilterLink({
  label,
  param,
  value,
  current,
}: {
  label: string;
  param: string;
  value: string | null;
  current: string | null;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isActive = value === current || (value === 'position' && current === 'position' && param === 'sort');

  function handleClick() {
    const params = new URLSearchParams(searchParams.toString());
    if (value === null || (param === 'sort' && value === 'position')) {
      params.delete(param);
    } else {
      params.set(param, value);
    }
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  return (
    <button
      onClick={handleClick}
      className={`rounded-full px-2.5 py-1 transition-colors ${
        isActive
          ? 'bg-indigo-100 text-indigo-700 font-medium'
          : 'text-gray-500 hover:bg-gray-100'
      }`}
    >
      {label}
    </button>
  );
}
