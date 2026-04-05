'use client';

import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { AuthModal } from '@/components/auth/AuthModal';
import { useScrollFade } from '@/hooks/use-scroll-fade';

export function PublicShell({ children }: { children: React.ReactNode }) {
  useScrollFade();

  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <AuthModal />
    </>
  );
}
