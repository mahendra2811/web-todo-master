'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { loginSchema } from '@/lib/validators/auth';
import { toast } from 'sonner';
import Link from 'next/link';

export function LoginForm() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      toast.error(result.error.issues[0].message);
      return;
    }
    setLoading(true);
    try {
      await signIn(result.data);
      toast.success('Welcome back!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
          placeholder="you@example.com"
          required
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
          placeholder="••••••••"
          required
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Signing in...' : 'Sign in'}
      </button>
      <p className="text-center text-sm text-gray-600">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="text-indigo-500 hover:text-indigo-600 font-medium">
          Sign up
        </Link>
      </p>
    </form>
  );
}
