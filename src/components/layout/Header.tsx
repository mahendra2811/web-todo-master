"use client";

import { useUIStore } from "@/stores/ui-store";

export function Header() {
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);

  return (
    <header className="flex h-14 items-center border-b border-gray-200 bg-white px-4 lg:hidden">
      <button onClick={toggleSidebar} className="text-gray-600 hover:text-gray-900">
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>
      <span className="ml-4 text-lg font-bold text-indigo-500">todoMasterAI</span>
    </header>
  );
}
