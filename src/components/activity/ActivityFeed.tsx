'use client';

import { useActivityLog } from '@/hooks/use-activity-log';
import { ActivityItem } from './ActivityItem';
import { Pagination } from '@/components/ui/Pagination';
import { EmptyState } from '@/components/common/EmptyState';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export function ActivityFeed() {
  const { activities, loading, page, totalPages, total, goToPage } = useActivityLog();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <LoadingSpinner />
      </div>
    );
  }

  if (activities.length === 0 && page === 1) {
    return <EmptyState title="No activity yet" description="Actions will appear here as you use the app." />;
  }

  return (
    <div>
      <p className="text-xs text-gray-400 mb-3">{total} total activities</p>
      <div className="space-y-2">
        {activities.map((activity) => (
          <ActivityItem key={activity.id} activity={activity} />
        ))}
      </div>
      <Pagination currentPage={page} totalPages={totalPages} onPageChange={goToPage} />
    </div>
  );
}
