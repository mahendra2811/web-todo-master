'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthModalStore } from '@/stores/auth-modal-store';

export default function LoginPage() {
  const router = useRouter();
  const openLogin = useAuthModalStore((s) => s.openLogin);

  useEffect(() => {
    router.replace('/');
    openLogin();
  }, [router, openLogin]);

  return null;
}
