import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'light' | 'dark' | 'auto';
export type Density = 'compact' | 'comfortable' | 'spacious';
export type ViewMode = 'list' | 'kanban' | 'calendar';

interface UIState {
  // Layout
  sidebarOpen: boolean;
  createListModalOpen: boolean;
  createTodoModalOpen: boolean;
  quickAddOpen: boolean;
  searchOpen: boolean;
  // Preferences
  theme: Theme;
  density: Density;
  viewMode: ViewMode;
  // Actions
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setCreateListModalOpen: (open: boolean) => void;
  setCreateTodoModalOpen: (open: boolean) => void;
  setQuickAddOpen: (open: boolean) => void;
  setSearchOpen: (open: boolean) => void;
  setTheme: (theme: Theme) => void;
  setDensity: (density: Density) => void;
  setViewMode: (viewMode: ViewMode) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      createListModalOpen: false,
      createTodoModalOpen: false,
      quickAddOpen: false,
      searchOpen: false,
      theme: 'light',
      density: 'comfortable',
      viewMode: 'list',
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setCreateListModalOpen: (open) => set({ createListModalOpen: open }),
      setCreateTodoModalOpen: (open) => set({ createTodoModalOpen: open }),
      setQuickAddOpen: (open) => set({ quickAddOpen: open }),
      setSearchOpen: (open) => set({ searchOpen: open }),
      setTheme: (theme) => set({ theme }),
      setDensity: (density) => set({ density }),
      setViewMode: (viewMode) => set({ viewMode }),
    }),
    {
      name: 'supatodo-ui',
      partialize: (state) => ({
        theme: state.theme,
        density: state.density,
        viewMode: state.viewMode,
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
);
