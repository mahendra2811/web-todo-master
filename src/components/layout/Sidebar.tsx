'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import { useLists } from '@/hooks/use-lists';
import { useUIStore } from '@/stores/ui-store';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/Button';

export function Sidebar() {
  const pathname = usePathname();
  const { lists, loading } = useLists();
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const setSidebarOpen = useUIStore((s) => s.setSidebarOpen);
  const setCreateListModalOpen = useUIStore((s) => s.setCreateListModalOpen);
  const setSearchOpen = useUIStore((s) => s.setSearchOpen);
  const { signOut } = useAuth();

  const activeLists = lists.filter((l) => !l.is_archived);
  const archivedLists = lists.filter((l) => l.is_archived);

  function handleNavClick() {
    // Close sidebar on mobile after navigation
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }

  return (
    <>
      {/* Mobile overlay backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-72 sm:w-64 flex-col border-r border-gray-200 bg-white transition-transform lg:static lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-14 items-center justify-between border-b border-gray-200 px-4">
          <Link href="/dashboard" className="text-lg font-bold text-indigo-500" onClick={handleNavClick}>
            SupaTodo
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 text-gray-400 hover:text-gray-600 lg:hidden"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          <Link
            href="/dashboard"
            onClick={handleNavClick}
            className={cn(
              'flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              pathname === '/dashboard'
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-gray-700 hover:bg-gray-100 active:bg-gray-200'
            )}
          >
            <svg className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Dashboard
          </Link>

          {/* Search button */}
          <button
            onClick={() => { setSearchOpen(true); handleNavClick(); }}
            className="flex items-center rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition-colors w-full"
          >
            <svg className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Search
            <kbd className="ml-auto text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded hidden sm:inline-block">⌘K</kbd>
          </button>

          <Link
            href="/dashboard/activity"
            onClick={handleNavClick}
            className={cn(
              'flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              pathname === '/dashboard/activity'
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-gray-700 hover:bg-gray-100 active:bg-gray-200'
            )}
          >
            <svg className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Activity
          </Link>

          {/* Active Lists */}
          <div className="pt-4">
            <div className="flex items-center justify-between px-3 mb-2">
              <span className="text-xs font-semibold uppercase text-gray-400">Lists</span>
              <button
                onClick={() => setCreateListModalOpen(true)}
                className="p-1 text-gray-400 hover:text-indigo-500 transition-colors"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>

            {loading ? (
              <div className="px-3 py-2 text-sm text-gray-400">Loading...</div>
            ) : activeLists.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-400">No lists yet</div>
            ) : (
              activeLists.map((list) => (
                <Link
                  key={list.id}
                  href={`/dashboard/lists/${list.id}`}
                  onClick={handleNavClick}
                  className={cn(
                    'flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    pathname === `/dashboard/lists/${list.id}`
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-gray-700 hover:bg-gray-100 active:bg-gray-200'
                  )}
                >
                  <span className="mr-3 flex-shrink-0 text-base">
                    {list.icon && list.icon !== 'list' ? (
                      list.icon
                    ) : (
                      <span
                        className="inline-block h-3 w-3 rounded-full"
                        style={{ backgroundColor: list.color }}
                      />
                    )}
                  </span>
                  <span className="truncate flex-1">{list.name}</span>
                  <span className="text-xs text-gray-400 ml-2">{list.todo_count}</span>
                </Link>
              ))
            )}
          </div>

          {/* Archived Lists */}
          {archivedLists.length > 0 && (
            <div className="pt-4">
              <div className="flex items-center px-3 mb-2">
                <span className="text-xs font-semibold uppercase text-gray-400">Archived</span>
              </div>
              {archivedLists.map((list) => (
                <Link
                  key={list.id}
                  href={`/dashboard/lists/${list.id}`}
                  onClick={handleNavClick}
                  className={cn(
                    'flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors opacity-60',
                    pathname === `/dashboard/lists/${list.id}`
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                >
                  <span className="mr-3 flex-shrink-0 text-base">
                    {list.icon && list.icon !== 'list' ? (
                      list.icon
                    ) : (
                      <span
                        className="inline-block h-3 w-3 rounded-full"
                        style={{ backgroundColor: list.color }}
                      />
                    )}
                  </span>
                  <span className="truncate flex-1">{list.name}</span>
                  <span className="text-xs text-gray-400 ml-1">📦</span>
                </Link>
              ))}
            </div>
          )}
        </nav>

        <div className="border-t border-gray-200 p-3 space-y-1">
          <Link
            href="/dashboard/settings"
            onClick={handleNavClick}
            className="flex items-center rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition-colors"
          >
            <svg className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Settings
          </Link>
          <Button variant="ghost" className="w-full justify-start" onClick={signOut}>
            <svg className="mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign out
          </Button>
        </div>
      </aside>
    </>
  );
}
