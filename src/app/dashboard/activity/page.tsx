import { ActivityFeed } from '@/components/activity/ActivityFeed';

export default function ActivityPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Activity</h1>
      <ActivityFeed />
    </div>
  );
}
