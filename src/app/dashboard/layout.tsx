'use client';

import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { CreateListModal } from '@/components/lists/CreateListModal';
import { QuickAdd } from '@/components/common/QuickAdd';
import { SearchModal } from '@/components/common/SearchModal';
import { useUIStore } from '@/stores/ui-store';
import { useLists } from '@/hooks/use-lists';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { useTheme } from '@/hooks/use-theme';
import { useOfflineSync } from '@/hooks/use-offline-sync';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const createListModalOpen = useUIStore((s) => s.createListModalOpen);
  const setCreateListModalOpen = useUIStore((s) => s.setCreateListModalOpen);
  const density = useUIStore((s) => s.density);
  const { createList } = useLists();

  useKeyboardShortcuts();
  useTheme();
  useOfflineSync();

  const densityClass =
    density === 'compact' ? 'p-3' : density === 'spacious' ? 'p-10' : 'p-6';

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className={`flex-1 overflow-y-auto ${densityClass}`}>{children}</main>
      </div>
      <CreateListModal
        open={createListModalOpen}
        onClose={() => setCreateListModalOpen(false)}
        onCreate={createList}
      />
      <QuickAdd />
      <SearchModal />
    </div>
  );
}
