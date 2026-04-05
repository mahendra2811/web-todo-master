'use client';

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TodoItem } from './TodoItem';
import type { Todo } from '@/types/todo';

interface SortableTodoListProps {
  todos: Todo[];
  onReorder: (reorderedTodos: Todo[]) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onSelect?: (todo: Todo) => void;
}

export function SortableTodoList({
  todos,
  onReorder,
  onToggle,
  onDelete,
  onSelect,
}: SortableTodoListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = todos.findIndex((t) => t.id === active.id);
    const newIndex = todos.findIndex((t) => t.id === over.id);
    const reordered = arrayMove(todos, oldIndex, newIndex);
    onReorder(reordered);
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={todos.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {todos.map((todo) => (
            <SortableTodoItem
              key={todo.id}
              todo={todo}
              onToggle={onToggle}
              onDelete={onDelete}
              onSelect={onSelect}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

function SortableTodoItem({
  todo,
  onToggle,
  onDelete,
  onSelect,
}: {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onSelect?: (todo: Todo) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: todo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div className="flex items-center gap-1">
        <button
          className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 px-1"
          {...attributes}
          {...listeners}
        >
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="9" cy="6" r="1.5" />
            <circle cx="15" cy="6" r="1.5" />
            <circle cx="9" cy="12" r="1.5" />
            <circle cx="15" cy="12" r="1.5" />
            <circle cx="9" cy="18" r="1.5" />
            <circle cx="15" cy="18" r="1.5" />
          </svg>
        </button>
        <div className="flex-1">
          <TodoItem
            todo={todo}
            onToggle={onToggle}
            onDelete={onDelete}
            onSelect={onSelect}
          />
        </div>
      </div>
    </div>
  );
}
