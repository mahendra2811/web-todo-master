'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthModalStore } from '@/stores/auth-modal-store';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const openForgot = useAuthModalStore((s) => s.openForgot);

  useEffect(() => {
    router.replace('/');
    openForgot();
  }, [router, openForgot]);

  return null;
}
