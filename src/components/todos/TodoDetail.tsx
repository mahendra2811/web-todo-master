'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { SubtaskList } from '@/components/todos/SubtaskList';
import { TODO_PRIORITY, TODO_STATUS } from '@/lib/utils/constants';
import { formatDateTime } from '@/lib/utils/dates';
import type { Todo } from '@/types/todo';
import type { UpdateTodoInput } from '@/lib/validators/todo';
import type { TodoPriority, TodoStatus } from '@/lib/utils/constants';

interface TodoDetailProps {
  todo: Todo | null;
  open: boolean;
  onClose: () => void;
  onUpdate: (id: string, input: UpdateTodoInput) => Promise<void>;
}

export function TodoDetail({ todo, open, onClose, onUpdate }: TodoDetailProps) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  if (!todo) return null;

  const priority = TODO_PRIORITY[todo.priority];
  const status = TODO_STATUS[todo.status];

  function startEdit() {
    setTitle(todo!.title);
    setDescription(todo!.description || '');
    setEditing(true);
  }

  async function saveEdit() {
    await onUpdate(todo!.id, { title, description: description || null });
    setEditing(false);
  }

  return (
    <Modal open={open} onClose={onClose} title="Todo Details" className="max-w-lg">
      <div className="space-y-4">
        {editing ? (
          <div className="space-y-2">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
              rows={3}
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={saveEdit}>Save</Button>
              <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
            </div>
          </div>
        ) : (
          <div>
            <h3 className="text-base font-semibold text-gray-900">{todo.title}</h3>
            {todo.description && (
              <p className="mt-1 text-sm text-gray-600">{todo.description}</p>
            )}
            <Button size="sm" variant="ghost" onClick={startEdit} className="mt-2">
              Edit
            </Button>
          </div>
        )}

        <div className="flex items-center gap-2 flex-wrap">
          <Badge className={priority.color}>{priority.label}</Badge>
          <Badge className={status.color}>{status.label}</Badge>
        </div>

        <div className="flex gap-3 flex-wrap">
          <select
            value={todo.priority}
            onChange={(e) => onUpdate(todo.id, { priority: e.target.value as TodoPriority })}
            className="rounded-md border border-gray-200 px-2 py-1 text-xs outline-none"
          >
            {Object.entries(TODO_PRIORITY).map(([key, val]) => (
              <option key={key} value={key}>{val.label}</option>
            ))}
          </select>
          <select
            value={todo.status}
            onChange={(e) => onUpdate(todo.id, { status: e.target.value as TodoStatus })}
            className="rounded-md border border-gray-200 px-2 py-1 text-xs outline-none"
          >
            {Object.entries(TODO_STATUS).map(([key, val]) => (
              <option key={key} value={key}>{val.label}</option>
            ))}
          </select>
        </div>

        <div className="text-xs text-gray-400 space-y-1">
          <p>Created: {formatDateTime(todo.created_at)}</p>
          {todo.completed_at && <p>Completed: {formatDateTime(todo.completed_at)}</p>}
        </div>

        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Subtasks</h4>
          <SubtaskList todoId={todo.id} />
        </div>
      </div>
    </Modal>
  );
}
