'use client';

import { useState } from 'react';
import { useParams, useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useTodos } from '@/hooks/use-todos';
import { useLists } from '@/hooks/use-lists';
import type { ViewMode } from '@/stores/ui-store';
import { TodoItem } from '@/components/todos/TodoItem';
import { TodoForm } from '@/components/todos/TodoForm';
import { TodoDetail } from '@/components/todos/TodoDetail';
import { KanbanView } from '@/components/views/KanbanView';
import { CalendarView } from '@/components/views/CalendarView';
import { EmptyState } from '@/components/common/EmptyState';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EditListModal } from '@/components/lists/EditListModal';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils/cn';
import { toast } from 'sonner';
import type { Todo } from '@/types/todo';
import type { TodoStatus, TodoPriority } from '@/lib/utils/constants';

export default function ListDetailPage() {
  const { listId } = useParams<{ listId: string }>();
  const searchParams = useSearchParams();
  const { todos, loading, createTodo, updateTodo, deleteTodo, toggleComplete } = useTodos(listId);
  const { lists, updateList } = useLists();
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [editModalOpen, setEditModalOpen] = useState(false);

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

  async function handleStatusChange(id: string, status: TodoStatus) {
    await updateTodo(id, { status });
  }

  async function handleDateDrop(todoId: string, date: string) {
    await updateTodo(todoId, { due_date: date });
    toast.success('Due date updated');
  }

  async function handleArchiveToggle() {
    if (!list) return;
    await updateList(listId, { is_archived: !list.is_archived });
    toast.success(list.is_archived ? 'List unarchived' : 'List archived');
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className={viewMode === 'list' ? 'max-w-2xl' : ''}>
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-0">
          {list && (
            <span className="text-xl">
              {list.icon && list.icon !== 'list' ? list.icon : (
                <span className="inline-block h-4 w-4 rounded-full" style={{ backgroundColor: list.color }} />
              )}
            </span>
          )}
          <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
            {list?.name || 'List'}
          </h1>
          {list && (
            <button
              onClick={() => setEditModalOpen(true)}
              className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors flex-shrink-0"
              title="Edit list"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
              </svg>
            </button>
          )}
          {list?.is_archived && (
            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded flex-shrink-0">Archived</span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-2">
          {/* View mode toggle */}
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            {(['list', 'kanban', 'calendar'] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={cn(
                  'px-2.5 py-1.5 sm:py-1 text-xs rounded-md transition-colors capitalize',
                  viewMode === mode
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                )}
              >
                {mode}
              </button>
            ))}
          </div>
          {/* Archive button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleArchiveToggle}
            title={list?.is_archived ? 'Unarchive' : 'Archive'}
            className="ml-auto"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
          </Button>
        </div>
        {list?.description && (
          <p className="mt-1 text-sm text-gray-500">{list.description}</p>
        )}
      </div>

      {/* Filter bar (only in list view) */}
      {viewMode === 'list' && (
        <div className="flex items-center gap-1.5 sm:gap-2 mb-4 flex-wrap">
          <FilterLink label="All" param="status" value={null} current={statusFilter} />
          <FilterLink label="Pending" param="status" value="pending" current={statusFilter} />
          <FilterLink label="In Progress" param="status" value="in_progress" current={statusFilter} />
          <FilterLink label="Completed" param="status" value="completed" current={statusFilter} />
          <span className="text-gray-300">|</span>
          <FilterLink label="Position" param="sort" value="position" current={sortBy} />
          <FilterLink label="Due Date" param="sort" value="due_date" current={sortBy} />
          <FilterLink label="Priority" param="sort" value="priority" current={sortBy} />
        </div>
      )}

      {/* Views */}
      {viewMode === 'list' && (
        <>
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
        </>
      )}

      {viewMode === 'kanban' && (
        <KanbanView
          todos={filteredTodos}
          onToggle={toggleComplete}
          onDelete={deleteTodo}
          onSelect={setSelectedTodo}
          onStatusChange={handleStatusChange}
        />
      )}

      {viewMode === 'calendar' && (
        <CalendarView
          todos={filteredTodos}
          onSelect={setSelectedTodo}
          onDateDrop={handleDateDrop}
        />
      )}

      <TodoDetail
        todo={selectedTodo}
        open={!!selectedTodo}
        onClose={() => setSelectedTodo(null)}
        onUpdate={updateTodo}
      />

      {list && (
        <EditListModal
          open={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          list={list}
          onUpdate={updateList}
        />
      )}
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
      className={`rounded-full px-3 py-1.5 sm:px-2.5 sm:py-1 text-xs transition-colors ${
        isActive
          ? 'bg-indigo-100 text-indigo-700 font-medium'
          : 'text-gray-500 hover:bg-gray-100'
      }`}
    >
      {label}
    </button>
  );
}
