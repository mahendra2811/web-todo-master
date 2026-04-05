'use client';

import { useEffect } from 'react';
import { useUIStore } from '@/stores/ui-store';

export function useKeyboardShortcuts() {
  const setQuickAddOpen = useUIStore((s) => s.setQuickAddOpen);
  const setSearchOpen = useUIStore((s) => s.setSearchOpen);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const mod = e.metaKey || e.ctrlKey;
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

      // Cmd/Ctrl+K → Search
      if (mod && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
        return;
      }

      // Cmd/Ctrl+N → Quick Add (only if not typing in input)
      if (mod && e.key === 'n' && !isInput) {
        e.preventDefault();
        setQuickAddOpen(true);
        return;
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [setQuickAddOpen, setSearchOpen]);
}
