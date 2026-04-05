'use client';

import { useLists } from '@/hooks/use-lists';
import { ListCard } from '@/components/lists/ListCard';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/ui/Button';
import { useUIStore } from '@/stores/ui-store';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export default function DashboardPage() {
  const { lists, loading } = useLists();
  const setCreateListModalOpen = useUIStore((s) => s.setCreateListModalOpen);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
        <Button onClick={() => setCreateListModalOpen(true)}>New List</Button>
      </div>

      {lists.length === 0 ? (
        <EmptyState
          title="No lists yet"
          description="Create your first list to start organizing your tasks."
          action={
            <Button onClick={() => setCreateListModalOpen(true)}>
              Create List
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {lists.map((list) => (
            <ListCard key={list.id} list={list} />
          ))}
        </div>
      )}
    </div>
  );
}
