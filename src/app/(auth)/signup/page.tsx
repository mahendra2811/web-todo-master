'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthModalStore } from '@/stores/auth-modal-store';

export default function SignupPage() {
  const router = useRouter();
  const openSignup = useAuthModalStore((s) => s.openSignup);

  useEffect(() => {
    router.replace('/');
    openSignup();
  }, [router, openSignup]);

  return null;
}
