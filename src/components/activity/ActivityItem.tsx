import type { ActivityLog } from '@/types/activity';
import { formatRelative } from '@/lib/utils/dates';

const ACTION_LABELS: Record<string, string> = {
  todo_created: 'created a todo',
  todo_updated: 'updated a todo',
  todo_completed: 'completed a todo',
  todo_deleted: 'deleted a todo',
  list_created: 'created a list',
  list_updated: 'updated a list',
  list_deleted: 'deleted a list',
  subtask_created: 'added a subtask',
  subtask_completed: 'completed a subtask',
  subtask_deleted: 'removed a subtask',
};

interface ActivityItemProps {
  activity: ActivityLog;
}

export function ActivityItem({ activity }: ActivityItemProps) {
  const metadata = activity.metadata as Record<string, unknown>;
  const entityName = (metadata?.title || metadata?.name || '') as string;

  return (
    <div className="flex items-start gap-3 rounded-lg border border-gray-100 bg-white p-3">
      <div className="mt-0.5 h-2 w-2 rounded-full bg-indigo-400 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-700">
          <span className="font-medium">{ACTION_LABELS[activity.action] || activity.action}</span>
          {entityName && (
            <>
              {': '}
              <span className="text-gray-900 font-medium">{entityName}</span>
            </>
          )}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          {formatRelative(activity.created_at)}
        </p>
      </div>
    </div>
  );
}
