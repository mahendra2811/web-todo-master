import { create } from 'zustand';

interface UIState {
  sidebarOpen: boolean;
  createListModalOpen: boolean;
  createTodoModalOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setCreateListModalOpen: (open: boolean) => void;
  setCreateTodoModalOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  createListModalOpen: false,
  createTodoModalOpen: false,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setCreateListModalOpen: (open) => set({ createListModalOpen: open }),
  setCreateTodoModalOpen: (open) => set({ createTodoModalOpen: open }),
}));
