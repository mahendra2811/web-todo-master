import { create } from 'zustand';

type AuthView = 'login' | 'signup' | 'forgot';

interface AuthModalState {
  open: boolean;
  view: AuthView;
  openLogin: () => void;
  openSignup: () => void;
  openForgot: () => void;
  setView: (view: AuthView) => void;
  close: () => void;
}

export const useAuthModalStore = create<AuthModalState>((set) => ({
  open: false,
  view: 'login',
  openLogin: () => set({ open: true, view: 'login' }),
  openSignup: () => set({ open: true, view: 'signup' }),
  openForgot: () => set({ open: true, view: 'forgot' }),
  setView: (view) => set({ view }),
  close: () => set({ open: false }),
}));
