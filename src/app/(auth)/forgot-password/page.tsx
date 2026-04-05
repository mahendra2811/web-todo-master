'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email');
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      if (error) throw error;
      setSent(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="text-center py-4">
        <div className="mx-auto w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mb-4">
          <svg className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900">Check your email</h2>
        <p className="text-sm text-gray-500 mt-2 max-w-xs mx-auto">
          We sent a password reset link to <strong className="text-gray-700">{email}</strong>
        </p>
        <p className="text-xs text-gray-400 mt-3">Didn&apos;t receive it? Check your spam folder or try again.</p>
        <div className="mt-6 space-y-3">
          <button
            onClick={() => setSent(false)}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors min-h-[44px]"
          >
            Try another email
          </button>
          <Link
            href="/login"
            className="block w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white text-center hover:bg-indigo-700 transition-colors min-h-[44px] shadow-lg shadow-indigo-200"
          >
            Back to Sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <div className="mx-auto w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center mb-4">
          <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900">Reset your password</h2>
        <p className="text-sm text-gray-500 mt-1">Enter your email and we&apos;ll send you a reset link.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
            Email address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all placeholder:text-gray-400"
            placeholder="you@example.com"
            required
            autoFocus
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[44px] shadow-lg shadow-indigo-200"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Sending...
            </span>
          ) : (
            'Send reset link'
          )}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        Remember your password?{' '}
        <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  );
}
