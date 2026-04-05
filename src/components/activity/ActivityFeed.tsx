'use client';

import { useActivityLog } from '@/hooks/use-activity-log';
import { ActivityItem } from './ActivityItem';
import { EmptyState } from '@/components/common/EmptyState';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export function ActivityFeed() {
  const { activities, loading } = useActivityLog();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <LoadingSpinner />
      </div>
    );
  }

  if (activities.length === 0) {
    return <EmptyState title="No activity yet" description="Actions will appear here as you use the app." />;
  }

  return (
    <div className="space-y-2">
      {activities.map((activity) => (
        <ActivityItem key={activity.id} activity={activity} />
      ))}
    </div>
  );
}
