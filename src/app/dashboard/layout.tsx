'use client';

import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { CreateListModal } from '@/components/lists/CreateListModal';
import { useUIStore } from '@/stores/ui-store';
import { useLists } from '@/hooks/use-lists';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const createListModalOpen = useUIStore((s) => s.createListModalOpen);
  const setCreateListModalOpen = useUIStore((s) => s.setCreateListModalOpen);
  const { createList } = useLists();

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
      <CreateListModal
        open={createListModalOpen}
        onClose={() => setCreateListModalOpen(false)}
        onCreate={createList}
      />
    </div>
  );
}
