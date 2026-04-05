import Link from 'next/link';
import type { ListWithCounts } from '@/types/list';

interface ListCardProps {
  list: ListWithCounts;
}

export function ListCard({ list }: ListCardProps) {
  const completionPercent =
    list.todo_count > 0
      ? Math.round((list.completed_count / list.todo_count) * 100)
      : 0;

  return (
    <Link
      href={`/dashboard/lists/${list.id}`}
      className="block rounded-xl border border-gray-200 bg-white p-5 hover:border-gray-300 hover:shadow-sm transition-all"
    >
      <div className="flex items-center gap-3 mb-3">
        <span
          className="h-4 w-4 rounded-full flex-shrink-0"
          style={{ backgroundColor: list.color }}
        />
        <h3 className="font-semibold text-gray-900 truncate">{list.name}</h3>
      </div>
      {list.description && (
        <p className="text-sm text-gray-500 mb-3 line-clamp-2">{list.description}</p>
      )}
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-500">
          {list.completed_count}/{list.todo_count} tasks
        </span>
        <span className="text-gray-400">{completionPercent}%</span>
      </div>
      <div className="mt-2 h-1.5 rounded-full bg-gray-100 overflow-hidden">
        <div
          className="h-full rounded-full bg-indigo-500 transition-all"
          style={{ width: `${completionPercent}%` }}
        />
      </div>
    </Link>
  );
}
